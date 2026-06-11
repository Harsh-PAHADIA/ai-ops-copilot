import json
import logging
import re
from copy import deepcopy
from typing import Any, Dict

from app.services.llm_service import generate_response

logger = logging.getLogger(__name__)

DEFAULT_INTELLIGENCE: Dict[str, Any] = {
    "executive_insights": {
        "top_findings": [],
        "top_risks": [],
        "top_recommendations": [],
    },
    "risks": [],
    "roi": {
        "process_steps": "Estimate unavailable",
        "potential_step_reduction": "Estimate unavailable",
        "estimated_time_savings": "Estimate unavailable",
        "productivity_improvement": "Estimate unavailable",
        "operational_cost_reduction": "Estimate unavailable",
        "hours_saved": "Estimate unavailable",
        "efficiency_improvement_percent": "Estimate unavailable",
        "estimated_annual_cost_savings": "Estimate unavailable",
        "assumptions": ["AI estimate unavailable because structured analysis could not be generated."],
    },
}


def empty_process_intelligence(reason: str = "AI estimate unavailable.") -> Dict[str, Any]:
    fallback = deepcopy(DEFAULT_INTELLIGENCE)
    fallback["roi"] = {
        **DEFAULT_INTELLIGENCE["roi"],
        "assumptions": [reason],
    }
    return fallback


def _extract_json(text: str) -> Dict[str, Any]:
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if not match:
            raise
        return json.loads(match.group(0))


def _normalize_intelligence(data: Dict[str, Any]) -> Dict[str, Any]:
    normalized = deepcopy(DEFAULT_INTELLIGENCE)
    normalized["executive_insights"] = {
        **DEFAULT_INTELLIGENCE["executive_insights"],
        **data.get("executive_insights", {}),
    }
    normalized["risks"] = data.get("risks", [])
    normalized["roi"] = {
        **DEFAULT_INTELLIGENCE["roi"],
        **data.get("roi", {}),
    }
    return normalized


def generate_process_intelligence(content: str, primary_result: str, analysis_type: str) -> Dict[str, Any]:
    system_prompt = """
You are an enterprise process intelligence analyst.
Return only valid JSON. Do not include markdown, prose, comments, or code fences.

Analyze the provided business content and existing AI result. Generate:
1. Risk Assessment covering compliance risks, missing approvals, missing responsibilities,
missing deadlines, process bottlenecks, duplicate steps, operational risks, legal or policy
gaps, and resource dependency risks.
2. ROI & Efficiency Analysis with reasonable estimates when exact data is unavailable.
3. Executive Insights with top 3 findings, top 3 risks, and top 3 recommendations.

Use this exact JSON shape:
{
  "executive_insights": {
    "top_findings": ["finding 1", "finding 2", "finding 3"],
    "top_risks": ["risk 1", "risk 2", "risk 3"],
    "top_recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
  },
  "risks": [
    {
      "title": "Risk title",
      "severity": "Low | Medium | High",
      "explanation": "Business explanation",
      "mitigation": "Suggested mitigation"
    }
  ],
  "roi": {
    "process_steps": "estimated number",
    "potential_step_reduction": "estimated number or range",
    "estimated_time_savings": "estimated time saved",
    "productivity_improvement": "estimated percentage",
    "operational_cost_reduction": "estimated annual reduction",
    "hours_saved": "estimated hours saved",
    "efficiency_improvement_percent": "estimated percentage",
    "estimated_annual_cost_savings": "estimated amount",
    "assumptions": ["Clearly label each assumption as an estimate."]
  }
}
"""

    user_prompt = f"""
Analysis type: {analysis_type}

Original content:
{content}

Existing AI result:
{primary_result}
"""

    response = generate_response(user_prompt, system_prompt=system_prompt)
    if response.startswith("Error:"):
        logger.error("Process intelligence generation failed: %s", response)
        return empty_process_intelligence(response)

    try:
        return _normalize_intelligence(_extract_json(response))
    except Exception:
        logger.exception("Could not parse process intelligence response")
        return empty_process_intelligence(
            "AI generated an unreadable structured analysis. Treat this section as unavailable."
        )
