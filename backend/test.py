import os
from pathlib import Path
from dotenv import load_dotenv
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage
from azure.core.credentials import AzureKeyCredential

env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(env_path)
token = os.getenv("GITHUB_TOKEN", "").strip()

print({
    "token_exists": bool(token),
    "token_length": len(token),
    "token_prefix": token[:4] if token else "",
    "model": "openai/gpt-4o-mini",
    "env_path": str(env_path),
})

if not token:
    raise RuntimeError("GITHUB_TOKEN is not configured. Add it to backend/.env or the runtime environment.")

client = ChatCompletionsClient(
    endpoint="https://models.github.ai/inference",
    credential=AzureKeyCredential(token),
)

response = client.complete(
    model="openai/gpt-4o-mini",
    messages=[
        SystemMessage("You are a helpful assistant."),
        UserMessage("What is the capital of France?")
    ]
)

print(response.choices[0].message.content)
