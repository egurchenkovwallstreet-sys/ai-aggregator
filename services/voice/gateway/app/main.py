from __future__ import annotations

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import Response
from pydantic import BaseModel, Field

from app import stt_engine, tts_engine

app = FastAPI(title="AI Aggregator Voice Gateway", version="0.1.0")


class TtsRequest(BaseModel):
    text: str = Field(min_length=1, max_length=4_000)


@app.get("/health")
def health() -> dict[str, object]:
    stt = stt_engine.stt_status()
    tts = tts_engine.tts_status()
    ok = stt.get("ready") and tts.get("ready")
    return {
        "ok": ok,
        "provider": "voice-gateway",
        "stt": stt,
        "tts": tts,
    }


@app.post("/stt")
async def speech_to_text(audio: UploadFile = File(...)) -> dict[str, str]:
    payload = await audio.read()
    if not payload:
        raise HTTPException(status_code=400, detail="Пустой файл audio.")
    try:
        return stt_engine.transcribe_bytes(payload, audio.filename or "audio.webm")
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    except Exception as error:  # noqa: BLE001
        raise HTTPException(status_code=503, detail="STT недоступен.") from error


@app.post("/tts")
def text_to_speech(body: TtsRequest) -> Response:
    try:
        wav = tts_engine.synthesize_wav(body.text.strip())
    except Exception as error:  # noqa: BLE001
        raise HTTPException(status_code=503, detail="TTS недоступен.") from error
    return Response(content=wav, media_type="audio/wav")
