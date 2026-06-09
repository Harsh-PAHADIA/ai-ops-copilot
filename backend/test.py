import os
from dotenv import load_dotenv
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage
from azure.core.credentials import AzureKeyCredential

load_dotenv()

client = ChatCompletionsClient(
    endpoint="https://models.github.ai/inference",
    credential=AzureKeyCredential(os.getenv("GITHUB_TOKEN")),
)

response = client.complete(
    model="openai/gpt-4o-mini",
    messages=[
        SystemMessage("You are a helpful assistant."),
        UserMessage("What is the capital of France?")
    ]
)

print(response.choices[0].message.content)