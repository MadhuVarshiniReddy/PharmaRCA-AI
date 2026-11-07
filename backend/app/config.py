import os
from pathlib import Path
from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parents[1]
ENV_FILE = BACKEND_DIR / ".env"

load_dotenv(ENV_FILE)

class Settings:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    GROQ_MODEL = "openai/gpt-oss-120b"

settings = Settings()