import os
from pathlib import Path
from dotenv import load_dotenv

ENV_PATH = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(ENV_PATH)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "").strip()
GITHUB_ENDPOINT = os.getenv("GITHUB_ENDPOINT", "https://models.github.ai/inference")
GITHUB_MODEL = os.getenv("GITHUB_MODEL", "openai/gpt-4o-mini")


def github_token_debug_info():
    return {
        "token_exists": bool(GITHUB_TOKEN),
        "token_length": len(GITHUB_TOKEN),
        "token_prefix": GITHUB_TOKEN[:4] if GITHUB_TOKEN else "",
        "endpoint": GITHUB_ENDPOINT,
        "model": GITHUB_MODEL,
        "env_path": str(ENV_PATH),
    }
