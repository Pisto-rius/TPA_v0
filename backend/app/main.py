from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import sys
import platform
import psutil
from .api.routes import files, analysis, results
from .core.config import settings
from .db.base import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

# Create upload directory if it doesn't exist
os.makedirs(settings.UPLOAD_FOLDER, exist_ok=True)

app = FastAPI(
    title="TPA Tool API",
    description="Backend API for Transfer Path Analysis Tool",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(files.router, prefix="/api/files", tags=["files"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["analysis"])
app.include_router(results.router, prefix="/api/results", tags=["results"])

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_FOLDER), name="uploads")

@app.get("/")
async def root():
    return {"message": "Welcome to TPA Tool API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

@app.get("/debug", tags=["debug"])
async def debug_info():
    """Get debug information about the server environment"""
    try:
        # System info
        system_info = {
            "platform": platform.platform(),
            "python_version": sys.version,
            "processor": platform.processor(),
            "memory": {
                "total": psutil.virtual_memory().total / (1024 * 1024 * 1024),  # GB
                "available": psutil.virtual_memory().available / (1024 * 1024 * 1024),  # GB
                "percent": psutil.virtual_memory().percent
            },
            "disk": {
                "total": psutil.disk_usage('/').total / (1024 * 1024 * 1024),  # GB
                "free": psutil.disk_usage('/').free / (1024 * 1024 * 1024),  # GB
                "percent": psutil.disk_usage('/').percent
            }
        }
        
        # Environment variables (excluding sensitive ones)
        env_vars = {k: v for k, v in os.environ.items() 
                   if not any(sensitive in k.lower() for sensitive in 
                             ['key', 'secret', 'password', 'token', 'auth'])}
        
        # App settings
        app_settings = {
            "CORS_ORIGINS": settings.CORS_ORIGINS,
            "UPLOAD_FOLDER": settings.UPLOAD_FOLDER,
            "UPLOAD_FOLDER_EXISTS": os.path.exists(settings.UPLOAD_FOLDER),
            "UPLOAD_FOLDER_WRITABLE": os.access(settings.UPLOAD_FOLDER, os.W_OK),
            "DATABASE_URI": settings.SQLALCHEMY_DATABASE_URI.split("://")[0] + "://*****"
        }
        
        return {
            "system": system_info,
            "environment": env_vars,
            "settings": app_settings
        }
    except Exception as e:
        return {"error": str(e)}

