from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from deps.auth import get_current_user_id
from models.models import QuizAttempt, QuizLevel, User
from schemas.schemas import QuizAttemptCreate, QuizAttemptResponse

router = APIRouter(prefix="/quiz-attempts", tags=["Quiz Attempts"])


@router.post(
    "",
    response_model=QuizAttemptResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Simpan hasil quiz attempt",
)
async def create_attempt(
    body: QuizAttemptCreate,
    db: AsyncSession = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    # validasi user ada
    user = await db.get(User, body.user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User tidak ditemukan")

    # validasi quiz_level ada
    level = await db.get(QuizLevel, body.quiz_level_id)
    if not level:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz level tidak ditemukan")

    attempt = QuizAttempt(
        user_id=current_user_id,
        quiz_level_id=body.quiz_level_id,
        completed_questions=body.completed_questions,
        skipped_count=body.skipped_count,
        duration_seconds=body.duration_seconds,
        started_at=body.started_at or datetime.now(timezone.utc),
        completed_at=body.completed_at,
    )
    db.add(attempt)
    await db.flush()
    await db.refresh(attempt)
    return attempt


@router.get(
    "",
    response_model=list[QuizAttemptResponse],
    summary="Ambil daftar quiz attempt (filter by user_id atau quiz_level_id)",
)
async def list_attempts(
    user_id: int | None = Query(None, description="Filter by user"),
    quiz_level_id: int | None = Query(None, description="Filter by quiz level"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    _: int = Depends(get_current_user_id),
):
    stmt = select(QuizAttempt)
    if user_id is not None:
        stmt = stmt.where(QuizAttempt.user_id == user_id)
    if quiz_level_id is not None:
        stmt = stmt.where(QuizAttempt.quiz_level_id == quiz_level_id)
    stmt = stmt.order_by(QuizAttempt.started_at.desc()).limit(limit).offset(offset)

    result = await db.execute(stmt)
    return result.scalars().all()