from pydantic import BaseModel, Field

class TranslationRequest(BaseModel):
    text: str = Field(..., description="Text content to translate")
    source_language: str = Field(default="English", description="Source language")
    target_language: str = Field(..., description="Target language (e.g. Telugu, Hindi, Tamil)")

class TranslationResponse(BaseModel):
    success: bool = True
    original_text: str
    translated_text: str
    source_language: str
    target_language: str
    model_used: str = "qwen"
