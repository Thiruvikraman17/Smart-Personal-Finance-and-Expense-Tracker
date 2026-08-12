from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import SavingsGoal, User, Notification
from app.schemas.schemas import SavingsGoalCreate, SavingsGoalUpdate, SavingsGoalResponse
from app.routers.deps import get_current_user

router = APIRouter(prefix="/savings", tags=["Savings Goals"])

@router.get("/", response_model=List[SavingsGoalResponse])
def list_savings_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goals = db.query(SavingsGoal).filter(SavingsGoal.user_id == current_user.id).all()
    res = []
    for g in goals:
        prog = (g.saved_amount / g.target_amount * 100) if g.target_amount > 0 else 0.0
        res.append({
            "id": g.id,
            "user_id": g.user_id,
            "goal_name": g.goal_name,
            "target_amount": g.target_amount,
            "saved_amount": g.saved_amount,
            "target_date": g.target_date,
            "progress_percentage": round(min(prog, 100.0), 2)
        })
    return res

@router.post("/", response_model=SavingsGoalResponse, status_code=status.HTTP_201_CREATED)
def create_savings_goal(
    goal_in: SavingsGoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = SavingsGoal(
        user_id=current_user.id,
        goal_name=goal_in.goal_name,
        target_amount=goal_in.target_amount,
        saved_amount=goal_in.saved_amount or 0.0,
        target_date=goal_in.target_date
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)

    prog = (goal.saved_amount / goal.target_amount * 100) if goal.target_amount > 0 else 0.0
    return {
        "id": goal.id,
        "user_id": goal.user_id,
        "goal_name": goal.goal_name,
        "target_amount": goal.target_amount,
        "saved_amount": goal.saved_amount,
        "target_date": goal.target_date,
        "progress_percentage": round(min(prog, 100.0), 2)
    }

@router.put("/{goal_id}", response_model=SavingsGoalResponse)
def update_savings_goal(
    goal_id: int,
    goal_in: SavingsGoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = db.query(SavingsGoal).filter(SavingsGoal.id == goal_id, SavingsGoal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Savings goal not found")

    was_completed = goal.saved_amount >= goal.target_amount

    if goal_in.goal_name is not None:
        goal.goal_name = goal_in.goal_name
    if goal_in.target_amount is not None:
        goal.target_amount = goal_in.target_amount
    if goal_in.saved_amount is not None:
        goal.saved_amount = goal_in.saved_amount
    if goal_in.target_date is not None:
        goal.target_date = goal_in.target_date

    db.commit()
    db.refresh(goal)

    is_completed = goal.saved_amount >= goal.target_amount
    if is_completed and not was_completed:
        notif = Notification(
            user_id=current_user.id,
            message=f"🎉 Congratulations! You reached your savings goal '{goal.goal_name}' of ${goal.target_amount:.2f}!",
            status="unread"
        )
        db.add(notif)
        db.commit()

    prog = (goal.saved_amount / goal.target_amount * 100) if goal.target_amount > 0 else 0.0
    return {
        "id": goal.id,
        "user_id": goal.user_id,
        "goal_name": goal.goal_name,
        "target_amount": goal.target_amount,
        "saved_amount": goal.saved_amount,
        "target_date": goal.target_date,
        "progress_percentage": round(min(prog, 100.0), 2)
    }

@router.delete("/{goal_id}")
def delete_savings_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = db.query(SavingsGoal).filter(SavingsGoal.id == goal_id, SavingsGoal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Savings goal not found")
    db.delete(goal)
    db.commit()
    return {"message": "Savings goal deleted"}
