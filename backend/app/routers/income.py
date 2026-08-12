from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Income, User
from app.schemas.schemas import IncomeCreate, IncomeUpdate, IncomeResponse
from app.routers.deps import get_current_user

router = APIRouter(prefix="/income", tags=["Income"])

INCOME_CATEGORIES = ["Salary", "Freelance", "Business", "Investment", "Bonus", "Other"]

@router.get("/categories")
def get_categories():
    return INCOME_CATEGORIES

@router.get("/", response_model=List[IncomeResponse])
def list_incomes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    category: Optional[str] = None,
    search: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    sort_by: Optional[str] = Query("transaction_date", enum=["transaction_date", "amount", "category"]),
    sort_dir: Optional[str] = Query("desc", enum=["asc", "desc"])
):
    query = db.query(Income).filter(Income.user_id == current_user.id)
    
    if category:
        query = query.filter(Income.category == category)
    if search:
        query = query.filter(Income.description.ilike(f"%{search}%"))
    if start_date:
        query = query.filter(Income.transaction_date >= start_date)
    if end_date:
        query = query.filter(Income.transaction_date <= end_date)

    sort_column = getattr(Income, sort_by, Income.transaction_date)
    if sort_dir == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    return query.all()

@router.post("/", response_model=IncomeResponse, status_code=status.HTTP_201_CREATED)
def create_income(
    income_in: IncomeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    income = Income(
        user_id=current_user.id,
        amount=income_in.amount,
        category=income_in.category,
        description=income_in.description,
        transaction_date=income_in.transaction_date or datetime.utcnow()
    )
    db.add(income)
    db.commit()
    db.refresh(income)
    return income

@router.get("/{income_id}", response_model=IncomeResponse)
def get_income(
    income_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    income = db.query(Income).filter(Income.id == income_id, Income.user_id == current_user.id).first()
    if not income:
        raise HTTPException(status_code=404, detail="Income entry not found")
    return income

@router.put("/{income_id}", response_model=IncomeResponse)
def update_income(
    income_id: int,
    income_in: IncomeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    income = db.query(Income).filter(Income.id == income_id, Income.user_id == current_user.id).first()
    if not income:
        raise HTTPException(status_code=404, detail="Income entry not found")
    
    if income_in.amount is not None:
        income.amount = income_in.amount
    if income_in.category is not None:
        income.category = income_in.category
    if income_in.description is not None:
        income.description = income_in.description
    if income_in.transaction_date is not None:
        income.transaction_date = income_in.transaction_date

    db.commit()
    db.refresh(income)
    return income

@router.delete("/{income_id}")
def delete_income(
    income_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    income = db.query(Income).filter(Income.id == income_id, Income.user_id == current_user.id).first()
    if not income:
        raise HTTPException(status_code=404, detail="Income entry not found")
    db.delete(income)
    db.commit()
    return {"message": "Income entry deleted"}
