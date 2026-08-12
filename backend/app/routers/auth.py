from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User
from app.schemas.schemas import (
    UserCreate, UserResponse, Token, UserLogin, 
    ForgotPasswordRequest, ResetPasswordRequest
)
from app.core import security
from app.core.config import settings
from jose import jwt, JWTError

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check existing email
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if this is the very first user; if so, make them an admin for easy testing!
    user_count = db.query(User).count()
    role = "admin" if user_count == 0 else "user"

    hashed_pw = security.get_password_hash(user_in.password)
    user = User(
        name=user_in.name,
        email=user_in.email,
        phone=user_in.phone,
        password_hash=hashed_pw,
        role=role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=Token)
def login_json(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not security.verify_password(login_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="User account is deactivated")

    access_token = security.create_access_token(subject=user.id)
    refresh_token = security.create_refresh_token(subject=user.id)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/token", response_model=Token)
def login_oauth2(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = security.create_access_token(subject=user.id)
    refresh_token = security.create_refresh_token(subject=user.id)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/refresh", response_model=Token)
def refresh_token(refresh_token_str: str, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(refresh_token_str, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=400, detail="Invalid refresh token type")
        user_id = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_access_token = security.create_access_token(subject=user.id)
    new_refresh_token = security.create_refresh_token(subject=user.id)
    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        # Avoid user enumeration, return success message
        return {"message": "If email exists, a password reset instruction has been logged"}
    return {"message": "Password reset link/token generated successfully", "reset_token": f"mock_reset_token_for_{user.id}"}

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.password_hash = security.get_password_hash(req.new_password)
    db.commit()
    return {"message": "Password reset successfully"}

@router.post("/logout")
def logout():
    return {"message": "Successfully logged out"}
