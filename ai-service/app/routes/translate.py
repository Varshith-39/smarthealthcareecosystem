"""Medical Translation Routes."""
from fastapi import APIRouter
from app.models.translation_models import TranslationRequest, TranslationResponse
from app.services.translation_service import SUPPORTED_LANGUAGES, translation_service

router = APIRouter(prefix="/api/translate", tags=["Translation"])

@router.post("", response_model=TranslationResponse)
async def translate_endpoint(request: TranslationRequest):
    """Translates medical guidance or patient chat into one of the 8 supported languages."""
    result = await translation_service.translate_text(
        text=request.text,
        source_language=request.source_language,
        target_language=request.target_language
    )

    return TranslationResponse(
        success=True,
        original_text=request.text,
        translated_text=result["translated_text"],
        source_language=result["source_language"],
        target_language=result["target_language"],
        model_used=result["model_used"]
    )

@router.get("/languages")
async def get_languages_endpoint():
    """Returns list of supported languages with codes and locales."""
    return {
        "success": True,
        "languages": SUPPORTED_LANGUAGES
    }
