
import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import declarative_base, sessionmaker

# Load environment variables
load_dotenv()

# Read database configuration
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_NAME = os.getenv("DB_NAME", "pharmarca")

if not DB_PASSWORD:
    raise ValueError("DB_PASSWORD is missing from .env file")

# Create a safe database URL
DATABASE_URL = URL.create(
    drivername="postgresql+psycopg2",
    username=DB_USER,
    password=DB_PASSWORD,
    host=DB_HOST,
    port=DB_PORT,
    database=DB_NAME
)

# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)

# Create database session
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for database models
Base = declarative_base()


# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
