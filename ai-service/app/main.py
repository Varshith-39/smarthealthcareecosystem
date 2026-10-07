"""Main FastAPI Application Entrypoint for Smart Healthcare AI Microservice."""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.routes import (
    health_router,
    chat_router,
    report_router,
    translate_router,
    voice_router
)
from app.services.health_guidance_service import health_guidance_service
from app.services.ollama_service import ollama_service

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ai_service.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle management."""
    logger.info("==================================================")
    logger.info("🏥 Smart Healthcare AI Microservice Starting Up")
    logger.info("📡 Ollama Base URL: %s", settings.OLLAMA_BASE_URL)
    logger.info("🧠 Configured Model: %s", settings.OLLAMA_MODEL)
    logger.info("🔌 Node.js Backend URL: %s", settings.NODE_BACKEND_URL)
    logger.info("==================================================")
    
    # Check Ollama connection on startup
    status = await ollama_service.check_health()
    if status.get("is_ready"):
        logger.info("✅ Connected to Ollama successfully! Active model: %s", status.get("active_model"))
    else:
        logger.warning("⚠️ Ollama is currently unavailable: %s", status.get("error"))
        
    yield
    
    logger.info("🛑 Smart Healthcare AI Microservice shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Python FastAPI Local AI Microservice powered by Ollama and Qwen for medical report analysis, disease guidance, multilingual chat, and voice interaction.",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "running",
        "documentation": "/docs"
    }

# Include modular routes
app.include_router(health_router)
app.include_router(chat_router)
app.include_router(report_router)
app.include_router(translate_router)
app.include_router(voice_router)

# Health guidance direct endpoint
@app.post("/api/health-guidance", tags=["Health Guidance"])
async def get_health_guidance_endpoint(payload: dict):
    """Fetches condition-specific diet and exercise guidance."""
    condition = payload.get("condition", "GENERAL_WELLNESS")
    guidance = health_guidance_service.get_guidance(condition)
    return {
        "success": True,
        "data": guidance
    }

# Global exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": exc.detail}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc: Exception):
    logger.exception("Unhandled server exception: %s", exc)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "AI service encountered an internal error. Clinical fallback remains available."
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
