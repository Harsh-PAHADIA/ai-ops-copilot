from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage
from azure.core.credentials import AzureKeyCredential
from app.config import GITHUB_TOKEN, GITHUB_ENDPOINT, GITHUB_MODEL

client = ChatCompletionsClient(
    endpoint=GITHUB_ENDPOINT,
    credential=AzureKeyCredential(GITHUB_TOKEN),
)

def generate_response(user_input: str, system_prompt: str = "You are an AI assistant that helps employees automate tasks."):
    """
    Generate a response using GitHub Models (GPT-5).
    """
    try:
        response = client.complete(
            messages=[
                SystemMessage(system_prompt),
                UserMessage(user_input),
            ],
            model=GITHUB_MODEL
        )
        return response.choices[0].message.content

    except Exception as e:
        return f"Error: {str(e)}"