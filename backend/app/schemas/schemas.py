from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# Auth Schemas
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class TokenPayload(BaseModel):
    sub: Optional[int] = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str

# User Schemas
class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    profile_image: Optional[str] = None

class UserPasswordUpdate(BaseModel):
    current_password: str
    new_password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    role: str
    is_active: bool
    profile_image: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Income Schemas
class IncomeCreate(BaseModel):
    amount: float = Field(..., gt=0)
    category: str
    description: Optional[str] = None
    transaction_date: Optional[datetime] = None

class IncomeUpdate(BaseModel):
    amount: Optional[float] = Field(None, gt=0)
    category: Optional[str] = None
    description: Optional[str] = None
    transaction_date: Optional[datetime] = None

class IncomeResponse(BaseModel):
    id: int
    user_id: int
    amount: float
    category: str
    description: Optional[str] = None
    transaction_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True

# Expense Schemas
class ExpenseCreate(BaseModel):
    amount: float = Field(..., gt=0)
    category: str
    description: Optional[str] = None
    payment_method: Optional[str] = "Cash"
    transaction_date: Optional[datetime] = None

class ExpenseUpdate(BaseModel):
    amount: Optional[float] = Field(None, gt=0)
    category: Optional[str] = None
    description: Optional[str] = None
    payment_method: Optional[str] = None
    transaction_date: Optional[datetime] = None

class ExpenseResponse(BaseModel):
    id: int
    user_id: int
    amount: float
    category: str
    description: Optional[str] = None
    payment_method: str
    transaction_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True

# Budget Schemas
class BudgetCreate(BaseModel):
    category: str
    monthly_limit: float = Field(..., gt=0)
    month: int = Field(..., ge=1, le=12)
    year: int = Field(..., ge=2000, le=2100)

class BudgetUpdate(BaseModel):
    monthly_limit: Optional[float] = Field(None, gt=0)

class BudgetResponse(BaseModel):
    id: int
    user_id: int
    category: str
    monthly_limit: float
    month: int
    year: int
    spent: Optional[float] = 0.0
    utilization_percentage: Optional[float] = 0.0

    class Config:
        from_attributes = True

# Savings Goal Schemas
class SavingsGoalCreate(BaseModel):
    goal_name: str
    target_amount: float = Field(..., gt=0)
    saved_amount: Optional[float] = 0.0
    target_date: datetime

class SavingsGoalUpdate(BaseModel):
    goal_name: Optional[str] = None
    target_amount: Optional[float] = Field(None, gt=0)
    saved_amount: Optional[float] = Field(None, ge=0)
    target_date: Optional[datetime] = None

class SavingsGoalResponse(BaseModel):
    id: int
    user_id: int
    goal_name: str
    target_amount: float
    saved_amount: float
    target_date: datetime
    progress_percentage: Optional[float] = 0.0

    class Config:
        from_attributes = True

# Notification Schemas
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    message: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Dashboard & Financial Summary Schemas
class FinancialSummary(BaseModel):
    total_income: float
    total_expenses: float
    total_savings: float
    remaining_budget: float
    monthly_spending: float
    current_balance: float
    financial_health_score: float
    health_score_label: str
