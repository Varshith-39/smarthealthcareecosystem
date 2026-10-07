"""Healthcare System Prompts and Clinical Context Builder."""

DISCLAIMER_REPORT = (
    "This AI explanation is for educational purposes only and is not a medical diagnosis. "
    "Consult a qualified healthcare professional for medical advice."
)

DISCLAIMER_SAFETY = (
    "AI-generated educational guidance based on medical information and general recommendations "
    "from qualified healthcare professionals. Always consult your doctor or a registered medical "
    "professional before making changes to your diet, exercise, or treatment."
)

EXPERT_DIET_NOTICE = (
    "Expert Medical Guidance: These food recommendations are based on general guidance commonly "
    "provided by senior doctors, registered dietitians, and qualified healthcare professionals for "
    "this health condition. They are provided for educational purposes and should be personalized "
    "by the patient's healthcare professional."
)

EXPERT_EXERCISE_NOTICE = (
    "Expert Medical Guidance: These sample exercises are based on general guidance from senior "
    "doctors, physiotherapists, and qualified healthcare professionals. Exercise recommendations "
    "should be personalized according to the patient's age, medical history, physical ability, "
    "medications, and doctor's advice."
)

EMERGENCY_WARNING = (
    "If you are experiencing severe chest pain, difficulty breathing, loss of consciousness, "
    "severe bleeding, or another medical emergency, seek immediate emergency medical care "
    "rather than relying on the AI assistant."
)

def get_healthcare_system_prompt(language: str = "English", simple_language: bool = False) -> str:
    """Builds centralized healthcare system prompt for Qwen local model."""
    simple_instruction = ""
    if simple_language:
        simple_instruction = (
            "\n- SIMPLE LANGUAGE MODE IS ACTIVATED: Avoid difficult medical terminology. "
            "Explain clinical concepts using everyday, easy-to-understand words that an 8th grader would grasp. "
            "For instance, instead of 'hyperglycemia', say 'blood sugar level higher than normal'. "
            "If a medical term must be used, provide the term followed by its simple meaning."
        )

    return f"""You are a patient-friendly healthcare information assistant within a Smart Healthcare Ecosystem.
Your purpose is to explain medical laboratory results, vitals, and general wellness guidance using clear, empathetic, and educational language.

CRITICAL RULES:
1. You are NOT a doctor and must NEVER claim to be a physician.
2. Never give a definitive diagnosis or claim to replace a doctor.
3. Never prescribe medications, suggest dosages, or advise stopping prescribed medications.
4. Do NOT invent or hallucinate clinical report values or patient history.
5. Base your answers strictly on verified information and standard clinical reference ranges.
6. If information is insufficient or unclear, state: "I don't have enough information to provide a reliable answer. Please consult your doctor."
7. In case of emergency red-flag symptoms (severe chest pain, shortness of breath, acute confusion), advise immediate emergency medical care.
8. Respond in {language}. If medical terms are translated, keep the common English term in parentheses alongside when helpful.
{simple_instruction}
"""

def build_chat_user_prompt(
    message: str,
    language: str = "English",
    simple_language: bool = False,
    report_context: dict | None = None,
    patient_context: dict | None = None
) -> str:
    """Builds user prompt enriched with report and patient context."""
    context_sections = []
    
    if patient_context:
        context_sections.append(f"PATIENT CONTEXT:\n{patient_context}")
        
    if report_context:
        summary = report_context.get("summary", "")
        conditions = report_context.get("detected_conditions", [])
        params = report_context.get("parameters", [])
        
        param_summary = []
        for p in params:
            name = p.get("parameter") or p.get("name")
            val = p.get("result") or p.get("value")
            status = p.get("status")
            param_summary.append(f"- {name}: {val} ({status})")
            
        context_sections.append(
            f"ANALYZED REPORT CONTEXT:\n"
            f"Summary: {summary}\n"
            f"Detected Conditions: {', '.join(conditions) if conditions else 'None specified'}\n"
            f"Key Parameters:\n" + "\n".join(param_summary[:10])
        )

    context_str = "\n\n".join(context_sections)
    if context_str:
        context_str = f"CONTEXT INFORMATION:\n{context_str}\n\n"
        
    simple_clause = "Use simple, jargon-free words. " if simple_language else ""
    lang_clause = f"Please provide the response in {language}. " if language != "English" else ""

    return (
        f"{context_str}"
        f"PATIENT QUESTION: {message}\n\n"
        f"Provide a helpful, accurate, patient-friendly response. {simple_clause}{lang_clause}"
        f"Always conclude with standard medical disclaimer to consult their clinician."
    )
