import numpy as np
from fastapi import APIRouter, HTTPException, status

from schemas.schemas import LandmarkRequest, PredictionResponse, Top3Item

router = APIRouter(prefix="/predict", tags=["Inference"])


# ── Helper ──
def _normalize_hand(x: np.ndarray) -> np.ndarray:
    """(1, 21, 3) → normalized (1, 21, 3)"""
    x = x - x[:, 0:1, :]
    scale = np.max(np.abs(x), axis=(1, 2), keepdims=True) + 1e-6
    return x / scale


def _preprocess(h0_raw: list[float], h1_raw: list[float]) -> np.ndarray:
    h0 = np.array(h0_raw, dtype=np.float32).reshape(1, 21, 3)
    h1 = np.array(h1_raw, dtype=np.float32).reshape(1, 21, 3)
    return np.concatenate([_normalize_hand(h0), _normalize_hand(h1)], axis=1)  # (1, 42, 3)


def _run_inference(model, label_map: dict, req: LandmarkRequest) -> PredictionResponse:
    x = _preprocess(req.h0_landmarks, req.h1_landmarks)
    probs = model.predict(x, verbose=0)[0]
    idx = int(np.argmax(probs))

    top3 = [
        Top3Item(label=label_map[str(i)], confidence=round(float(probs[i]), 4))
        for i in np.argsort(probs)[::-1][:3]
    ]
    return PredictionResponse(
        predicted_label=label_map[str(idx)],
        confidence=round(float(probs[idx]), 4),
        top3=top3,
    )


# ── Endpoints ──
@router.post(
    "",
    response_model=PredictionResponse,
    summary="Prediksi huruf BISINDO dari landmark 2 tangan",
)
def predict(req: LandmarkRequest):
    """
    Input 126 angka dari MediaPipe (h0: 63 + h1: 63).
    Urutan tiap tangan: [x0,y0,z0, x1,y1,z1, ..., x20,y20,z20]
    """
    from main import ml_model, ml_label_map   # lazy import hindari circular

    if ml_model is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Model belum siap")

    return _run_inference(ml_model, ml_label_map, req)


@router.post(
    "/batch",
    summary="Prediksi banyak frame sekaligus",
)
def predict_batch(requests: list[LandmarkRequest]):
    from main import ml_model, ml_label_map

    if ml_model is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Model belum siap")

    return {
        "results": [
            _run_inference(ml_model, ml_label_map, req).model_dump()
            for req in requests
        ]
    }