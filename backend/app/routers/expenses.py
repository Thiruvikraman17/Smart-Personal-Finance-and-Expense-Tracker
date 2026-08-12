from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Expense, User, Budget, Notification
from app.schemas.schemas import ExpenseCreate, ExpenseUpdate, ExpenseResponse
from app.routers.deps import get_current_user
import random

router = APIRouter(prefix="/expenses", tags=["Expenses"])

EXPENSE_CATEGORIES = [
    "Food", "Transport", "Shopping", "Education", 
    "Bills", "Healthcare", "Entertainment", "Travel", "Rent", "Other"
]

PAYMENT_METHODS = ["Cash", "Credit Card", "Debit Card", "UPI", "Bank Transfer"]

@router.get("/categories")
def get_categories():
    return EXPENSE_CATEGORIES

@router.get("/payment-methods")
def get_payment_methods():
    return PAYMENT_METHODS

@router.get("/", response_model=List[ExpenseResponse])
def list_expenses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    category: Optional[str] = None,
    payment_method: Optional[str] = None,
    search: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    sort_by: Optional[str] = Query("transaction_date", enum=["transaction_date", "amount", "category"]),
    sort_dir: Optional[str] = Query("desc", enum=["asc", "desc"])
):
    query = db.query(Expense).filter(Expense.user_id == current_user.id)
    
    if category:
        query = query.filter(Expense.category == category)
    if payment_method:
        query = query.filter(Expense.payment_method == payment_method)
    if search:
        query = query.filter(Expense.description.ilike(f"%{search}%"))
    if start_date:
        query = query.filter(Expense.transaction_date >= start_date)
    if end_date:
        query = query.filter(Expense.transaction_date <= end_date)

    sort_column = getattr(Expense, sort_by, Expense.transaction_date)
    if sort_dir == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    return query.all()

@router.post("/", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(
    expense_in: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    t_date = expense_in.transaction_date or datetime.utcnow()
    expense = Expense(
        user_id=current_user.id,
        amount=expense_in.amount,
        category=expense_in.category,
        description=expense_in.description,
        payment_method=expense_in.payment_method or "Cash",
        transaction_date=t_date
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)

    # Check budget alerts for this month/year/category
    budget = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.category == expense.category,
        Budget.month == t_date.month,
        Budget.year == t_date.year
    ).first()

    if budget:
        # Calculate total spent in this category for this month
        total_spent = sum(
            e.amount for e in db.query(Expense).filter(
                Expense.user_id == current_user.id,
                Expense.category == expense.category
            ).all() if e.transaction_date.month == t_date.month and e.transaction_date.year == t_date.year
        )
        if total_spent > budget.monthly_limit:
            # Create notification
            notif = Notification(
                user_id=current_user.id,
                message=f"⚠️ Budget Alert! You exceeded your ${budget.monthly_limit:.2f} limit for {expense.category} (Spent: ${total_spent:.2f}).",
                status="unread"
            )
            db.add(notif)
            db.commit()

    return expense

@router.post("/scan-receipt")
async def scan_receipt(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    # Simulated AI OCR scanning logic
    categories = EXPENSE_CATEGORIES
    methods = PAYMENT_METHODS
    simulated_amount = round(random.uniform(12.50, 145.00), 2)
    simulated_category = random.choice(["Food", "Shopping", "Bills", "Entertainment"])
    simulated_method = random.choice(methods)

    return {
        "merchant": f"Store #{random.randint(100, 999)}",
        "amount": simulated_amount,
        "category": simulated_category,
        "payment_method": simulated_method,
        "description": f"Scanned receipt from {file.filename}",
        "confidence": 0.94
    }

@router.get("/{expense_id}", response_model=ExpenseResponse)
def get_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == current_user.id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense entry not found")
    return expense

@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: int,
    expense_in: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == current_user.id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense entry not found")
    
    if expense_in.amount is not None:
        expense.amount = expense_in.amount
    if expense_in.category is not None:
        expense.category = expense_in.category
    if expense_in.description is not None:
        expense.description = expense_in.description
    if expense_in.payment_method is not None:
        expense.payment_method = expense_in.payment_method
    if expense_in.transaction_date is not None:
        expense.transaction_date = expense_in.transaction_date

    db.commit()
    db.refresh(expense)
    return expense

@router.delete("/{expense_id}")
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == current_user.id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense entry not found")
    db.delete(expense)
    db.commit()
    return {"message": "Expense entry deleted"}
