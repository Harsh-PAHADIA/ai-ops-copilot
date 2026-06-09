from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.llm_service import generate_response

router = APIRouter()

class DocumentRequest(BaseModel):
    content: str
    action: str = "summarize" # summarize, extract_tasks, analyze_sentiment

@router.post("/document/analyze")
def analyze_document(req: DocumentRequest):
    prompts = {
        "summarize": "Summarize this internal document for a corporate engineer. Focus on operational impacts.",
        "extract_tasks": "Extract all actionable tasks and owners from this document. Format as a JSON list.",
        "analyze_sentiment": "Analyze the sentiment of this internal communication and identify potential friction points."
    }
    
    system_prompt = prompts.get(req.action, prompts["summarize"])
    response = generate_response(req.content, system_prompt=system_prompt)
    
    return {
        "action": req.action,
        "analysis": response
    }
