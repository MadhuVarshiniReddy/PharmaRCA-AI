
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict

from app.database import get_db
from app.models.deviation import RCAAnalysis, CAPA
from app.schemas.capa import CAPACreate, CAPAResponse
from app.services.capa_extraction_service import (
    extract_capa_recommendations
)

router = APIRouter(
    prefix="/api/capa",
    tags=["Corrective and Preventive Actions"]
)


# Fields that can be edited during CAPA review
class CAPAUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    description: str | None = None
    rationale: str | None = None
    effectiveness_check: str | None = None


@router.post("/", response_model=CAPAResponse, status_code=201)
def create_capa(
    capa_data: CAPACreate,
    db: Session = Depends(get_db)
):
    analysis = db.query(RCAAnalysis).filter(
        RCAAnalysis.id == capa_data.analysis_id
    ).first()

    if not analysis:
        raise HTTPException(
            status_code=404,
            detail="RCA analysis not found"
        )

    new_capa = CAPA(**capa_data.model_dump())

    db.add(new_capa)
    db.commit()
    db.refresh(new_capa)

    return new_capa


# Update an existing CAPA
@router.put("/{capa_id}", response_model=CAPAResponse)
def update_capa(
    capa_id: int,
    update_data: CAPAUpdate,
    db: Session = Depends(get_db)
):
    capa = db.query(CAPA).filter(
        CAPA.id == capa_id
    ).first()

    if not capa:
        raise HTTPException(
            status_code=404,
            detail="CAPA not found"
        )

    updates = update_data.model_dump(exclude_unset=True)

    if not updates:
        raise HTTPException(
            status_code=400,
            detail="No fields provided for update."
        )

    if "description" in updates:
        if updates["description"] is None or not updates["description"].strip():
            raise HTTPException(
                status_code=422,
                detail="Recommended action cannot be empty."
            )

        updates["description"] = updates["description"].strip()

    for field, value in updates.items():
        setattr(capa, field, value)

    try:
        db.commit()
        db.refresh(capa)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to update CAPA."
        )

    return capa


@router.get("/{capa_id}", response_model=CAPAResponse)
def get_capa(
    capa_id: int,
    db: Session = Depends(get_db)
):
    capa = db.query(CAPA).filter(
        CAPA.id == capa_id
    ).first()

    if not capa:
        raise HTTPException(
            status_code=404,
            detail="CAPA not found"
        )

    return capa


@router.post("/generate/{analysis_id}")
def generate_and_save_capas(
    analysis_id: int,
    db: Session = Depends(get_db)
):
    analysis = db.query(RCAAnalysis).filter(
        RCAAnalysis.id == analysis_id
    ).first()

    if not analysis:
        raise HTTPException(
            status_code=404,
            detail="RCA analysis not found"
        )

    if not analysis.ai_summary:
        raise HTTPException(
            status_code=400,
            detail="RCA report is empty. Generate an RCA first."
        )

    # Prevent duplicate CAPA generation
    existing_capas = db.query(CAPA).filter(
        CAPA.analysis_id == analysis_id
    ).all()

    if existing_capas:
        return {
            "message": "CAPAs have already been generated for this analysis.",
            "analysis_id": analysis_id,
            "total_capas": len(existing_capas),
            "capas": [
                CAPAResponse.model_validate(capa).model_dump(mode="json")
                for capa in existing_capas
            ]
        }

    # Extract CAPA recommendations using AI
    try:
        capa_recommendations = extract_capa_recommendations(
            analysis.ai_summary
        )
    except ValueError as error:
        raise HTTPException(
            status_code=502,
            detail=str(error)
        )
    except Exception:
        raise HTTPException(
            status_code=502,
            detail="AI CAPA extraction failed. Please try again."
        )

    if not capa_recommendations:
        raise HTTPException(
            status_code=422,
            detail="No CAPA recommendations were found in the RCA report."
        )

    # Save CAPA records
    new_capas = []

    try:
        for recommendation in capa_recommendations:
            capa = CAPA(
                analysis_id=analysis_id,
                action_type=recommendation["action_type"],
                description=recommendation["description"],
                rationale=recommendation.get("rationale"),
                effectiveness_check=recommendation.get(
                    "effectiveness_check"
                ),
                assigned_to=None,
                due_date=None,
                status="Proposed"
            )

            new_capas.append(capa)

        db.add_all(new_capas)
        db.commit()

        for capa in new_capas:
            db.refresh(capa)

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to save CAPA recommendations."
        )

    return {
        "message": "AI-generated CAPA recommendations saved successfully.",
        "analysis_id": analysis_id,
        "total_capas": len(new_capas),
        "review_required": True,
        "capas": [
            CAPAResponse.model_validate(capa).model_dump(mode="json")
            for capa in new_capas
        ]
    }
