from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User
from app.schemas.schemas import UserResponse, UserUpdate, UserPasswordUpdate
from app.routers.deps import get_current_user
from app.core import security

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
def update_profile(
    user_in: UserUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if user_in.name is not None:
        current_user.name = user_in.name
    if user_in.phone is not None:
        current_user.phone = user_in.phone
    if user_in.profile_image is not None:
        current_user.profile_image = user_in.profile_image

    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/me/password")
def change_password(
    password_in: UserPasswordUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if not security.verify_password(password_in.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    current_user.password_hash = security.get_password_hash(password_in.new_password)
    db.commit()
    return {"message": "Password updated successfully"}

@router.delete("/me")
def delete_account(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    db.delete(current_user)
    db.commit()
    return {"message": "Account permanently deleted"}
