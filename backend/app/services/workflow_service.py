import json
import logging
import re
from typing import Any, Dict
from app.services.llm_service import generate_response

logger = logging.getLogger(__name__)

def _extract_json(text: str) -> Dict[str, Any]:
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Match anything between { and } including newlines
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if not match:
            raise
        return json.loads(match.group(0))

def generate_workflow_visualization(task_description: str, optimization_plan: str) -> Dict[str, Any]:
    system_prompt = """You are an expert systems and process automation architect.
Analyze the following manual process description and its proposed AI/GCP optimization plan.
Then, generate:
1. A Mermaid flowchart (TD/top-down) representing the original "current" manual workflow.
2. A Mermaid flowchart (TD/top-down) representing the "optimized" automated workflow.
3. A list of bottlenecks in the current process, their severity/risk level, and mitigation recommendations.

You MUST respond ONLY with a valid JSON object. Do not include markdown code block formatting (like ```json), prose, explanations, or comments.

JSON Schema:
{
  "current_workflow": "flowchart TD\\nA[Manual Data Entry] --> B{Manager Approval}\\nB -->|Approved| C[Database Update]\\nB -->|Rejected| D[Notify Applicant]",
  "optimized_workflow": "flowchart TD\\nA[Form Submission] --> B[AI Data Validation]\\nB --> C[GCP Automated Approval]\\nC --> D[Database Auto-Sync]",
  "bottlenecks": [
    {
      "name": "Manager Review Queue",
      "type": "approval",
      "risk_level": "High",
      "recommendation": "Use automated validation for standard cases and route exception review only."
    }
  ]
}

Mermaid Flowchart Syntax Guidelines:
- Only use TD (Top-Down) flowcharts.
- Do NOT use unescaped double quotes inside labels. Use square brackets for standard steps, e.g., A[Label], and curly braces/rhombuses for decisions, e.g., B{Decision Label}.
- Keep node names simple (A, B, C, etc.) and write the labels within brackets/curly braces.
- Return the Mermaid flowchart code as a single string, escaping newlines properly as '\\n'.
"""

    user_prompt = f"""
Manual Process Description:
{task_description}

Proposed Optimization Plan:
{optimization_plan}
"""

    response = generate_response(user_prompt, system_prompt=system_prompt)
    if response.startswith("Error:"):
        logger.error("Workflow visualization LLM call failed: %s", response)
        return {
            "current_workflow": "",
            "optimized_workflow": "",
            "bottlenecks": []
        }

    try:
        data = _extract_json(response)
        return {
            "current_workflow": data.get("current_workflow", ""),
            "optimized_workflow": data.get("optimized_workflow", ""),
            "bottlenecks": data.get("bottlenecks", [])
        }
    except Exception:
        logger.exception("Failed to parse workflow visualization JSON: %s", response)
        return {
            "current_workflow": "",
            "optimized_workflow": "",
            "bottlenecks": []
        }
