
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.deviation import Deviation, RCAAnalysis
from app.schemas.rca import (
    RCAAnalysisCreate,
    RCAAnalysisResponse
)
from app.ai.rca_graph import run_rca


router = APIRouter(
    prefix="/api/rca",
    tags=["Root Cause Analysis"]
)


# 1. Create an RCA record
@router.post("/", response_model=RCAAnalysisResponse, status_code=201)
def create_rca(
    rca_data: RCAAnalysisCreate,
    db: Session = Depends(get_db)
):
    deviation = db.query(Deviation).filter(
        Deviation.id == rca_data.deviation_id
    ).first()

    if not deviation:
        raise HTTPException(
            status_code=404,
            detail="Deviation not found"
        )

    new_analysis = RCAAnalysis(
        deviation_id=rca_data.deviation_id,
        method=rca_data.method,
        problem_statement=rca_data.problem_statement
    )

    db.add(new_analysis)
    db.commit()
    db.refresh(new_analysis)

    return new_analysis


# 2. Retrieve an RCA record
@router.get("/{analysis_id}", response_model=RCAAnalysisResponse)
def get_rca(
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

    return analysis


# 3. Generate AI-powered RCA and save it
@router.post("/{deviation_id}/analyze")
def analyze_deviation(
    deviation_id: int,
    method: str = "5 Whys",
    db: Session = Depends(get_db)
):

    if method not in ["5 Whys", "Fishbone"]:
        raise HTTPException(
            status_code=400,
            detail="Method must be '5 Whys' or 'Fishbone'"
        )

    deviation = db.query(Deviation).filter(
        Deviation.id == deviation_id
    ).first()

    if not deviation:
        raise HTTPException(
            status_code=404,
            detail="Deviation not found"
        )

    try:
        result = run_rca(
            deviation_description=deviation.description,
            method=method
        )

        analysis = RCAAnalysis(
            deviation_id=deviation.id,
            method=method,
            problem_statement=deviation.title,
            ai_summary=result,
            findings={"report": result},
            review_status="Pending Review"
        )

        db.add(analysis)
        db.commit()
        db.refresh(analysis)

        return {
            "message": "AI RCA generated successfully",
            "analysis_id": analysis.id,
            "deviation_id": deviation.id,
            "method": method,
            "review_status": analysis.review_status,
            "analysis_report": result
        }

    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"AI analysis failed: {str(error)}"
        )
