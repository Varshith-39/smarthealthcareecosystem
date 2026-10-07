"""Medical Report Analysis Routes."""
from fastapi import APIRouter, File, Form, UploadFile
from app.models.report_models import ExplainReportTextRequest, ReportAnalysisResponse
from app.services.report_service import report_service
from app.utils.security import sanitize_filename, validate_uploaded_file

router = APIRouter(prefix="/api/report", tags=["Report Analysis"])

@router.post("/analyze", response_model=ReportAnalysisResponse)
async def analyze_report_endpoint(
    file: UploadFile = File(...),
    language: str = Form(default="English"),
    simple_language: bool = Form(default=False)
):
    """Analyzes uploaded PDF/Image report, extracts parameters, detects conditions, and returns diet/exercise."""
    safe_name = sanitize_filename(file.filename or "medical_report.pdf")
    
    # Read file content into memory
    content = await file.read()
    validate_uploaded_file(safe_name, file.content_type or "", len(content))

    result = await report_service.analyze_report(
        file_bytes=content,
        filename=safe_name,
        content_type=file.content_type or "application/pdf",
        language=language,
        simple_language=simple_language
    )

    return result

@router.post("/explain-text", response_model=ReportAnalysisResponse)
async def explain_report_text_endpoint(request: ExplainReportTextRequest):
    """Analyzes raw medical report text entered directly by patient or doctor."""
    raw_bytes = request.reportText.encode("utf-8")
    result = await report_service.analyze_report(
        file_bytes=raw_bytes,
        filename="Entered_Report_Parameters.txt",
        content_type="text/plain",
        language=request.language,
        simple_language=request.simple_language
    )
    return result
