
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import engine, Base, get_db
from app import models

from app.models.deviation import (
    Deviation,
    RCAAnalysis,
    CAPA
)

from app.routes.deviation import router as deviation_router
from app.routes.rca import router as rca_router
from app.routes.capa import router as capa_router


# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="PharmaRCA AI",
    description="AI-Powered Root Cause Analysis for Pharmaceutical API Manufacturing",
    version="1.0.0"
)


# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register API Routers
app.include_router(deviation_router)
app.include_router(rca_router)
app.include_router(capa_router)


# Home API
@app.get("/")
def home():
    return {
        "message": "Welcome to PharmaRCA AI Backend",
        "status": "Running",
        "version": "1.0.0"
    }


# Health Check API
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "application": "PharmaRCA AI",
        "backend": "FastAPI",
        "database": "connected"
    }


# Dashboard Statistics API
@app.get("/api/dashboard/stats")
def dashboard_stats(db: Session = Depends(get_db)):

    total_deviations = db.query(Deviation).count()

    open_deviations = db.query(Deviation).filter(
        Deviation.status.ilike("open")
    ).count()

    total_rca_analyses = db.query(RCAAnalysis).count()

    proposed_capas = db.query(CAPA).filter(
        CAPA.status == "Proposed"
    ).count()

    return {
        "total_deviations": total_deviations,
        "open_deviations": open_deviations,
        "total_rca_analyses": total_rca_analyses,
        "proposed_capas": proposed_capas
    }
