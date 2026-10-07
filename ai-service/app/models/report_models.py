from typing import Any, Optional
from pydantic import BaseModel, Field

class ReportParameter(BaseModel):
    parameter: str = Field(..., description="Parameter name, e.g. Glucose or Hemoglobin")
    name: Optional[str] = None
    result: str = Field(..., description="Observed lab value, e.g. 145 mg/dL")
    value: Optional[str] = None
    status: str = Field(..., description="Within expected range / Elevated / Review / High / Low")
    explanation: str = Field(..., description="Patient friendly clinical insight")
    
    def model_post_init(self, __context: Any) -> None:
        if not self.name:
            self.name = self.parameter
        if not self.value:
            self.value = self.result

class MealPlan(BaseModel):
    breakfast: str
    lunch: str
    dinner: str
    snacks: str

class DietGuidance(BaseModel):
    medicalGuidanceNotice: str
    recommendedFoods: list[str]
    foodsToLimit: list[str]
    sampleMealPlan: MealPlan
    hydrationGuidance: str

class ExerciseItem(BaseModel):
    exercise: str
    duration: str
    frequency: str
    notes: str
    beginnerInstructions: Optional[str] = None

class ExerciseGuidance(BaseModel):
    medicalGuidanceNotice: str
    exercisesTable: list[ExerciseItem]
    safetyPrecautions: list[str]
    exercisesToAvoid: list[str]
    whenToStop: Optional[str] = None
    whenToConsultDoctor: Optional[str] = None

class ExplainReportTextRequest(BaseModel):
    reportText: str
    language: str = "English"
    simple_language: bool = False

class ReportAnalysisResponse(BaseModel):
    success: bool = True
    summary: str
    detected_conditions: list[str]
    parameters: list[ReportParameter]
    risk_factors: list[str]
    expert_diet: DietGuidance
    expert_exercises: ExerciseGuidance
    safety_notes: list[str]
    doctor_consultation: str
    fileName: str
    fileType: str
    fileSize: int
    disclaimer: str
    disclaimerSafety: str
    conditionDetection: Optional[dict[str, Any]] = None
    language: str = "English"
    model_used: str = "qwen"
