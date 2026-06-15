from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.security import create_access_token, hash_password, verify_password
from models.models import User
from schemas.schemas import LoginRequest, RegisterRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Daftar akun baru",
)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # cek username sudah dipakai
    existing = await db.scalar(select(User).where(User.username == body.username))
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Username '{body.username}' sudah digunakan",
        )

    user = User(
        first_name=body.first_name,
        last_name=body.last_name,
        username=body.username,
        password=hash_password(body.password),
    )
    db.add(user)
    await db.flush()   # dapatkan id tanpa commit dulu
    await db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, user_id=user.id)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login dan dapatkan JWT",
)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    user = await db.scalar(select(User).where(User.username == body.username))
    if not user or not verify_password(body.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username atau password salah",
        )

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, user_id=user.id)