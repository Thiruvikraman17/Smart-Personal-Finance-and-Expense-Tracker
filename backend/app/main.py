from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.session import engine, Base
from app.routers import (
    auth, users, income, expenses, 
    budgets, savings, notifications, analytics, admin
)

# Initialize database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for React frontend cross-origin requests
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(income.router, prefix=settings.API_V1_STR)
app.include_router(expenses.router, prefix=settings.API_V1_STR)
app.include_router(budgets.router, prefix=settings.API_V1_STR)
app.include_router(savings.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API!",
        "docs": "/docs",
        "health": "healthy"
    }
