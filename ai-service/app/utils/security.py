"""Security utilities for AI Microservice."""
from pathlib import Path
from fastapi import HTTPException, status
from app.config import settings

def sanitize_filename(filename: str) -> str:
    """Sanitize uploaded file name to prevent path traversal."""
    cleaned = Path(filename).name
    # Keep alphanumeric, underscores, hyphens, and periods
    safe_chars = "".join(c for c in cleaned if c.isalnum() or c in "._-")
    return safe_chars or "uploaded_report.pdf"

def validate_uploaded_file(filename: str, content_type: str, file_size: int) -> None:
    """Validates uploaded medical report MIME type, extension, and file size."""
    if not filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is missing or empty."
        )
    
    ext = Path(filename).suffix.lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension '{ext}'. Please upload a PDF, JPG, JPEG, or PNG medical report."
        )
    
    if content_type and content_type.lower() not in settings.ALLOWED_MIME_TYPES and ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported MIME type '{content_type}'. Please upload a PDF, JPG, JPEG, or PNG medical report."
        )
        
    if file_size > settings.MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum size of {settings.MAX_UPLOAD_SIZE_MB} MB."
        )
