from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from sqlalchemy.sql import func
import os

# Create SQLite database in the backend folder
DB_FILE = os.path.join(os.path.dirname(__file__), "lawspeak.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_FILE}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    # Relationship to analysis history
    analyses = relationship("ContractAnalysis", back_populates="owner")

class ContractAnalysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Metadata
    title = Column(String)
    text_preview = Column(String)
    
    # Fast access score
    overall_score = Column(Float)
    
    # Store the full LLM JSON payload directly as a string to make parsing out fast
    analysis_json_en = Column(String)
    analysis_json_hi = Column(String)
    analysis_json_kn = Column(String)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="analyses")

# Helper function to inject session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
