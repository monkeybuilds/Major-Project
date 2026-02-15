from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from database.connection import get_db
from models.user import User
from auth.jwt_handler import hash_password, verify_password, create_access_token
from auth.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ---------- Schemas ----------

class SignUpRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_name: str
    user_email: str


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str


# ---------- Routes ----------

@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignUpRequest, db: Session = Depends(get_db)):
    """Register a new user."""
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    user = User(
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"user_id": user.id, "email": user.email})
    return TokenResponse(
        access_token=token,
        user_name=user.full_name,
        user_email=user.email,
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user and return JWT."""
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token({"user_id": user.id, "email": user.email})
    return TokenResponse(
        access_token=token,
        user_name=user.full_name,
        user_email=user.email,
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user profile."""
    return UserResponse(
        id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
    )
