import os
from pathlib import Path

DATA_DIR = Path(os.environ.get("VOICE_DATA_DIR", "/data"))
WHISPER_MODEL = os.environ.get("WHISPER_MODEL", "small")
WHISPER_DEVICE = os.environ.get("WHISPER_DEVICE", "cpu")
WHISPER_COMPUTE_TYPE = os.environ.get("WHISPER_COMPUTE_TYPE", "int8")
PIPER_VOICE = os.environ.get("PIPER_VOICE", "ru_RU-dmitri-medium")

PIPER_DIR = DATA_DIR / "piper"
PIPER_VOICE_URL = (
    "https://huggingface.co/rhasspy/piper-voices/resolve/main/ru/ru_RU/"
    "dmitri/medium/ru_RU-dmitri-medium.onnx"
)
PIPER_CONFIG_URL = (
    "https://huggingface.co/rhasspy/piper-voices/resolve/main/ru/ru_RU/"
    "dmitri/medium/ru_RU-dmitri-medium.onnx.json"
)
