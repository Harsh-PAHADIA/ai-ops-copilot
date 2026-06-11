from fastapi import APIRouter
from pydantic import BaseModel
from app.services.llm_service import generate_response
from app.services.process_intelligence_service import empty_process_intelligence, generate_process_intelligence

router = APIRouter()

class WorkflowRequest(BaseModel):
    task_description: str

@router.post("/workflow/optimize")
def optimize_workflow(req: WorkflowRequest):
    system_prompt = "You are a Corporate Engineer. Analyze the following manual process and suggest a detailed automation plan using AI and GCP."
    response = generate_response(req.task_description, system_prompt=system_prompt)
    if response.startswith("Error:"):
        intelligence = empty_process_intelligence(response)
    else:
        intelligence = generate_process_intelligence(
            content=req.task_description,
            primary_result=response,
            analysis_type="workflow_optimization",
        )
    
    return {
        "task": req.task_description,
        "optimization_plan": response,
        "intelligence": intelligence,
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
