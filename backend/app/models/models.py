from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_order=True, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="user") # 'user' or 'admin'
    is_active = Column(Boolean, default=True)
    profile_image = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    incomes = relationship("Income", back_populates="user", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="user", cascade="all, delete-orphan")
    budgets = relationship("Budget", back_populates="user", cascade="all, delete-orphan")
    savings_goals = relationship("SavingsGoal", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class Income(Base):
    __tablename__ = "income"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String(50), nullable=False)
    description = Column(String(255), nullable=True)
    transaction_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="incomes")

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String(50), nullable=False)
    description = Column(String(255), nullable=True)
    payment_method = Column(String(50), default="Cash")
    transaction_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="expenses")

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String(50), nullable=False)
    monthly_limit = Column(Float, nullable=False)
    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="budgets")

class SavingsGoal(Base):
    __tablename__ = "savings_goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    goal_name = Column(String(100), nullable=False)
    target_amount = Column(Float, nullable=False)
    saved_amount = Column(Float, default=0.0)
    target_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="savings_goals")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(String(255), nullable=False)
    status = Column(String(20), default="unread") # 'read' or 'unread'
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")
