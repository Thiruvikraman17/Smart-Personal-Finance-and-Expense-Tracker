from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Budget, Expense, User
from app.schemas.schemas import BudgetCreate, BudgetUpdate, BudgetResponse
from app.routers.deps import get_current_user

router = APIRouter(prefix="/budgets", tags=["Budgets"])

@router.get("/", response_model=List[BudgetResponse])
def list_budgets(
    month: int = datetime.utcnow().month,
    year: int = datetime.utcnow().year,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    budgets = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.month == month,
        Budget.year == year
    ).all()

    # Calculate actual spent for each budget category
    result = []
    for b in budgets:
        expenses = db.query(Expense).filter(
            Expense.user_id == current_user.id,
            Expense.category == b.category
        ).all()
        
        spent = sum(
            e.amount for e in expenses 
            if e.transaction_date.month == month and e.transaction_date.year == year
        )
        utilization = (spent / b.monthly_limit * 100) if b.monthly_limit > 0 else 0.0

        b_dict = {
            "id": b.id,
            "user_id": b.user_id,
            "category": b.category,
            "monthly_limit": b.monthly_limit,
            "month": b.month,
            "year": b.year,
            "spent": round(spent, 2),
            "utilization_percentage": round(utilization, 2)
        }
        result.append(b_dict)

    return result

@router.post("/", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
def create_or_update_budget(
    budget_in: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.category == budget_in.category,
        Budget.month == budget_in.month,
        Budget.year == budget_in.year
    ).first()

    if existing:
        existing.monthly_limit = budget_in.monthly_limit
        db.commit()
        db.refresh(existing)
        target_budget = existing
    else:
        new_b = Budget(
            user_id=current_user.id,
            category=budget_in.category,
            monthly_limit=budget_in.monthly_limit,
            month=budget_in.month,
            year=budget_in.year
        )
        db.add(new_b)
        db.commit()
        db.refresh(new_b)
        target_budget = new_b

    expenses = db.query(Expense).filter(
        Expense.user_id == current_user.id,
        Expense.category == target_budget.category
    ).all()
    spent = sum(
        e.amount for e in expenses 
        if e.transaction_date.month == target_budget.month and e.transaction_date.year == target_budget.year
    )
    utilization = (spent / target_budget.monthly_limit * 100) if target_budget.monthly_limit > 0 else 0.0

    return {
        "id": target_budget.id,
        "user_id": target_budget.user_id,
        "category": target_budget.category,
        "monthly_limit": target_budget.monthly_limit,
        "month": target_budget.month,
        "year": target_budget.year,
        "spent": round(spent, 2),
        "utilization_percentage": round(utilization, 2)
    }

@router.delete("/{budget_id}")
def delete_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    b = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == current_user.id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Budget not found")
    db.delete(b)
    db.commit()
    return {"message": "Budget allocation deleted"}
