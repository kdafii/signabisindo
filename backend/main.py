"""
BISINDO Learning API
====================
Endpoints:
  POST  /register
  POST  /login
  GET   /users/{user_id}
  PATCH /users/{user_id}
  POST  /quiz-attempts
  GET   /quiz-attempts
  POST  /predict
  POST  /predict/batch
"""

import json
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from core.database import Base, engine

# module-level ML state (diisi saat lifespan startup)
ml_model = None
ml_label_map: dict = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    global ml_model, ml_label_map

    # ── Buat tabel jika belum ada ──
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Database tables ready")

    # ── Load ML model ──
    model_path = Path(settings.model_path)
    label_path = Path(settings.label_map_path)

    if model_path.exists() and label_path.exists():
        import tensorflow as tf

        print("Loading ML model...")
        ml_model = tf.keras.models.load_model(str(model_path))
        with open(label_path) as f:
            ml_label_map = json.load(f)
        print(f"✅ Model loaded — {len(ml_label_map)} kelas")
    else:
        print("⚠️  Model/label file tidak ditemukan — endpoint /predict tidak aktif")

    yield

    # ── Cleanup ──
    await engine.dispose()
    print("Engine disposed")


app = FastAPI(
    title="BISINDO Learning API",
    description="API untuk website pembelajaran BISINDO dengan evaluasi gestur real-time",
    version="3.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # ganti dengan domain frontend di production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register routers ──
from routers import auth, predict, quiz_attempts, users  # noqa: E402

app.include_router(auth.router)           # /auth/register, /auth/login
app.include_router(users.router)          # /users/{user_id}
app.include_router(quiz_attempts.router)  # /quiz-attempts
app.include_router(predict.router)        # /predict, /predict/batch


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "BISINDO API v3 is running"}


@app.get("/health", tags=["Health"])
def health():
    return {
        "status": "ok",
        "model_loaded": ml_model is not None,
        "num_classes": len(ml_label_map),
    }