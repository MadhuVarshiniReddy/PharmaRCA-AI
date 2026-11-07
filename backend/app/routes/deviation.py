
from pathlib import Path
from uuid import uuid4

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File
)
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.deviation import Deviation
from app.schemas.deviation import (
    DeviationCreate,
    DeviationResponse
)

from app.services.document_service import extract_text_from_pdf
from app.services.deviation_extraction_service import (
    extract_deviation_details
)


router = APIRouter(
    prefix="/api/deviations",
    tags=["Deviations"]
)


# --------------------------------------------------
# 1. CREATE A NEW DEVIATION
# --------------------------------------------------

@router.post(
    "/",
    response_model=DeviationResponse,
    status_code=201
)
def create_deviation(
    deviation_data: DeviationCreate,
    db: Session = Depends(get_db)
):
    existing = db.query(Deviation).filter(
        Deviation.deviation_code == deviation_data.deviation_code
    ).first()

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Deviation code already exists"
        )

    new_deviation = Deviation(
        **deviation_data.model_dump()
    )

    db.add(new_deviation)
    db.commit()
    db.refresh(new_deviation)

    return new_deviation


# --------------------------------------------------
# 2. GET ALL DEVIATIONS
# --------------------------------------------------

@router.get(
    "/",
    response_model=list[DeviationResponse]
)
def get_deviations(
    db: Session = Depends(get_db)
):
    return db.query(Deviation).order_by(
        Deviation.created_at.desc()
    ).all()


# --------------------------------------------------
# 3. GET DEVIATION BY ID
# --------------------------------------------------

@router.get(
    "/{deviation_id}",
    response_model=DeviationResponse
)
def get_deviation(
    deviation_id: int,
    db: Session = Depends(get_db)
):
    deviation = db.query(Deviation).filter(
        Deviation.id == deviation_id
    ).first()

    if not deviation:
        raise HTTPException(
            status_code=404,
            detail="Deviation not found"
        )

    return deviation


# --------------------------------------------------
# 4. UPLOAD PDF AND EXTRACT DEVIATION DETAILS USING AI
# --------------------------------------------------

@router.post("/upload-pdf")
async def upload_deviation_pdf(
    file: UploadFile = File(...)
):

    # Validate filename and extension
    if (
        not file.filename
        or not file.filename.lower().endswith(".pdf")
    ):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported."
        )

    upload_dir = Path("uploads")
    upload_dir.mkdir(
        parents=True,
        exist_ok=True
    )

    file_path = upload_dir / f"{uuid4().hex}.pdf"

    try:
        # Read uploaded file
        contents = await file.read()

        if not contents:
            raise HTTPException(
                status_code=400,
                detail="The uploaded PDF is empty."
            )

        # Validate PDF signature
        if not contents.startswith(b"%PDF-"):
            raise HTTPException(
                status_code=400,
                detail="Invalid PDF file."
            )

        # Save PDF temporarily
        file_path.write_bytes(contents)

        # Step 1: Extract text using PyMuPDF
        extracted_text = extract_text_from_pdf(
            str(file_path)
        )

        # Step 2: Extract structured information using Groq AI
        ai_extracted_details = extract_deviation_details(
            extracted_text
        )

        # Step 3: Return extracted information
        return {
            "message": (
                "PDF uploaded and AI extraction "
                "completed successfully."
            ),
            "filename": file.filename,
            "extracted_text": extracted_text,
            "ai_extracted_details": ai_extracted_details,
            "requires_human_review": True
        }

    except HTTPException:
        raise

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"PDF processing failed: {str(error)}"
        )

    finally:
        # Delete temporary PDF after processing
        if file_path.exists():
            file_path.unlink()

        await file.close()
