from typing import Any, Optional
from pydantic import BaseModel, Field

class ChatMessageRequest(BaseModel):
    message: str = Field(..., description="User query or healthcare question")
    language: str = Field(default="English", description="Target response language (e.g. English, Telugu, Hindi)")
    patient_context: Optional[dict[str, Any]] = Field(default=None, description="Patient demographics or medical history")
    report_context: Optional[dict[str, Any]] = Field(default=None, description="Analyzed medical report parameters and condition")
    simple_language: bool = Field(default=False, description="Whether to explain without difficult medical jargon")
    history: Optional[list[dict[str, Any]]] = Field(default=[], description="Previous conversation messages")

class ChatMessageResponse(BaseModel):
    success: bool = True
    reply: str
    language: str = "English"
    disclaimer: str
    action: Optional[str] = None
    simple_language_used: bool = False
    model_used: str
