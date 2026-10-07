"""AI Healthcare Chat Routes."""
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.models.chat_models import ChatMessageRequest, ChatMessageResponse
from app.services.ollama_service import ollama_service
from app.services.prompt_service import (
    DISCLAIMER_SAFETY,
    build_chat_user_prompt,
    get_healthcare_system_prompt
)
from app.services.translation_service import translation_service

router = APIRouter(prefix="/api/chat", tags=["Chat"])

@router.post("", response_model=ChatMessageResponse)
async def chat_endpoint(request: ChatMessageRequest):
    """Processes conversational healthcare questions using Qwen local model."""
    user_prompt = build_chat_user_prompt(
        message=request.message,
        language=request.language,
        simple_language=request.simple_language,
        report_context=request.report_context,
        patient_context=request.patient_context
    )

    system_prompt = get_healthcare_system_prompt(
        language=request.language,
        simple_language=request.simple_language
    )

    gen_result = await ollama_service.generate(
        prompt=user_prompt,
        system=system_prompt,
        temperature=0.3,
        timeout=90.0
    )

    if gen_result.get("success") and gen_result.get("response"):
        reply_text = gen_result["response"].strip()
        model_used = gen_result.get("model", "qwen")
    else:
        # Graceful fallback without crashing
        reply_text = (
            "AI service is currently unavailable. Please make sure Ollama is running. "
            "In the meantime, your analyzed parameters and general medical guidance remain visible above."
        )
        model_used = "fallback_offline"

    # Multi-language translation verification
    disclaimer = DISCLAIMER_SAFETY
    if request.language != "English":
        trans_disc = await translation_service.translate_text(disclaimer, "English", request.language)
        disclaimer = trans_disc["translated_text"]

    return ChatMessageResponse(
        success=True,
        reply=reply_text,
        language=request.language,
        disclaimer=disclaimer,
        simple_language_used=request.simple_language,
        model_used=model_used
    )

@router.post("/stream")
async def chat_stream_endpoint(request: ChatMessageRequest):
    """Streams conversational healthcare response progressively from Ollama."""
    user_prompt = build_chat_user_prompt(
        message=request.message,
        language=request.language,
        simple_language=request.simple_language,
        report_context=request.report_context,
        patient_context=request.patient_context
    )

    system_prompt = get_healthcare_system_prompt(
        language=request.language,
        simple_language=request.simple_language
    )

    generator = ollama_service.stream_generate(
        prompt=user_prompt,
        system=system_prompt,
        temperature=0.3
    )

    return StreamingResponse(generator, media_type="text/plain")
