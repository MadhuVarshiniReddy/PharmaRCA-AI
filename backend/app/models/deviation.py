
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    Date,
    ForeignKey,
    JSON
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


# 1. Deviation Table
class Deviation(Base):
    __tablename__ = "deviations"

    id = Column(Integer, primary_key=True, index=True)

    deviation_code = Column(String(50), unique=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)

    source_type = Column(String(30))
    product_name = Column(String(150))
    batch_number = Column(String(100))
    process_stage = Column(String(150))
    severity = Column(String(50), default="Medium")
    status = Column(String(50), default="Open")

    extracted_data = Column(JSON)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    analyses = relationship(
        "RCAAnalysis",
        back_populates="deviation",
        cascade="all, delete-orphan"
    )


# 2. RCA Analysis Table
class RCAAnalysis(Base):
    __tablename__ = "rca_analyses"

    id = Column(Integer, primary_key=True, index=True)

    deviation_id = Column(
        Integer,
        ForeignKey("deviations.id"),
        nullable=False
    )

    method = Column(String(50), default="5 Whys")
    problem_statement = Column(Text)
    ai_summary = Column(Text)

    findings = Column(JSON)
    missing_evidence = Column(JSON)

    review_status = Column(String(50), default="Pending Review")
    reviewed_by = Column(String(150))

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    deviation = relationship("Deviation", back_populates="analyses")

    causes = relationship(
        "Cause",
        back_populates="analysis",
        cascade="all, delete-orphan"
    )

    capas = relationship(
        "CAPA",
        back_populates="analysis",
        cascade="all, delete-orphan"
    )


# 3. Potential Causes Table
class Cause(Base):
    __tablename__ = "causes"

    id = Column(Integer, primary_key=True, index=True)

    analysis_id = Column(
        Integer,
        ForeignKey("rca_analyses.id"),
        nullable=False
    )

    category = Column(String(100))
    cause_description = Column(Text, nullable=False)
    supporting_evidence = Column(Text)

    confidence = Column(String(30))
    is_confirmed = Column(Boolean, default=False)

    analysis = relationship("RCAAnalysis", back_populates="causes")


# 4. CAPA Table
class CAPA(Base):
    __tablename__ = "capas"

    id = Column(Integer, primary_key=True, index=True)

    analysis_id = Column(
        Integer,
        ForeignKey("rca_analyses.id"),
        nullable=False
    )

    action_type = Column(String(50))
    description = Column(Text, nullable=False)
    rationale = Column(Text)

    assigned_to = Column(String(150))
    due_date = Column(Date)

    status = Column(String(50), default="Proposed")
    effectiveness_check = Column(Text)

    analysis = relationship("RCAAnalysis", back_populates="capas")
