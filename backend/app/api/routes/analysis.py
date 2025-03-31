import asyncio
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request
from sqlalchemy.orm import Session
from ...db.base import get_db
from ...schemas.analysis import AnalysisCreate, AnalysisResponse, AnalysisStatus
from ...db.models.analysis import Analysis as AnalysisModel, AnalysisStatus as DBAnalysisStatus
from ...processing.tpa_engine import run_analysis
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Store background tasks with their status
background_tasks_status = {}

@router.post("/", response_model=AnalysisResponse)
async def create_analysis(
    analysis: AnalysisCreate,
    background_tasks: BackgroundTasks,
    request: Request,
    db: Session = Depends(get_db)
):
    # Create analysis record
    db_analysis = AnalysisModel(
        name=analysis.name,
        description=analysis.description,
        parameters=analysis.parameters,
        file_ids=analysis.file_ids,
        status=DBAnalysisStatus.PENDING
    )
    db.add(db_analysis)
    db.commit()
    db.refresh(db_analysis)
    
    # Set up a task to check for timeout
    async def check_timeout(analysis_id: int, timeout_seconds: int = 300):
        await asyncio.sleep(timeout_seconds)
        # Check if analysis is still running
        db_session = next(get_db())
        analysis = db_session.query(AnalysisModel).filter(AnalysisModel.id == analysis_id).first()
        if analysis and analysis.status == DBAnalysisStatus.RUNNING:
            logger.warning(f"Analysis {analysis_id} timed out after {timeout_seconds} seconds")
            analysis.status = DBAnalysisStatus.FAILED
            analysis.error_message = f"Analysis timed out after {timeout_seconds} seconds"
            db_session.commit()
    
    # Run analysis in background
    background_tasks.add_task(
        run_analysis,
        analysis_id=db_analysis.id,
        file_ids=analysis.file_ids,
        parameters=analysis.parameters,
        db=db
    )
    
    # Add timeout check
    background_tasks.add_task(
        check_timeout,
        analysis_id=db_analysis.id
    )
    
    return db_analysis

@router.get("/", response_model=List[AnalysisResponse])
def get_analyses(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    analyses = db.query(AnalysisModel).offset(skip).limit(limit).all()
    return analyses

@router.get("/{analysis_id}", response_model=AnalysisResponse)
def get_analysis(
    analysis_id: int,
    db: Session = Depends(get_db)
):
    analysis = db.query(AnalysisModel).filter(AnalysisModel.id == analysis_id).first()
    if analysis is None:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis

@router.delete("/{analysis_id}")
def delete_analysis(
    analysis_id: int,
    db: Session = Depends(get_db)
):
    analysis = db.query(AnalysisModel).filter(AnalysisModel.id == analysis_id).first()
    if analysis is None:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    db.delete(analysis)
    db.commit()
    
    return {"message": "Analysis deleted successfully"}

