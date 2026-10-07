"""Health check route for FastAPI AI Microservice."""
from fastapi import APIRouter
from app.services.ollama_service import ollama_service

router = APIRouter(tags=["Health"])

@router.get("/health")
async def health_check():
    """Health status endpoint checking Ollama and local LLM model connectivity."""
    ollama_info = await ollama_service.check_health()
    is_ready = ollama_info.get("is_ready", False)

    return {
        "status": "ok" if is_ready else "degraded",
        "ollama": "connected" if is_ready else "unavailable",
        "model": ollama_info.get("active_model", "qwen"),
        "base_url": ollama_info.get("base_url"),
        "available_models": ollama_info.get("available_models", []),
        "details": "All systems operational" if is_ready else ollama_info.get("error")
    }
