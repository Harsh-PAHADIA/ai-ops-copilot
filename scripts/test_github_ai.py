import os
from pathlib import Path
from dotenv import load_dotenv
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage
from azure.core.credentials import AzureKeyCredential

endpoint = "https://models.github.ai/inference"
model = "openai/gpt-5"
env_path = Path(__file__).resolve().parents[1] / "backend" / ".env"
load_dotenv(env_path)
token = os.getenv("GITHUB_TOKEN", "").strip()

print({
    "token_exists": bool(token),
    "token_length": len(token),
    "token_prefix": token[:4] if token else "",
    "model": model,
    "env_path": str(env_path),
})

if not token:
    raise RuntimeError("GITHUB_TOKEN is not configured. Add it to backend/.env or the runtime environment.")

client = ChatCompletionsClient(
    endpoint=endpoint,
    credential=AzureKeyCredential(token),
)

response = client.complete(
    messages=[
        SystemMessage(""),
        UserMessage("What is the capital of France?"),
    ],
    model=model
)

print(response.choices[0].message.content)
