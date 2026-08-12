from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User, Income, Expense, Budget, SavingsGoal
from app.schemas.schemas import UserResponse
from app.routers.deps import get_current_admin_user

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    return db.query(User).order_by(User.created_at.desc()).all()

@router.put("/users/{user_id}/status")
def toggle_user_status(
    user_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin_user.id:
        raise HTTPException(status_code=400, detail="Cannot block your own admin account")
    
    user.is_active = is_active
    db.commit()
    return {"message": f"User status updated to {'Active' if is_active else 'Blocked'}"}

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own admin account")

    db.delete(user)
    db.commit()
    return {"message": "User permanently removed by admin"}

@router.get("/system-metrics")
def get_system_metrics(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    total_incomes = db.query(Income).count()
    total_expenses = db.query(Expense).count()
    total_budgets = db.query(Budget).count()
    total_savings_goals = db.query(SavingsGoal).count()

    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_incomes_logged": total_incomes,
        "total_expenses_logged": total_expenses,
        "active_budgets": total_budgets,
        "savings_goals_tracked": total_savings_goals
    }
