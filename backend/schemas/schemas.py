from datetime import datetime

from pydantic import BaseModel, Field, field_validator


# ══════════════════════════════════════════
#  AUTH
# ══════════════════════════════════════════
class RegisterRequest(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=6)


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int


# ══════════════════════════════════════════
#  USER
# ══════════════════════════════════════════
class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    username: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserUpdateRequest(BaseModel):
    first_name: str | None = Field(None, min_length=1, max_length=100)
    last_name: str | None = Field(None, min_length=1, max_length=100)


# ══════════════════════════════════════════
#  QUIZ ATTEMPT
# ══════════════════════════════════════════
class QuizAttemptCreate(BaseModel):
    user_id: int
    quiz_level_id: int
    completed_questions: int = Field(0, ge=0)
    skipped_count: int = Field(0, ge=0)
    duration_seconds: int | None = Field(None, ge=0)
    started_at: datetime | None = None
    completed_at: datetime | None = None


class QuizAttemptResponse(BaseModel):
    id: int
    user_id: int
    quiz_level_id: int
    completed_questions: int
    skipped_count: int
    duration_seconds: int | None
    started_at: datetime
    completed_at: datetime | None

    model_config = {"from_attributes": True}


# ══════════════════════════════════════════
#  PREDICT
# ══════════════════════════════════════════
class LandmarkRequest(BaseModel):
    """
    h0_landmarks : 63 float — tangan pertama  (21 landmark × x,y,z)
    h1_landmarks : 63 float — tangan kedua    (21 landmark × x,y,z)
    """
    h0_landmarks: list[float] = Field(..., min_length=63, max_length=63)
    h1_landmarks: list[float] = Field(..., min_length=63, max_length=63)


class Top3Item(BaseModel):
    label: str
    confidence: float


class PredictionResponse(BaseModel):
    predicted_label: str
    confidence: float
    top3: list[Top3Item]