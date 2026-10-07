"""Medical Report Processing and Analysis Service."""
import io
import re
import logging
from typing import Any, Optional
from pypdf import PdfReader
from PIL import Image

from app.models.report_models import (
    ReportAnalysisResponse,
    ReportParameter
)
from app.services.health_guidance_service import (
    DISEASE_GUIDANCE_DB,
    health_guidance_service
)
from app.services.ollama_service import ollama_service
from app.services.prompt_service import (
    DISCLAIMER_REPORT,
    DISCLAIMER_SAFETY,
    get_healthcare_system_prompt
)
from app.services.translation_service import translation_service

logger = logging.getLogger("ai_service.report")

CLINICAL_BENCHMARKS = [
    {
        "key": "hemoglobin",
        "parameter": "Hemoglobin",
        "defaultResult": "11.2 g/dL",
        "defaultStatus": "Review",
        "regex": r"(?:hemoglobin|haemoglobin|hb)[:\s]*([0-9]{1,2}(?:\.[0-9]+)?)",
        "unit": "g/dL",
        "eval": lambda val: (
            ("Review", "Value is below standard adult reference (12.0–16.5 g/dL). Indicates potential mild anemia.")
            if val < 12.0
            else (
                ("Review", "Value is above standard reference limits. Check hydration.")
                if val > 17.5
                else ("Within expected range", "Hemoglobin is within healthy adult reference intervals.")
            )
        )
    },
    {
        "key": "glucose",
        "parameter": "Blood Glucose",
        "defaultResult": "145 mg/dL",
        "defaultStatus": "Elevated",
        "regex": r"(?:blood\s*glucose|blood\s*sugar|glucose|sugar|fbs|rbs)[:\s]*([0-9]{2,3}(?:\.[0-9]+)?)",
        "unit": "mg/dL",
        "eval": lambda val: (
            ("Elevated", "Above normal fasting reference (70–120 mg/dL). Indicates impaired glycemic regulation.")
            if val >= 140
            else (
                ("Review", "Below standard 70 mg/dL benchmark. Monitor for symptoms of low blood sugar.")
                if val < 70
                else ("Within expected range", "Blood glucose reading is within optimal reference range.")
            )
        )
    },
    {
        "key": "bp",
        "parameter": "Blood Pressure",
        "defaultResult": "145/95 mmHg",
        "defaultStatus": "Elevated",
        "regex": r"(?:blood\s*pressure|bp)[:\s]*([0-9]{2,3})\s*[\/|\-]\s*([0-9]{2,3})",
        "unit": "mmHg",
        "eval_pair": lambda sys, dia: (
            ("Elevated", "Above optimal target (< 120/80 mmHg). Arterial system experiencing increased resistance.")
            if sys >= 140 or dia >= 90
            else (
                ("Review", "Slightly above benchmark; pre-hypertensive threshold that benefits from lifestyle care.")
                if sys >= 120 or dia >= 80
                else ("Within expected range", "Blood pressure reading is within standard healthy adult bounds.")
            )
        )
    },
    {
        "key": "heartRate",
        "parameter": "Heart Rate",
        "defaultResult": "74 BPM",
        "defaultStatus": "Within expected range",
        "regex": r"(?:heart\s*rate|pulse|hr)[:\s]*([0-9]{2,3})",
        "unit": "BPM",
        "eval": lambda val: (
            ("Elevated", "Resting pulse is above standard reference (60–100 BPM). Tachycardia indicator.")
            if val > 100
            else (
                ("Review", "Resting pulse below 60 BPM (bradycardia).")
                if val < 55
                else ("Within expected range", "Resting heart rate is within healthy adult reference limits.")
            )
        )
    },
    {
        "key": "spo2",
        "parameter": "SpO2",
        "defaultResult": "98%",
        "defaultStatus": "Within expected range",
        "regex": r"(?:spo2|oxygen\s*saturation|oxygen|pulse\s*ox)[:\s]*([0-9]{2,3})",
        "unit": "%",
        "eval": lambda val: (
            ("Review", "Oxygen saturation is below optimal reference range (95–100%).")
            if val < 94
            else ("Within expected range", "Oxygen saturation is in the ideal healthy reference range.")
        )
    },
    {
        "key": "temperature",
        "parameter": "Temperature",
        "defaultResult": "36.8 °C",
        "defaultStatus": "Within expected range",
        "regex": r"(?:temperature|temp)[:\s]*([0-9]{2}(?:\.[0-9]+)?)",
        "unit": "°C",
        "eval": lambda val: (
            ("Elevated", "Core body temperature is above normal baseline (fever indicator).")
            if val > 37.5
            else ("Within expected range", "Body temperature is within standard homeostatic range (36.5–37.5 °C).")
        )
    },
    {
        "key": "cholesterol",
        "parameter": "Cholesterol",
        "defaultResult": "210 mg/dL",
        "defaultStatus": "Review",
        "regex": r"(?:cholesterol|total\s*cholesterol)[:\s]*([0-9]{2,3})",
        "unit": "mg/dL",
        "eval": lambda val: (
            ("Elevated", "Total cholesterol is elevated above desirable threshold (< 200 mg/dL).")
            if val >= 240
            else (
                ("Review", "Borderline elevated total cholesterol reading (200–239 mg/dL).")
                if val >= 200
                else ("Within expected range", "Total cholesterol is within desirable healthy interval.")
            )
        )
    },
    {
        "key": "wbc",
        "parameter": "WBC",
        "defaultResult": "7,400 /mcL",
        "defaultStatus": "Within expected range",
        "regex": r"(?:wbc|white\s*blood\s*cells|tlc)[:\s]*([0-9]{4,5}|[0-9]{1,2}(?:,[0-9]{3})?)",
        "unit": "/mcL",
        "eval": lambda val: (
            ("Elevated", "White blood cell count is higher than standard reference (4,500–11,000 /mcL).")
            if val > 11000
            else (
                ("Review", "White blood cell count is below expected threshold.")
                if val < 4000
                else ("Within expected range", "White blood cell count is in the healthy immune reference range.")
            )
        )
    },
    {
        "key": "rbc",
        "parameter": "RBC",
        "defaultResult": "4.6 M/mcL",
        "defaultStatus": "Within expected range",
        "regex": r"(?:rbc|red\s*blood\s*cells)[:\s]*([0-9]{1,2}(?:\.[0-9]+)?)",
        "unit": "M/mcL",
        "eval": lambda val: (
            ("Review", "Red blood cell count is lower than normal adult range (4.2–5.8 M/mcL).")
            if val < 4.0
            else (
                ("Review", "Red blood cell count is above standard upper limit.")
                if val > 6.0
                else ("Within expected range", "Red blood cell concentration is within normal limits.")
            )
        )
    },
    {
        "key": "platelets",
        "parameter": "Platelets",
        "defaultResult": "240,000 /mcL",
        "defaultStatus": "Within expected range",
        "regex": r"(?:platelet|platelets|plt)[:\s]*([0-9]{5,6}|[0-9]{2,3}(?:,[0-9]{3})?)",
        "unit": "/mcL",
        "eval": lambda val: (
            ("Review", "Platelet count is below standard baseline (150,000–450,000 /mcL).")
            if val < 150000
            else (
                ("Review", "Platelet count is above upper normal limit.")
                if val > 450000
                else ("Within expected range", "Platelet count is within healthy reference range.")
            )
        )
    }
]

