import os
import shutil
from typing import List
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from ...db.base import get_db
from ...schemas.file import FileCreate, FileResponse
from ...db.models.file import File as FileModel
from ...core.config import settings
from ...processing.file_processor import process_file, validate_file_type

router = APIRouter()

@router.post("/upload/", response_model=FileResponse)
async def upload_file(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db)
):
    # Validate file type
    if not validate_file_type(file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Supported types: .csv, .xlsx, .mat, .h5"
        )
    
    # Check file size
    file_size = 0
    file_content = await file.read()
    file_size = len(file_content)
    await file.seek(0)  # Reset file pointer
    
    if file_size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size: {settings.MAX_UPLOAD_SIZE / (1024 * 1024)} MB"
        )
    
    # Create upload directory if it doesn't exist
    os.makedirs(settings.UPLOAD_FOLDER, exist_ok=True)
    
    try:
        # Save file
        file_path = os.path.join(settings.UPLOAD_FOLDER, file.filename)
        with open(file_path, "wb") as buffer:
            buffer.write(file_content)
        
        # Process file to extract metadata
        try:
            metadata = process_file(file_path)
        except Exception as e:
            # Clean up file if processing fails
            os.remove(file_path)
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Error processing file: {str(e)}"
            )
        
        # Save file info to database
        db_file = FileModel(
            filename=file.filename,
            filepath=file_path,
            filetype=os.path.splitext(file.filename)[1],
            filesize=file_size,
            metadata=metadata
        )
        db.add(db_file)
        db.commit()
        db.refresh(db_file)
        
        return db_file
    except Exception as e:
        # Handle any other exceptions
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading file: {str(e)}"
        )

@router.get("/", response_model=List[FileResponse])
def get_files(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    files = db.query(FileModel).offset(skip).limit(limit).all()
    return files

@router.get("/{file_id}", response_model=FileResponse)
def get_file(
    file_id: int,
    db: Session = Depends(get_db)
):
    file = db.query(FileModel).filter(FileModel.id == file_id).first()
    if file is None:
        raise HTTPException(status_code=404, detail="File not found")
    return file

@router.delete("/{file_id}")
def delete_file(
    file_id: int,
    db: Session = Depends(get_db)
):
    file = db.query(FileModel).filter(FileModel.id == file_id).first()
    if file is None:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Delete physical file
    try:
        os.remove(file.filepath)
    except OSError:
        pass  # File might not exist
    
    # Delete from database
    db.delete(file)
    db.commit()
    
    return {"message": "File deleted successfully"}

