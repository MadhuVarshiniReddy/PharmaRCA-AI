
import json

from app.services.groq_service import generate_ai_response


def extract_capa_recommendations(rca_report: str) -> list:
    """
    Extract structured CAPA recommendations from an RCA report.
    """

    prompt = f"""
You are PharmaRCA AI, assisting pharmaceutical
manufacturing deviation investigations.

Extract the corrective and preventive actions from
the CAPA section of the RCA report below.

RCA REPORT:
{rca_report}

STRICT RULES:

1. Extract only actions explicitly recommended in the report.
2. Do not invent additional CAPA recommendations.
3. Classify each action as Corrective or Preventive.
4. Preserve the original meaning of each recommendation.
5. Extract the rationale only when it is provided.
6. Extract effectiveness checks only when explicitly provided.
7. Use null for unavailable information.
8. Do not assign employees or due dates.
9. Return valid JSON only, without Markdown.

Return this JSON structure:

{{
    "capas": [
        {{
            "action_type": "Corrective",
            "description": "Action description",
            "rationale": "Reason for the action or null",
            "effectiveness_check": "Verification method or null"
        }}
    ]
}}
"""

    response = generate_ai_response(prompt)

    try:
        result = json.loads(response)

        if not isinstance(result, dict):
            raise ValueError("AI response must be a JSON object.")

        capas = result.get("capas")

        if not isinstance(capas, list):
            raise ValueError("CAPA list is missing or invalid.")

        for capa in capas:
            if not isinstance(capa, dict):
                raise ValueError("Invalid CAPA record.")

            if capa.get("action_type") not in [
                "Corrective",
                "Preventive"
            ]:
                raise ValueError("Invalid CAPA action type.")

            if not isinstance(capa.get("description"), str):
                raise ValueError("CAPA description is missing.")

            if not capa["description"].strip():
                raise ValueError("CAPA description cannot be empty.")

        return capas

    except json.JSONDecodeError as error:
        raise ValueError(
            "AI returned invalid JSON while extracting CAPA recommendations."
        ) from error
