from typing import Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel

class FileBase(BaseModel):
    filename: str
    filetype: str
    filesize: int

class FileCreate(FileBase):
    pass

class FileResponse(FileBase):
    id: int
    filepath: str
    metadata: Dict[str, Any]
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

