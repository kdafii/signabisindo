from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.security import hash_password
from deps.auth import get_current_user_id
from models.models import User
from schemas.schemas import UserResponse, UserUpdateRequest

router = APIRouter(prefix="/users", tags=["Users"])


@router.get(
    "/{user_id}",
    response_model=UserResponse,
    summary="Ambil profil user",
)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    _: int = Depends(get_current_user_id),   # harus login
):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User tidak ditemukan")
    return user


@router.patch(
    "/{user_id}",
    response_model=UserResponse,
    summary="Update profil user (partial)",
)
async def update_user(
    user_id: int,
    body: UserUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    # hanya boleh update diri sendiri
    if current_user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Akses ditolak")

    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User tidak ditemukan")

    
    updates = body.model_dump(exclude_none=True)

    for field, value in updates.items():
        setattr(user, field, value)

    await db.flush()
    await db.refresh(user)
    return user