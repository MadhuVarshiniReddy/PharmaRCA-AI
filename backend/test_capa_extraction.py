
import json

from app.database import SessionLocal
from app.models.deviation import RCAAnalysis
from app.services.capa_extraction_service import (
    extract_capa_recommendations
)

db = SessionLocal()

try:
    # Step 1: Retrieve the saved RCA report
    analysis = db.query(RCAAnalysis).filter(
        RCAAnalysis.id == 3
    ).first()

    if not analysis:
        raise ValueError("RCA Analysis ID 3 was not found.")

    if not analysis.ai_summary:
        raise ValueError("The RCA report is empty.")

    # Step 2: Extract CAPA recommendations using Groq AI
    capas = extract_capa_recommendations(
        analysis.ai_summary
    )

    # Step 3: Display structured CAPA records
    print("\n========== AI EXTRACTED CAPA RECOMMENDATIONS ==========\n")

    print(json.dumps(capas, indent=4))

    print(f"\nTotal CAPA recommendations: {len(capas)}")
    print("\n========== CAPA EXTRACTION SUCCESSFUL ==========")

except Exception as error:
    print("CAPA extraction failed:", error)

finally:
    db.close()
