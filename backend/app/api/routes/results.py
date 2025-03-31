from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ...db.base import get_db
from ...db.models.analysis import Analysis as AnalysisModel

router = APIRouter()

@router.get("/{analysis_id}/summary")
def get_analysis_summary(
    analysis_id: int,
    db: Session = Depends(get_db)
):
    analysis = db.query(AnalysisModel).filter(AnalysisModel.id == analysis_id).first()
    if analysis is None:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    if not analysis.results:
        raise HTTPException(status_code=404, detail="Results not available")
    
    # Extract summary from results
    summary = {
        "analysis_id": analysis.id,
        "name": analysis.name,
        "status": analysis.status,
        "created_at": analysis.created_at,
        "completed_at": analysis.updated_at,
        "metrics": analysis.results.get("metrics", {}),
    }
    
    return summary

@router.get("/{analysis_id}/contributions")
def get_path_contributions(
    analysis_id: int,
    frequency: Optional[float] = Query(None, description="Filter by specific frequency"),
    db: Session = Depends(get_db)
):
    analysis = db.query(AnalysisModel).filter(AnalysisModel.id == analysis_id).first()
    if analysis is None:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    if not analysis.results:
        raise HTTPException(status_code=404, detail="Results not available")
    
    contributions = analysis.results.get("contributions", [])
    
    # Filter by frequency if provided
    if frequency is not None:
        contributions = [c for c in contributions if abs(c["frequency"] - frequency) < 0.1]
    
    return contributions

@router.get("/{analysis_id}/transfer-functions")
def get_transfer_functions(
    analysis_id: int,
    path_id: Optional[int] = Query(None, description="Filter by specific path"),
    db: Session = Depends(get_db)
):
    analysis = db.query(AnalysisModel).filter(AnalysisModel.id == analysis_id).first()
    if analysis is None:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    if not analysis.results:
        raise HTTPException(status_code=404, detail="Results not available")
    
    transfer_functions = analysis.results.get("transfer_functions", [])
    
    # Filter by path if provided
    if path_id is not None:
        transfer_functions = [tf for tf in transfer_functions if tf["path_id"] == path_id]
    
    return transfer_functions

@router.get("/{analysis_id}/system-response")
def get_system_response(
    analysis_id: int,
    db: Session = Depends(get_db)
):
    analysis = db.query(AnalysisModel).filter(AnalysisModel.id == analysis_id).first()
    if analysis is None:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    if not analysis.results:
        raise HTTPException(status_code=404, detail="Results not available")
    
    system_response = analysis.results.get("system_response", [])
    
    return system_response

@router.get("/{analysis_id}/rms-comparison")
def get_rms_comparison(
    analysis_id: int,
    db: Session = Depends(get_db)
):
    """Get RMS comparison between measured and predicted targets"""
    analysis = db.query(AnalysisModel).filter(AnalysisModel.id == analysis_id).first()
    if analysis is None:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    if not analysis.results:
        raise HTTPException(status_code=404, detail="Results not available")
    
    rms_comparison = analysis.results.get("rms_comparison", [])
    
    return rms_comparison

@router.get("/{analysis_id}/performance-indicators")
def get_performance_indicators(
    analysis_id: int,
    db: Session = Depends(get_db)
):
    """Get performance indicators for the analysis"""
    analysis = db.query(AnalysisModel).filter(AnalysisModel.id == analysis_id).first()
    if analysis is None:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    if not analysis.results:
        raise HTTPException(status_code=404, detail="Results not available")
    
    indicators = analysis.results.get("performance_indicators", {})
    
    return indicators

