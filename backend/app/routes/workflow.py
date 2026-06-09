from fastapi import APIRouter
from pydantic import BaseModel
from app.services.llm_service import generate_response

router = APIRouter()

class WorkflowRequest(BaseModel):
    task_description: str

@router.post("/workflow/optimize")
def optimize_workflow(req: WorkflowRequest):
    system_prompt = "You are a Corporate Engineer. Analyze the following manual process and suggest a detailed automation plan using AI and GCP."
    response = generate_response(req.task_description, system_prompt=system_prompt)
    
    return {
        "task": req.task_description,
        "optimization_plan": response
    }

@router.get("/workflows/common")
def get_common_workflows():
    return {
        "workflows": [
            {"id": "w1", "name": "Employee Onboarding Automation", "impact": "High"},
            {"id": "w2", "name": "Expense Report Verification", "impact": "Medium"},
            {"id": "w3", "name": "IT Asset Lifecycle Management", "impact": "High"},
            {"id": "w4", "name": "Legal Document Version Control", "impact": "Medium"}
        ]
    }
