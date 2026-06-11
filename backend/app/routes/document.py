from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.llm_service import generate_response
from app.services.process_intelligence_service import empty_process_intelligence, generate_process_intelligence

router = APIRouter()

class DocumentRequest(BaseModel):
    content: str
    action: str = "summarize" # summarize, extract_tasks, analyze_sentiment

@router.post("/document/analyze")
def analyze_document(req: DocumentRequest):
    prompts = {
        "summarize": "Summarize this internal document for a corporate engineer. Focus on operational impacts.",
        "extract_tasks": """Extract all actionable tasks and owners from this document.
Return a valid JSON array of objects.
Use this exact JSON shape (no markdown formatting, no comments, no code fences):
[
  {
    "task": "Actionable task description",
    "owner": "Name or role of the owner (if any)"
  }
]
""",
        "analyze_sentiment": """Analyze the document for confidential data, PII, compliance risks, credentials, and sensitive content.
Return a valid JSON array of objects, each representing a flagged item.
Use this exact JSON shape (no markdown formatting, no comments, no code fences):
[
  {
    "finding": "Brief description of the sensitive item found",
    "type": "PII | Credential | Compliance | Confidentiality",
    "severity": "Low | Medium | High | Critical",
    "recommendation": "Actionable recommendation to mitigate the risk"
  }
]
"""
    }
    
    system_prompt = prompts.get(req.action, prompts["summarize"])
    response = generate_response(req.content, system_prompt=system_prompt)
    if response.startswith("Error:"):
        intelligence = empty_process_intelligence(response)
    else:
        intelligence = generate_process_intelligence(
            content=req.content,
            primary_result=response,
            analysis_type=f"document_{req.action}",
        )
    
    return {
        "action": req.action,
        "analysis": response,
        "intelligence": intelligence,
    }
