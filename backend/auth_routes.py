"""
Simple Authentication Routes (Open Access Mode)
Handles basic login without actual Supabase authentication
In open-access mode, any username/password combination is accepted
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from supabase_client import supabase

router = APIRouter(prefix="/auth", tags=["authentication"])

# ==================== Models ====================
class LoginRequest(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    email: str
    password: str
    username: Optional[str] = None

class LoginResponse(BaseModel):
    success: bool
    token: Optional[str] = None
    username: Optional[str] = None
    email: Optional[str] = None
    user_id: Optional[str] = None
    error: Optional[str] = None

class SignupResponse(BaseModel):
    success: bool
    message: str
    user_id: Optional[str] = None
    email: Optional[str] = None
    error: Optional[str] = None

# ==================== Endpoints ====================

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """
    Login user with email and password using Supabase Auth
    """
    try:
        response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password,
        })
        
        if not response.session:
            return LoginResponse(
                success=False,
                error="Invalid email or password"
            )
        
        return LoginResponse(
            success=True,
            token=response.session.access_token,
            email=response.user.email if response.user else request.email,
            username=request.email.split('@')[0],
            user_id=response.user.id if response.user else None
        )
    except Exception as e:
        return LoginResponse(
            success=False,
            error=f"Login failed: {str(e)}"
        )

@router.post("/signup", response_model=SignupResponse)
async def signup(request: SignupRequest):
    """
    Register a new user with Supabase Auth
    """
    try:
        response = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password,
            "options": {
                "data": {
                    "username": request.username or request.email.split('@')[0]
                }
            }
        })
        
        if response.user:
            return SignupResponse(
                success=True,
                message="User registered successfully. Check your email for confirmation.",
                user_id=response.user.id,
                email=response.user.email
            )
        else:
            return SignupResponse(
                success=False,
                message="Signup failed",
                error="Unknown error occurred"
            )
    except Exception as e:
        return SignupResponse(
            success=False,
            message="Signup failed",
            error=str(e)
        )

@router.post("/logout")
async def logout():
    """
    Logout endpoint (frontend handles token removal)
    """
    return {
        "success": True,
        "message": "Logged out successfully"
    }

@router.get("/status")
async def auth_status():
    """
    Check authentication status
    """
    return {
        "auth_enabled": True,
        "auth_mode": "supabase",
        "message": "Supabase authentication is enabled"
    }
