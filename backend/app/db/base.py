from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from ..core.config import settings
import os
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Ensure the database directory exists
db_path = os.path.dirname(settings.SQLALCHEMY_DATABASE_URI.replace("sqlite:///", ""))
if db_path and not os.path.exists(db_path):
    os.makedirs(db_path, exist_ok=True)
    logger.info(f"Created database directory: {db_path}")

try:
    engine = create_engine(
        settings.SQLALCHEMY_DATABASE_URI, 
        connect_args={"check_same_thread": False} if settings.SQLALCHEMY_DATABASE_URI.startswith("sqlite") else {}
    )
    logger.info(f"Connected to database: {settings.SQLALCHEMY_DATABASE_URI}")
except Exception as e:
    logger.error(f"Failed to connect to database: {str(e)}")
    raise

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