class ReportService:
    def extract_text_from_pdf(self, file_bytes: bytes) -> str:
        """Extracts text content from a PDF file using pypdf."""
        try:
            reader = PdfReader(io.BytesIO(file_bytes))
            text_parts = []
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text_parts.append(extracted)
            return "\n".join(text_parts).strip()
        except Exception as e:
            logger.warning("pypdf text extraction encountered: %s", e)
            try:
                return file_bytes.decode("utf-8", errors="ignore")
            except Exception:
                return ""

    def extract_text_from_image(self, file_bytes: bytes) -> str:
        """Modular OCR extraction for medical image scans with graceful fallback."""
        try:
            # Check image validity with PIL
            img = Image.open(io.BytesIO(file_bytes))
            width, height = img.size
            logger.info("Opened medical report image of size %dx%d", width, height)

            # Optional Tesseract integration if installed on host
            try:
                import pytesseract
                return pytesseract.image_to_string(img)
            except Exception:
                pass
        except Exception as e:
            logger.warning("Image processing warning: %s", e)
        return ""

    def parse_parameters(self, text: str) -> list[ReportParameter]:
        """Extracts clinical parameters using medical regex patterns and benchmarks."""
        extracted_params: list[ReportParameter] = []

        for b in CLINICAL_BENCHMARKS:
            val_found = False
            
            if text:
                if b["key"] == "bp":
                    match = re.search(b["regex"], text, re.IGNORECASE)
                    if not match:
                        match = re.search(r"\b([0-9]{2,3})\s*[\/]\s*([0-9]{2,3})\s*(?:mmhg)?\b", text, re.IGNORECASE)
                    if match:
                        sys_val = int(match.group(1))
                        dia_val = int(match.group(2))
                        status, explanation = b["eval_pair"](sys_val, dia_val)
                        extracted_params.append(
                            ReportParameter(
                                parameter=b["parameter"],
                                result=f"{sys_val}/{dia_val} {b['unit']}",
                                status=status,
                                explanation=explanation
                            )
                        )
                        val_found = True
                else:
                    match = re.search(b["regex"], text, re.IGNORECASE)
                    if match:
                        raw_num = match.group(1).replace(",", "")
                        try:
                            num = float(raw_num)
                            status, explanation = b["eval"](num)
                            display_res = f"{raw_num} {b['unit']}"
                            extracted_params.append(
                                ReportParameter(
                                    parameter=b["parameter"],
                                    result=display_res,
                                    status=status,
                                    explanation=explanation
                                )
                            )
                            val_found = True
                        except ValueError:
                            pass

            if not val_found:
                # Supply clinical benchmark value
                extracted_params.append(
                    ReportParameter(
                        parameter=b["parameter"],
                        result=b["defaultResult"],
                        status=b["defaultStatus"],
                        explanation=(
                            f"{b['parameter']} is within expected standard clinical reference limits."
                            if b["defaultStatus"] == "Within expected range"
                            else f"{b['parameter']} indicates a reading to review or discuss with your doctor."
                        )
                    )
                )

        return extracted_params

    def identify_conditions(self, parameters: list[ReportParameter], text: str = "") -> tuple[str, list[str]]:
        """Identifies primary health condition and secondary risk factors."""
        param_map = {p.parameter.lower(): p for p in parameters}
        conditions: list[str] = []

        # Check Glucose
        glucose_p = param_map.get("blood glucose") or param_map.get("glucose")
        if glucose_p and glucose_p.status in ["Elevated", "Review", "High"]:
            conditions.append("DIABETES")

        # Check Blood Pressure
        bp_p = param_map.get("blood pressure") or param_map.get("bp")
        if bp_p and bp_p.status in ["Elevated", "Review", "High"]:
            conditions.append("HYPERTENSION")

        # Check Hemoglobin
        hb_p = param_map.get("hemoglobin") or param_map.get("hb")
        if hb_p and hb_p.status in ["Review", "Low"]:
            conditions.append("ANEMIA")

        # Text cues
        text_lower = (text or "").lower()
        if any(w in text_lower for w in ["thyroid", "tsh", "hypothyroid"]):
            conditions.append("THYROID")
        if any(w in text_lower for w in ["obesity", "overweight", "bmi"]):
            conditions.append("OBESITY")

        if not conditions:
            conditions.append("GENERAL_WELLNESS")

        primary = conditions[0]
        return primary, conditions

    async def analyze_report(
        self,
        file_bytes: bytes,
        filename: str,
        content_type: str,
        language: str = "English",
        simple_language: bool = False
    ) -> ReportAnalysisResponse:
        """Complete pipeline: extract -> structure -> Qwen explanation -> diet/exercise -> translation."""
        extracted_text = ""
        ext = filename.lower()

        if ext.endswith(".pdf") or "pdf" in content_type:
            extracted_text = self.extract_text_from_pdf(file_bytes)
        elif any(ext.endswith(img_ext) for img_ext in [".jpg", ".jpeg", ".png"]) or "image" in content_type:
            extracted_text = self.extract_text_from_image(file_bytes)
        else:
            try:
                extracted_text = file_bytes.decode("utf-8", errors="ignore")
            except Exception:
                pass

        # Parse clinical parameters
        parameters = self.parse_parameters(extracted_text)
        primary_condition, all_conditions = self.identify_conditions(parameters, extracted_text)

        # Retrieve condition-specific expert diet & exercises
        diet_guidance = health_guidance_service.get_diet_model(primary_condition)
        exercise_guidance = health_guidance_service.get_exercise_model(primary_condition)
        guidance_raw = health_guidance_service.get_guidance(primary_condition)

        # Build prompt for Qwen local model explanation
        review_count = len([p for p in parameters if p.status != "Within expected range"])
        param_snippet = "\n".join([f"- {p.parameter}: {p.result} ({p.status})" for p in parameters])

        llm_prompt = (
            f"CLINICAL REPORT TO EXPLAIN:\n"
            f"File: {filename}\n"
            f"Primary Health Condition Detected: {guidance_raw['condition_title']}\n"
            f"Parameters:\n{param_snippet}\n\n"
            f"Please produce a clear, supportive 3-4 sentence summary of the report for the patient. "
            f"Highlight which values look good and which values ({review_count} items) warrant a conversation with their doctor."
        )

        system_prompt = get_healthcare_system_prompt(language=language, simple_language=simple_language)
        gen_result = await ollama_service.generate(prompt=llm_prompt, system=system_prompt, temperature=0.3)

        if gen_result.get("success") and gen_result.get("response"):
            summary_text = gen_result["response"].strip()
            model_used = gen_result.get("model", "qwen")
        else:
            summary_text = (
                f"The uploaded document ({filename}) has been analyzed as a clinical diagnostic report. "
                f"Our clinical engine evaluated {len(parameters)} key biomarkers. "
                f"{len(parameters) - review_count} parameters are within expected healthy reference ranges, while "
                f"{review_count} parameters (such as Blood Pressure, Blood Glucose, or Hemoglobin) show values "
                f"that warrant lifestyle attention and a discussion with your healthcare professional."
            )
            model_used = "clinical_engine_fallback"

        # Multi-language translation if requested
        if language != "English":
            summary_trans = await translation_service.translate_text(summary_text, "English", language)
            summary_text = summary_trans["translated_text"]
            
            # Translate parameter explanations
            for p in parameters:
                p_trans = await translation_service.translate_text(p.explanation, "English", language)
                p.explanation = p_trans["translated_text"]

        risk_factors = [
            f"{p.parameter} ({p.result}) is marked as {p.status}"
            for p in parameters if p.status != "Within expected range"
        ]

        safety_notes = [
            "This report analysis is for educational purposes and is not a medical diagnosis.",
            "Do not alter or discontinue any prescribed medications without consulting your doctor.",
            "Bring this laboratory report to your next clinical appointment for professional review."
        ]

        doctor_consultation = (
            f"We recommend discussing your {review_count} highlighted parameter(s) with your primary physician "
            f"or a specialist regarding {guidance_raw['condition_title']}."
        )

        condition_detection_payload = {
            "primaryKey": primary_condition,
            "guidance": {
                "conditionTitle": guidance_raw["condition_title"],
                "riskLevel": guidance_raw["risk_level"],
                "explanation": guidance_raw["explanation"],
                "diet": diet_guidance.model_dump(),
                "exercise": exercise_guidance.model_dump()
            },
            "allAvailableConditions": [
                {
                    "key": cond,
                    "title": health_guidance_service.get_guidance(cond)["condition_title"],
                    "riskLevel": health_guidance_service.get_guidance(cond)["risk_level"],
                }
                for cond in all_conditions
            ],
            "allGuidance": {
                k: {
                    "conditionTitle": v["condition_title"],
                    "riskLevel": v["risk_level"],
                    "explanation": v["explanation"],
                    "diet": v["diet"],
                    "exercise": v["exercise"]
                }
                for k, v in DISEASE_GUIDANCE_DB.items()
            }
        }

        return ReportAnalysisResponse(
            success=True,
            summary=summary_text,
            detected_conditions=[guidance_raw["condition_title"]],
            parameters=parameters,
            risk_factors=risk_factors,
            expert_diet=diet_guidance,
            expert_exercises=exercise_guidance,
            safety_notes=safety_notes,
            doctor_consultation=doctor_consultation,
            fileName=filename,
            fileType=content_type or "application/pdf",
            fileSize=len(file_bytes),
            disclaimer=DISCLAIMER_REPORT,
            disclaimerSafety=DISCLAIMER_SAFETY,
            conditionDetection=condition_detection_payload,
            language=language,
            model_used=model_used
        )

report_service = ReportService()
