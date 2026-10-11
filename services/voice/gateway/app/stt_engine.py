from __future__ import annotations

import tempfile
from pathlib import Path
from typing import Any

from faster_whisper import WhisperModel

from app.config import WHISPER_COMPUTE_TYPE, WHISPER_DEVICE, WHISPER_MODEL

_model: WhisperModel | None = None
_last_error: str | None = None


def _load_model() -> WhisperModel:
    global _model, _last_error
    if _model is not None:
        return _model
    try:
        _model = WhisperModel(
            WHISPER_MODEL,
            device=WHISPER_DEVICE,
            compute_type=WHISPER_COMPUTE_TYPE,
        )
        _last_error = None
        return _model
    except Exception as error:  # noqa: BLE001 — фиксируем для /health
        _last_error = str(error)
        raise


def stt_status() -> dict[str, Any]:
    ready = _model is not None and _last_error is None
    return {
        "ready": ready,
        "model": WHISPER_MODEL,
        "error": _last_error,
    }


def transcribe_bytes(payload: bytes, filename: str) -> dict[str, str]:
    suffix = Path(filename).suffix or ".webm"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=True) as tmp:
        tmp.write(payload)
        tmp.flush()
        model = _load_model()
        segments, info = model.transcribe(
            tmp.name,
            language="ru",
            vad_filter=True,
        )
        text = "".join(segment.text for segment in segments).strip()
    if not text:
        raise ValueError("Пустая расшифровка.")
    language = info.language or "ru"
    return {"text": text, "language": language}
