const AIAssistanceActivity = require('../models/AIAssistanceActivity');
const aiAssistantService = require('../services/aiAssistant');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Helper to call FastAPI AI Microservice with timeout and error handling
 */
const callFastAPI = async (endpoint, options = {}) => {
  const url = `${AI_SERVICE_URL}${endpoint}`;
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs || 90000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      let errorJson = null;
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        // Not JSON
      }
      const message = errorJson?.detail || errorJson?.message || `AI service returned HTTP ${response.status}`;
      const err = new Error(message);
      err.status = response.status;
      throw err;
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      const timeoutErr = new Error('AI microservice request timed out.');
      timeoutErr.status = 504;
      throw timeoutErr;
    }
    throw error;
  }
};

// @desc    AI Health Assistant Chat endpoint (Node -> FastAPI -> Ollama)
// @route   POST /api/ai/chat
// @access  Private (Patient/Doctor/Admin)
const chatWithAI = async (req, res, next) => {
  try {
    const {
      message,
      language = 'English',
      reportContext = null,
      report_context = null,
      simpleLanguage = false,
      simple_language = false,
      history = [],
    } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid question or message for the AI Health Assistant.',
      });
    }

    const patientContext = {
      patientId: req.user?._id,
      name: req.user?.name,
    };

    let aiResponse = null;

    try {
      // Forward to Python FastAPI AI microservice
      aiResponse = await callFastAPI('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
          language: language || 'English',
          patient_context: patientContext,
          report_context: reportContext || report_context,
          simple_language: Boolean(simpleLanguage || simple_language),
          history: history || [],
        }),
        timeoutMs: 60000,
      });
    } catch (fastApiError) {
      console.warn('⚠️ FastAPI chat microservice unavailable, using local clinical fallback:', fastApiError.message);
      // Fallback to local clinical service
      const localResult = await aiAssistantService.handleChat({
        message,
        history,
        reportContext: reportContext || report_context,
      });
      aiResponse = {
        success: true,
        reply: localResult.reply,
        language: language || 'English',
        disclaimer: localResult.disclaimer,
        action: localResult.action || null,
        simple_language_used: false,
        model_used: 'clinical_engine_fallback',
      };
    }

    // Persist activity
    if (req.user?._id) {
      try {
        await AIAssistanceActivity.create({
          patientId: req.user._id,
          actionType: 'CHAT_CONSULTATION',
          title: 'AI Health Chat',
          summary: `Asked: "${message.slice(0, 70)}${message.length > 70 ? '...' : ''}"`,
          details: { language, modelUsed: aiResponse.model_used },
        });
      } catch (logErr) {
        console.warn('Could not record AI activity:', logErr.message);
      }
    }

    res.status(200).json({
      success: true,
      data: aiResponse,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Analyze uploaded PDF or Image medical report (Node -> FastAPI -> Ollama)
// @route   POST /api/ai/analyze-report
// @access  Private (Patient)
const analyzeReport = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a medical report file in PDF, JPG, JPEG, or PNG format (max 10 MB).',
      });
    }

    const { buffer, mimetype, originalname, size } = req.file;
    const language = req.body.language || 'English';
    const simpleLanguage = req.body.simple_language === 'true' || req.body.simpleLanguage === 'true';

    let analysisResult = null;

    try {
      // Build FormData for multipart POST to FastAPI
      const formData = new FormData();
      const fileBlob = new Blob([buffer], { type: mimetype });
      formData.append('file', fileBlob, originalname);
      formData.append('language', language);
      formData.append('simple_language', String(simpleLanguage));

      analysisResult = await callFastAPI('/api/report/analyze', {
        method: 'POST',
        body: formData,
        timeoutMs: 90000,
      });
    } catch (fastApiError) {
      console.warn('⚠️ FastAPI report analysis unavailable, using local clinical fallback:', fastApiError.message);
      // Fallback to local clinical service
      analysisResult = await aiAssistantService.analyzeReportFile({
        buffer,
        mimetype,
        originalname,
      });
      analysisResult.model_used = 'clinical_engine_fallback';
    }

    // Persist activity
    if (req.user?._id) {
      try {
        const paramCount = analysisResult.parameters?.length || 10;
        await AIAssistanceActivity.create({
          patientId: req.user._id,
          actionType: 'REPORT_EXPLANATION',
          title: 'Medical Report Analyzed',
          summary: `Analyzed ${originalname} (${paramCount} parameters detected)`,
          details: {
            fileName: originalname,
            fileType: mimetype,
            fileSize: size,
            parametersCount: paramCount,
            modelUsed: analysisResult.model_used,
          },
        });
      } catch (logErr) {
        console.warn('Could not record AI activity:', logErr.message);
      }
    }

    res.status(200).json({
      success: true,
      data: analysisResult,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Translate medical guidance into selected language (Node -> FastAPI -> Ollama)
// @route   POST /api/ai/translate
// @access  Private (Patient/Doctor)
const translateText = async (req, res, next) => {
  try {
    const { text, source_language = 'English', target_language = 'English' } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Please provide text to translate.',
      });
    }

    let result = null;

    try {
      result = await callFastAPI('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          source_language,
          target_language,
        }),
        timeoutMs: 40000,
      });
    } catch (err) {
      console.warn('⚠️ FastAPI translation unavailable, returning source text:', err.message);
      result = {
        success: true,
        original_text: text,
        translated_text: text,
        source_language,
        target_language,
        model_used: 'fallback_original',
      };
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Retrieve condition-specific diet and exercise guidance (Node -> FastAPI)
// @route   POST /api/ai/health-guidance
// @access  Private (Patient)
const getHealthGuidance = async (req, res, next) => {
  try {
    const { condition = 'GENERAL_WELLNESS', language = 'English' } = req.body;

    let guidance = null;

    try {
      const resp = await callFastAPI('/api/health-guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ condition, language }),
        timeoutMs: 15000,
      });
      guidance = resp.data;
    } catch (err) {
      guidance = aiAssistantService.getDiseaseGuidance(condition);
    }

    res.status(200).json({
      success: true,
      data: guidance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Voice command processor (Node -> FastAPI)
// @route   POST /api/ai/voice
// @access  Private (Patient)
const processVoice = async (req, res, next) => {
  try {
    const { transcript, language = 'English', simple_language = false, report_context = null } = req.body;

    if (!transcript) {
      return res.status(400).json({
        success: false,
        message: 'Please provide speech transcript.',
      });
    }

    let response = null;

    try {
      response = await callFastAPI('/api/voice/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          language,
          simple_language,
          report_context,
        }),
        timeoutMs: 60000,
      });
    } catch (err) {
      console.warn('⚠️ FastAPI voice service unavailable:', err.message);
      response = {
        success: true,
        action: 'ANSWER_CHAT',
        speech_text: 'I could not reach the local AI engine. Your analyzed report parameters are displayed above.',
        display_text: 'AI engine currently unavailable. Please ensure Ollama is running.',
        language,
        voice_locale: 'en-US',
      };
    }

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Microservice health check (Node -> FastAPI)
// @route   GET /api/ai/health
// @access  Public
const getAIHealth = async (req, res) => {
  try {
    const health = await callFastAPI('/health', { timeoutMs: 5000 });
    res.status(200).json({
      success: true,
      ai_microservice: health,
    });
  } catch (err) {
    res.status(200).json({
      success: false,
      ai_microservice: {
        status: 'degraded',
        ollama: 'unavailable',
        model: 'unknown',
        error: 'FastAPI microservice is currently unreachable on port 8000.',
      },
    });
  }
};

// @desc    Generate Doctor Clinical AI Summary & Differential Diagnosis
// @route   POST /api/ai/doctor-clinical-summary
// @access  Private (Doctor / Admin)
const generateDoctorClinicalSummary = async (req, res, next) => {
  try {
    const {
      patientName = 'Patient',
      age,
      gender,
      bloodGroup,
      vitals = {},
      conditions = [],
      allergies = [],
      symptoms = '',
      medicalHistory = '',
      riskLevel = 'MODERATE',
    } = req.body;

    const clinicalPrompt = `You are an expert Clinical Decision Support AI Assistant for licensed physicians and cardiometabolic specialists.
Analyze this patient presentation and provide a concise, high-yield clinical case summary for the consulting doctor:

PATIENT PROFILE:
- Name: ${patientName}
- Age / Gender: ${age || 'Unknown'} / ${gender || 'Unknown'}
- Blood Group: ${bloodGroup || 'Not specified'}
- Current Risk Stratification: ${riskLevel}

VITALS TELEMETRY:
- Blood Pressure: ${vitals.bloodPressure || (vitals.systolicBP ? `${vitals.systolicBP}/${vitals.diastolicBP} mmHg` : 'Not recorded')}
- Heart Rate: ${vitals.heartRate ? `${vitals.heartRate} BPM` : 'Not recorded'}
- SpO2: ${vitals.spo2 ? `${vitals.spo2}%` : 'Not recorded'}
- Blood Glucose: ${vitals.bloodGlucose ? `${vitals.bloodGlucose} mg/dL` : 'Not recorded'}
- Temperature: ${vitals.temperature ? `${vitals.temperature} °C` : 'Not recorded'}

KNOWN CONDITIONS & ALLERGIES:
- Chronic Conditions: ${conditions.length ? conditions.join(', ') : 'None documented'}
- Allergies: ${allergies.length ? allergies.join(', ') : 'NKDA (No known drug allergies)'}
- Presenting Symptoms / Notes: ${symptoms || medicalHistory || 'Routine clinical review'}

FORMAT YOUR RESPONSE IN PROFESSIONAL MEDICAL SECTIONS:
1. CLINICAL IMPRESSION & RISK LEVEL
2. DIFFERENTIAL DIAGNOSES (Top 3 with rationale)
3. RECOMMENDED WORKUP (Targeted labs or imaging)
4. THERAPEUTIC & LIFESTYLE CONSIDERATIONS
5. RED FLAGS & CRITICAL WARNING SIGNS`;

    let clinicalResult = null;
    try {
      const aiResponse = await callFastAPI('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: clinicalPrompt,
          language: 'English',
          simple_language: false,
        }),
        timeoutMs: 60000,
      });
      clinicalResult = {
        summary: aiResponse.reply || aiResponse.data?.reply,
        model_used: aiResponse.model_used || 'qwen3:4b-instruct',
        timestamp: new Date().toISOString(),
      };
    } catch (apiErr) {
      console.warn('⚠️ FastAPI clinical summary unavailable, falling back to rule-based summary:', apiErr.message);
      clinicalResult = {
        summary: `### 🩺 Clinical Impression
Patient ${patientName} presents with a ${riskLevel} clinical risk profile. Vitals show BP: ${vitals.bloodPressure || (vitals.systolicBP ? `${vitals.systolicBP}/${vitals.diastolicBP} mmHg` : 'N/A')}, HR: ${vitals.heartRate || 'N/A'} BPM, SpO2: ${vitals.spo2 || 'N/A'}%, Glucose: ${vitals.bloodGlucose || 'N/A'} mg/dL.

### 🔬 Differential Diagnoses & Clinical Focus
1. **Metabolic Dysregulation / Glycemic Instability**: Correlate blood glucose with HbA1c testing.
2. **Cardiovascular / Vascular Tension**: Review ambulatory blood pressure profile and renin-angiotensin medications.
3. **Electrolyte & Renal Balance**: Evaluate eGFR, serum creatinine, and microalbuminuria.

### 🧪 Recommended Workup
- Fasting Lipid Profile & HbA1c
- Comprehensive Metabolic Panel (CMP)
- Resting 12-lead ECG and continuous remote telemetry monitoring

### 💊 Therapeutic Considerations
- Maintain targeted lifestyle intervention (Mediterranean diet, low glycemic index foods).
- Titrate anti-hypertensive and hypoglycemic medications in accordance with telemetry trends.

### ⚠️ Red Flags
Immediate emergency referral if BP > 180/120 mmHg, acute chest discomfort, dyspnea at rest, or SpO2 < 92%.`,
        model_used: 'clinical_expert_rules_fallback',
        timestamp: new Date().toISOString(),
      };
    }

    res.status(200).json({
      success: true,
      data: clinicalResult,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  chatWithAI,
  analyzeReport,
  translateText,
  getHealthGuidance,
  processVoice,
  getAIHealth,
  generateDoctorClinicalSummary,
};
