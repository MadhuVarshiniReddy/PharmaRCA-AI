
import json

from app.services.groq_service import generate_ai_response


def extract_deviation_details(document_text: str) -> dict:
    prompt = f"""
You are an assistant for pharmaceutical API manufacturing
deviation management.

Extract the following information from the provided document:

1. deviation_code
2. title
3. description
4. product_name
5. batch_number
6. process_stage
7. severity

Rules:
- Extract only information explicitly supported by the document.
- Do not invent missing information.
- Use null for unavailable fields.
- Severity must be Low, Medium, High, or Critical if stated
  or clearly supported by the document.
- Return only valid JSON. Do not include Markdown.

Document:
{document_text}

Required JSON format:
{{
    "deviation_code": null,
    "title": null,
    "description": null,
    "product_name": null,
    "batch_number": null,
    "process_stage": null,
    "severity": null
}}
"""

    response = generate_ai_response(prompt)

    try:
        return json.loads(response)
    except json.JSONDecodeError:
        raise ValueError(
            "AI returned an invalid JSON response. Please try again."
        )
