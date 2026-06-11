import json
import os
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from dotenv import load_dotenv

env_path = Path(__file__).resolve().parents[1] / "backend" / ".env"
load_dotenv(env_path)

token = os.getenv("GITHUB_TOKEN", "").strip()
endpoint = os.getenv("GITHUB_ENDPOINT", "https://models.github.ai/inference").rstrip("/")
model = os.getenv("GITHUB_MODEL", "openai/gpt-4o-mini")
api_version = os.getenv("GITHUB_API_VERSION", "2026-03-10")

print({
    "token_exists": bool(token),
    "token_length": len(token),
    "token_prefix": token[:4] if token else "",
    "endpoint": endpoint,
    "model": model,
    "api_version": api_version,
    "env_path": str(env_path),
})

if not token:
    raise RuntimeError("GITHUB_TOKEN is not configured. Add it to backend/.env or the runtime environment.")

payload = {
    "model": model,
    "messages": [
        {"role": "user", "content": "What is the capital of France?"},
    ],
}

request = Request(
    f"{endpoint}/chat/completions",
    data=json.dumps(payload).encode("utf-8"),
    headers={
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": api_version,
    },
    method="POST",
)

try:
    with urlopen(request, timeout=60) as response:
        data = json.loads(response.read().decode("utf-8"))
        print(data["choices"][0]["message"]["content"])
except HTTPError as exc:
    body = exc.read().decode("utf-8", errors="replace")
    print({"status": exc.code, "reason": exc.reason, "body": body})
    raise
