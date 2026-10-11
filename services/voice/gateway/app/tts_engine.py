from __future__ import annotations

import io
import wave
from pathlib import Path
from typing import Any

import httpx
from piper import PiperVoice

from app.config import PIPER_CONFIG_URL, PIPER_DIR, PIPER_VOICE, PIPER_VOICE_URL

_voice: PiperVoice | None = None
_last_error: str | None = None


def _download(url: str, target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.exists() and target.stat().st_size > 0:
        return
    with httpx.stream("GET", url, follow_redirects=True, timeout=120.0) as response:
        response.raise_for_status()
        with target.open("wb") as handle:
            for chunk in response.iter_bytes():
                handle.write(chunk)


def _voice_paths() -> tuple[Path, Path]:
    model_path = PIPER_DIR / f"{PIPER_VOICE}.onnx"
    config_path = PIPER_DIR / f"{PIPER_VOICE}.onnx.json"
    return model_path, config_path


def _load_voice() -> PiperVoice:
    global _voice, _last_error
    if _voice is not None:
        return _voice
    try:
        model_path, config_path = _voice_paths()
        _download(PIPER_VOICE_URL, model_path)
        _download(PIPER_CONFIG_URL, config_path)
        _voice = PiperVoice.load(model_path, config_path=config_path)
        _last_error = None
        return _voice
    except Exception as error:  # noqa: BLE001
        _last_error = str(error)
        raise


def tts_status() -> dict[str, Any]:
    model_path, _ = _voice_paths()
    downloaded = model_path.exists()
    ready = _voice is not None and _last_error is None
    return {
        "ready": ready,
        "voice": PIPER_VOICE,
        "downloaded": downloaded,
        "error": _last_error,
    }


def synthesize_wav(text: str) -> bytes:
    voice = _load_voice()
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wav_file:
        voice.synthesize(text, wav_file)
    return buffer.getvalue()
