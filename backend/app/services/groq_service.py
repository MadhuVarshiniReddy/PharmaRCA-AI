from groq import Groq
from app.config import settings


def get_groq_client():
    if not settings.GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is missing from backend/.env")

    return Groq(api_key=settings.GROQ_API_KEY)


def generate_ai_response(prompt: str) -> str:
    client = get_groq_client()

    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are PharmaRCA AI, an assistant for "
                    "pharmaceutical manufacturing deviation analysis. "
                    "Provide evidence-based suggestions. Never claim "
                    "a root cause is confirmed without sufficient evidence. "
                    "Clearly identify missing evidence and require "
                    "qualified human review."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2,
        max_tokens=2000
    )

    return response.choices[0].message.content