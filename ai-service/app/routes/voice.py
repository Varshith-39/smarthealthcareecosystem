"""Voice Assistant Processing Routes."""
from typing import Any, Optional
from fastapi import APIRouter
from pydantic import BaseModel
from app.services.ollama_service import ollama_service
from app.services.prompt_service import build_chat_user_prompt, get_healthcare_system_prompt
from app.services.translation_service import SUPPORTED_LANGUAGES, translation_service

router = APIRouter(prefix="/api/voice", tags=["Voice Assistant"])

class VoiceProcessRequest(BaseModel):
    transcript: str
    language: str = "English"
    simple_language: bool = False
    report_context: Optional[dict[str, Any]] = None

class VoiceProcessResponse(BaseModel):
    success: bool = True
    action: str
    speech_text: str
    display_text: str
    language: str
    voice_locale: str
    target_language: Optional[str] = None

@router.post("/process", response_model=VoiceProcessResponse)
async def process_voice_command(request: VoiceProcessRequest):
    """Processes spoken voice input, identifies voice commands, and returns TTS-ready text."""
    query = request.transcript.strip().lower()
    locale = SUPPORTED_LANGUAGES.get(request.language, {}).get("locale", "en-US")

    # Command: "Translate this into [Language]"
    for lang_name in SUPPORTED_LANGUAGES:
        if f"into {lang_name.lower()}" in query or f"in {lang_name.lower()}" in query or f"to {lang_name.lower()}" in query:
            return VoiceProcessResponse(
                action="SWITCH_LANGUAGE",
                speech_text=f"Switching language to {lang_name}.",
                display_text=f"Switched language to {lang_name}.",
                language=lang_name,
                voice_locale=SUPPORTED_LANGUAGES[lang_name]["locale"],
                target_language=lang_name
            )

    # Command: "Give me food recommendations" / "What should I eat"
    if any(k in query for k in ["food recommendation", "diet recommendation", "what should i eat", "diet plan"]):
        reply = (
            "Based on your report, senior medical dietitians recommend emphasizing fiber-rich greens, "
            "whole grains, and lean proteins, while limiting refined sugars and excessive sodium. "
            "Specific meal guidance is highlighted in the Expert Food section."
        )
        return VoiceProcessResponse(
            action="SCROLL_DIET",
            speech_text=reply,
            display_text=reply,
            language=request.language,
            voice_locale=locale
        )

    # Command: "Give me exercises" / "What exercises should I do"
    if any(k in query for k in ["exercise", "workout", "exercises to do", "walking"]):
        reply = (
            "For your detected condition, senior doctors and physiotherapists recommend starting with 20 to 30 minutes "
            "of brisk walking 5 days a week, followed by gentle stretching. Avoid heavy straining or breath-holding."
        )
        return VoiceProcessResponse(
            action="SCROLL_EXERCISE",
            speech_text=reply,
            display_text=reply,
            language=request.language,
            voice_locale=locale
        )

    # Command: "Explain this in simple words"
    if "simple words" in query or "simple language" in query or "explain simply" in query:
        return VoiceProcessResponse(
            action="TOGGLE_SIMPLE_LANGUAGE",
            speech_text="Simple language mode is now active. I will explain medical findings without technical jargon.",
            display_text="Simple language mode enabled.",
            language=request.language,
            voice_locale=locale
        )

    # Standard voice conversation through Qwen local LLM
    user_prompt = build_chat_user_prompt(
        message=request.transcript,
        language=request.language,
        simple_language=request.simple_language,
        report_context=request.report_context
    )
    system_prompt = get_healthcare_system_prompt(
        language=request.language,
        simple_language=request.simple_language
    )

    gen_result = await ollama_service.generate(
        prompt=user_prompt,
        system=system_prompt,
        temperature=0.3,
        timeout=60.0
    )

    if gen_result.get("success") and gen_result.get("response"):
        response_text = gen_result["response"].strip()
    else:
        response_text = (
            "AI service is currently unavailable. Please make sure Ollama is running. "
            "You can review your extracted report parameters on the screen."
        )

    return VoiceProcessResponse(
        action="ANSWER_CHAT",
        speech_text=response_text,
        display_text=response_text,
        language=request.language,
        voice_locale=locale
    )
