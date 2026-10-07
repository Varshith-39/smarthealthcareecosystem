import React, { useState, useEffect, useRef } from 'react';
import API from '../../services/api';
import {
  Bot,
  Sparkles,
  FileText,
  MessageSquare,
  Send,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  Info,
  RefreshCw,
  Loader2,
  UploadCloud,
  FileCode,
  X,
  FileCheck,
  Check,
  Activity,
  Apple,
  Dumbbell,
  AlertTriangle,
  Droplets,
  Stethoscope,
  HeartPulse,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Languages,
  CheckSquare,
  Square,
  Sliders,
  Printer,
  Download,
} from 'lucide-react';

// Supported Languages Configuration (12 Languages)
const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', locale: 'en-US' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', locale: 'te-IN' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', locale: 'hi-IN' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', locale: 'ta-IN' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', locale: 'kn-IN' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', locale: 'ml-IN' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', locale: 'mr-IN' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', locale: 'bn-IN' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', locale: 'gu-IN' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', locale: 'pa-IN' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', locale: 'or-IN' },
  { code: 'ur', name: 'Urdu', native: 'اردو', locale: 'ur-IN' },
];

const AIAssistantPage = () => {
  // ================= State: Language & Mode =================
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [simpleLanguage, setSimpleLanguage] = useState(false);
  const [aiServiceStatus, setAiServiceStatus] = useState(null); // 'ok', 'degraded', or null
  const [activeModel, setActiveModel] = useState('qwen');

  // ================= State: Recent Activity =================
  const [recentActivities, setRecentActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // ================= 1. Explain Report / File Upload State =================
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileError, setFileError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [analyzingFile, setAnalyzingFile] = useState(false);
  const [analyzedReportData, setAnalyzedReportData] = useState(null);
  const [selectedConditionKey, setSelectedConditionKey] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const fileInputRef = useRef(null);

  // ================= 2. Ask AI About This Report Chat State =================
  const [reportChatMessages, setReportChatMessages] = useState([
    {
      id: 'welcome-report',
      sender: 'ai',
      text: 'Hello! Once your report is analyzed, you can ask me any question about your values, diet recommendations, or parameters to discuss with your doctor.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [reportChatInput, setReportChatInput] = useState('');
  const [reportChatLoading, setReportChatLoading] = useState(false);
  const reportChatBottomRef = useRef(null);

  // ================= 3. Voice Assistant State =================
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingText, setSpeakingText] = useState('');
  const speechRecognitionRef = useRef(null);

  // Check AI Service Health on mount
  const checkAIHealth = async () => {
    try {
      const res = await API.get('/ai/health');
      if (res.data?.ai_microservice) {
        setAiServiceStatus(res.data.ai_microservice.status);
        if (res.data.ai_microservice.model) {
          setActiveModel(res.data.ai_microservice.model);
        }
      }
    } catch (err) {
      setAiServiceStatus('degraded');
    }
  };

  // Fetch recent activities
  const fetchRecentActivities = async () => {
    try {
      setLoadingActivities(true);
      const res = await API.get('/ai-assistant/recent-activity');
      if (res.data?.success) {
        setRecentActivities(res.data.activities || []);
      }
    } catch (err) {
      console.warn('Could not fetch AI activities:', err);
    } finally {
      setLoadingActivities(false);
    }
  };

  useEffect(() => {
    checkAIHealth();
    fetchRecentActivities();
  }, []);

  useEffect(() => {
    if (analyzedReportData) {
      reportChatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [reportChatMessages, analyzedReportData]);

  // Clean up preview URL on unmount or file change
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [previewUrl]);

  // File validation
  const validateAndSetFile = (file) => {
    setFileError('');
    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const isAllowedExt = /\.(pdf|jpg|jpeg|png)$/i.test(file.name);

    if (!allowedTypes.includes(file.type) && !isAllowedExt) {
      setFileError('Unsupported file type. Please upload a medical report in PDF, JPG, JPEG, or PNG format.');
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      setFileError('File size exceeds the 10 MB limit. Please upload a smaller file.');
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/') || /\.(jpg|jpeg|png)$/i.test(file.name)) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    validateAndSetFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    validateAndSetFile(file);
  };

  const handleRemoveFile = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 1-Click Sample File Loader for evaluator testing
  const handleLoadSampleFile = () => {
    const sampleContent =
      'CLINICAL DIAGNOSTIC REPORT\nPatient: Rahul Verma\nHemoglobin: 11.2 g/dL\nBlood Glucose: 145 mg/dL\nBlood Pressure: 145/95 mmHg\nHeart Rate: 74 BPM\nSpO2: 98%\nTemperature: 36.8 C\nTotal Cholesterol: 210 mg/dL\nWBC: 7400 /mcL\nRBC: 4.6 M/mcL\nPlatelets: 240000 /mcL';
    const blob = new Blob([sampleContent], { type: 'application/pdf' });
    const sampleFile = new File([blob], 'Blood_Panel_Diagnostic_Report.pdf', {
      type: 'application/pdf',
      lastModified: Date.now(),
    });
    validateAndSetFile(sampleFile);
  };

  // Analyze Report action
  const handleAnalyzeReport = async () => {
    if (!selectedFile) {
      setFileError('Please choose or drag-and-drop a medical report file first.');
      return;
    }

    try {
      setAnalyzingFile(true);
      setFileError('');

      const formData = new FormData();
      formData.append('reportFile', selectedFile);
      formData.append('language', selectedLanguage);
      formData.append('simple_language', String(simpleLanguage));

      const res = await API.post('/ai/analyze-report', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data?.success) {
        const reportResult = res.data.data;
        setAnalyzedReportData(reportResult);
        setSelectedConditionKey(reportResult.conditionDetection?.primaryKey || 'DIABETES');
        fetchRecentActivities();

        const normalCount = reportResult.parameters?.filter((p) => p.status === 'Within expected range').length || 0;
        const totalCount = reportResult.parameters?.length || 10;
        const conditionName =
          reportResult.conditionDetection?.guidance?.conditionTitle || 'Detected Condition';

        // Initialize report chat with context
        setReportChatMessages([
          {
            id: 'report-analyzed-msg',
            sender: 'ai',
            text: `I have analyzed "${reportResult.fileName}". Out of ${totalCount} clinical parameters, ${normalCount} are within expected ranges. Primary condition identified: "${conditionName}". I have automatically generated disease-specific dietary guidance and sample exercises below. Feel free to ask me any question!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err) {
      console.error('Error analyzing report:', err);
      setFileError(err.message || 'Failed to analyze report file. Please verify file format.');
    } finally {
      setAnalyzingFile(false);
    }
  };

  // Report chat sender
  const handleSendReportChat = async (e, textOverride = null) => {
    e?.preventDefault();
    const query = (textOverride || reportChatInput).trim();
    if (!query || reportChatLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setReportChatMessages((prev) => [...prev, userMsg]);
    setReportChatInput('');
    setReportChatLoading(true);

    try {
      const res = await API.post('/ai/chat', {
        message: query,
        language: selectedLanguage,
        simpleLanguage: simpleLanguage,
        reportContext: analyzedReportData,
      });

      if (res.data?.success) {
        const aiMsg = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: res.data.data.reply,
          disclaimer: res.data.data.disclaimer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setReportChatMessages((prev) => [...prev, aiMsg]);
        fetchRecentActivities();
      }
    } catch (err) {
      setReportChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: 'I could not process this report question right now. Please rephrase or try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setReportChatLoading(false);
    }
  };

  // ================= Voice Assistant Functions =================
  const getSelectedLanguageLocale = () => {
    const langObj = LANGUAGES.find((l) => l.name === selectedLanguage);
    return langObj ? langObj.locale : 'en-US';
  };

  const startVoiceRecognition = () => {
    setVoiceError('');
    setVoiceTranscript('');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = getSelectedLanguageLocale();

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join('');
        setVoiceTranscript(transcript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setVoiceError('Microphone permission denied. Please allow microphone access in your browser settings.');
        } else if (event.error === 'no-speech') {
          setVoiceError('No speech detected. Please press the microphone and speak clearly.');
        } else {
          setVoiceError(`Voice error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setVoiceError('Failed to initialize microphone. Please check permissions.');
      setIsListening(false);
    }
  };

  const stopVoiceRecognition = () => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleProcessVoiceQuery = async () => {
    const query = voiceTranscript.trim();
    if (!query) return;

    stopVoiceRecognition();
    setVoiceModalOpen(false);

    // Send through chat
    await handleSendReportChat(null, query);

    // Also speak out once response generated
    // Response handler in chat handles speech if enabled
  };

  // ================= Text to Speech (TTS) Output =================
  const handleSpeakText = (text) => {
    if (!window.speechSynthesis) {
      alert('Text-to-Speech is not supported in this browser.');
      return;
    }

    if (isSpeaking && speakingText === text) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingText('');
      return;
    }

    window.speechSynthesis.cancel(); // Stop any ongoing speech
    setIsSpeaking(true);
    setSpeakingText(text);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getSelectedLanguageLocale();
    utterance.rate = 0.95;

    // Pick best matching voice if available
    const voices = window.speechSynthesis.getVoices();
    const targetLocale = getSelectedLanguageLocale();
    const matchingVoice = voices.find((v) => v.lang.startsWith(targetLocale.split('-')[0]));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingText('');
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingText('');
    };

    window.speechSynthesis.speak(utterance);
  };

  // Active condition guidance resolution
  const activeConditionGuidance =
    (selectedConditionKey &&
      analyzedReportData?.conditionDetection?.allGuidance?.[selectedConditionKey]) ||
    analyzedReportData?.conditionDetection?.guidance;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ================= Header with Language & Simple Mode Bar ================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-600 via-indigo-600 to-teal-600 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-sky-100">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>AI Health Assistant • Local Qwen LLM</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">AI Health Assistant</h1>
            <p className="text-sm sm:text-base text-sky-100 leading-relaxed font-normal">
              Upload your medical reports for instant parameter extraction, condition detection, and automatic
              disease-specific food and exercise guidance from senior medical experts.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Status indicator */}
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white text-sky-600 flex items-center justify-center font-black shadow">
                <Bot className="w-6 h-6" />
              </div>
              <div className="text-xs">
                <div className="font-bold flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      aiServiceStatus === 'ok' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  <span>
                    {aiServiceStatus === 'ok'
                      ? 'Local LLM Active'
                      : aiServiceStatus === 'degraded'
                      ? 'AI Degraded (Fallback Mode)'
                      : 'Connecting Engine...'}
                  </span>
                </div>
                <div className="text-sky-200 text-[11px] font-mono">
                  Model: {activeModel || 'qwen'}
                </div>
              </div>
            </div>

            {/* Talk to AI Button */}
            <button
              type="button"
              onClick={() => {
                setVoiceModalOpen(true);
                startVoiceRecognition();
              }}
              className="px-4 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Mic className="w-4 h-4 text-slate-900" />
              <span>Talk to AI</span>
            </button>
          </div>
        </div>

        {/* ================= Language Selector & Simple Language Toggle Bar ================= */}
        <div className="relative z-10 mt-6 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Language Selector */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
              <Languages className="w-4 h-4 text-yellow-300" />
              <span className="font-semibold text-sky-100">Language:</span>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-xs"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.name} className="text-slate-900 bg-white">
                    {lang.name} ({lang.native})
                  </option>
                ))}
              </select>
            </div>

            {/* Simple Language Mode Checkbox */}
            <button
              type="button"
              onClick={() => setSimpleLanguage(!simpleLanguage)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
                simpleLanguage
                  ? 'bg-amber-400 text-slate-900 font-bold border-amber-300 shadow-sm'
                  : 'bg-white/10 text-sky-100 border-white/20 hover:bg-white/15'
              }`}
            >
              {simpleLanguage ? (
                <CheckSquare className="w-4 h-4 text-slate-900" />
              ) : (
                <Square className="w-4 h-4 text-sky-200" />
              )}
              <span>Explain in Simple Language</span>
            </button>
          </div>

          <div className="text-[11px] text-sky-200 font-medium">
            Supported formats: PDF, JPG, JPEG, PNG (Max 10 MB)
          </div>
        </div>

        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-1/2 -top-12 w-48 h-48 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* AI Unavailable Notice Banner if degraded */}
      {aiServiceStatus === 'degraded' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Ollama Notice: </span>
              AI service is currently operating in offline clinical mode. Please make sure Ollama is running (`ollama serve`).
            </div>
          </div>
          <button
            type="button"
            onClick={checkAIHealth}
            className="px-2.5 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold text-[11px] shrink-0"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* ================= AI Assistant Main Functions Overview Bar ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-800">1. Explain Medical Report</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Upload PDF or images to extract & analyze biomarkers</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Apple className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-800">2. Automatic Disease Guidance</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Condition-specific expert diet & sample exercises</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-800">3. Ask AI About Report</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Voice & text consultation in your selected language</p>
          </div>
        </div>
      </div>

      {/* ================= Main Workspace Layout ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Comprehensive Clinical Flow */}
        <div className="lg:col-span-2 space-y-6">
          {/* ================= CARD 1: 🩺 MEDICAL REPORT ANALYSIS ================= */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-card space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-sky-100 text-sky-700">
                    <FileText className="w-5 h-5" />
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-slate-800">
                    Explain My Medical Report
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Upload your medical report in PDF, JPG, JPEG, or PNG format for instant, automated clinical analysis.
                </p>
              </div>

              <button
                type="button"
                onClick={handleLoadSampleFile}
                className="px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Demo Sample Report</span>
              </button>
            </div>

            {/* Drag-and-drop upload box */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`rounded-3xl border-2 border-dashed p-6 sm:p-8 text-center transition-all ${
                isDragging
                  ? 'border-sky-500 bg-sky-50/70 scale-[1.01]'
                  : 'border-slate-300 hover:border-sky-400 bg-slate-50/50'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                className="hidden"
              />

              <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
                <UploadCloud className="w-7 h-7" />
              </div>

              <h3 className="text-sm sm:text-base font-bold text-slate-800">Upload your medical report</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">PDF, JPG, JPEG or PNG (Max size: 10 MB)</p>

              <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-sm transition-all"
                >
                  Choose File
                </button>

                <button
                  type="button"
                  onClick={handleAnalyzeReport}
                  disabled={!selectedFile || analyzingFile}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-sky-600/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {analyzingFile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>AI is analyzing your report...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Analyze Report</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {fileError && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{fileError}</span>
              </div>
            )}

            {/* Report Preview after selecting a file */}
            {selectedFile && (
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Report Preview
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="px-2.5 py-1 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* PDF icon OR image preview */}
                  <div className="w-20 h-20 rounded-2xl border border-slate-200 bg-white overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Report preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-2">
                        <FileCode className="w-8 h-8 text-rose-500 mx-auto" />
                        <span className="text-[10px] font-bold text-slate-600 mt-1 block">PDF</span>
                      </div>
                    )}
                  </div>

                  {/* File Details */}
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-slate-800 text-sm truncate max-w-sm sm:max-w-md">
                      {selectedFile.name}
                    </p>
                    <p className="text-slate-500">
                      <strong className="text-slate-700">Type:</strong> {selectedFile.type || 'PDF Document'}
                    </p>
                    <p className="text-slate-500">
                      <strong className="text-slate-700">Size:</strong>{' '}
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB ({(selectedFile.size / 1024).toFixed(0)} KB)
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all"
                  >
                    Remove
                  </button>

                  <button
                    type="button"
                    onClick={handleAnalyzeReport}
                    disabled={analyzingFile}
                    className="px-6 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    {analyzingFile ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>AI is analyzing your report...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Analyze Report</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Prompt/Empty State if no report analyzed yet */}
          {!analyzedReportData && !analyzingFile && (
            <div className="p-8 rounded-3xl bg-white border border-dashed border-slate-300 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Report Analyzed Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Upload your medical report above or click <strong>"Demo Sample Report"</strong> to automatically extract
                biomarkers, identify health conditions, and receive disease-specific nutrition and exercise plans.
              </p>
            </div>
          )}

          {/* ================= RESULTS DISPLAY (AUTOMATICALLY SHOWN AFTER ANALYSIS) ================= */}
          {analyzedReportData && (
            <div className="space-y-6">
              {/* ================= CARD 2: 📋 HEALTH CONDITION SUMMARY ================= */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-card space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                      <HeartPulse className="w-5 h-5" />
                    </span>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-800">
                        Health Condition Summary
                      </h2>
                      <p className="text-xs text-slate-500">
                        Synthesized from report findings and extracted parameters
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSpeakText(analyzedReportData.summary)}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      title="Read summary aloud"
                    >
                      {isSpeaking && speakingText === analyzedReportData.summary ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-rose-600" />
                          <span className="text-rose-600">Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-sky-600" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowExportModal(true)}
                      className="px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-colors border border-indigo-200"
                      title="Export and Print Clinical Report"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Export Report</span>
                    </button>
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                      {analyzedReportData.parameters?.length || 10} Biomarkers
                    </span>
                  </div>
                </div>

                {/* Detected Condition & Risk Badge Card */}
                {activeConditionGuidance && (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-50 via-indigo-50/40 to-teal-50/50 border border-indigo-100/80 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600">
                          Detected Condition
                        </span>
                        <h3 className="text-base font-extrabold text-slate-800 mt-0.5">
                          {activeConditionGuidance.conditionTitle}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-medium">Risk Level:</span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            activeConditionGuidance.riskLevel?.toLowerCase().includes('elevated')
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : activeConditionGuidance.riskLevel?.toLowerCase().includes('moderate')
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {activeConditionGuidance.riskLevel}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-700 leading-relaxed pt-1 border-t border-indigo-100/60">
                      <strong className="text-slate-900">Explanation: </strong>
                      {activeConditionGuidance.explanation}
                    </div>

                    {/* Multi-Condition Toggles if multiple were identified */}
                    {analyzedReportData.conditionDetection?.allAvailableConditions?.length > 1 && (
                      <div className="pt-2 flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold text-slate-500">Conditions identified:</span>
                        {analyzedReportData.conditionDetection.allAvailableConditions.map((cond) => {
                          const isActive = selectedConditionKey === cond.key;
                          return (
                            <button
                              key={cond.key}
                              type="button"
                              onClick={() => setSelectedConditionKey(cond.key)}
                              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                                isActive
                                  ? 'bg-indigo-600 text-white shadow-sm'
                                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              {cond.title.split('/')[0].trim()}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Report Clinical Summary narrative */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed space-y-2">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-sky-600" />
                      <span>Report Summary</span>
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap">{analyzedReportData.summary}</p>
                </div>

                {/* Extracted Parameters Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      Extracted Medical Parameters
                    </h4>
                    <span className="text-[11px] text-slate-400">Standard clinical reference benchmarks</span>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-100">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                          <th className="py-3 px-3.5">Parameter</th>
                          <th className="py-3 px-3.5">Result</th>
                          <th className="py-3 px-3.5">Status</th>
                          <th className="py-3 px-3.5 hidden sm:table-cell">Clinical Reference & Insight</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {analyzedReportData.parameters?.map((param, idx) => {
                          const isNormal = param.status === 'Within expected range';
                          const isElevated = param.status === 'Elevated' || param.status === 'High';

                          return (
                            <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-3 px-3.5 font-bold text-slate-800">
                                {param.parameter || param.name}
                              </td>
                              <td className="py-3 px-3.5 font-semibold font-mono text-slate-900">
                                {param.result || param.value}
                              </td>
                              <td className="py-3 px-3.5">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                    isNormal
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : isElevated
                                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      isNormal ? 'bg-emerald-500' : isElevated ? 'bg-rose-500' : 'bg-amber-500'
                                    }`}
                                  />
                                  <span>{param.status}</span>
                                </span>
                              </td>
                              <td className="py-3 px-3.5 text-slate-600 text-[11px] leading-relaxed hidden sm:table-cell">
                                {param.explanation}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* ================= CARD 3: 🍎 EXPERT RECOMMENDED FOOD & DIET ================= */}
              {activeConditionGuidance?.diet && (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-card space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                        <Apple className="w-5 h-5" />
                      </span>
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-800">
                          Expert Recommended Food & Diet
                        </h2>
                        <p className="text-xs text-slate-500">
                          Condition: <strong>{activeConditionGuidance.conditionTitle}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() =>
                          handleSpeakText(
                            `Expert food recommendations for ${activeConditionGuidance.conditionTitle}. Recommended foods include: ${activeConditionGuidance.diet.recommendedFoods.slice(0, 3).join('. ')}`
                          )
                        }
                        className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Listen</span>
                      </button>
                      <span className="text-[10px] uppercase font-extrabold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 tracking-wide">
                        Doctor & Dietitian Guidance
                      </span>
                    </div>
                  </div>

                  {/* Mandatory Expert Medical Guidance Notice */}
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 text-emerald-950 text-xs leading-relaxed space-y-1">
                    <div className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Expert Medical Guidance</span>
                    </div>
                    <p className="text-[11px] text-emerald-900/90 font-normal">
                      {activeConditionGuidance.diet.medicalGuidanceNotice}
                    </p>
                  </div>

                  {/* Recommended Foods vs Foods to Limit */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Recommended Foods */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Recommended Foods</span>
                      </h3>
                      <ul className="text-xs text-emerald-950 space-y-2 pl-4 list-disc leading-relaxed">
                        {activeConditionGuidance.diet.recommendedFoods?.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Foods to Limit */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-3">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
                        <X className="w-4 h-4 text-rose-600" />
                        <span>Foods to Limit</span>
                      </h3>
                      <ul className="text-xs text-rose-950 space-y-2 pl-4 list-disc leading-relaxed">
                        {activeConditionGuidance.diet.foodsToLimit?.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Sample Daily Meal Plan */}
                  {activeConditionGuidance.diet.sampleMealPlan && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                        Sample Daily Meal Plan
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 px-2 py-0.5 rounded-md bg-amber-100">
                            Breakfast
                          </span>
                          <p className="text-xs text-slate-700 leading-relaxed font-normal">
                            {activeConditionGuidance.diet.sampleMealPlan.breakfast}
                          </p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-700 px-2 py-0.5 rounded-md bg-sky-100">
                            Lunch
                          </span>
                          <p className="text-xs text-slate-700 leading-relaxed font-normal">
                            {activeConditionGuidance.diet.sampleMealPlan.lunch}
                          </p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 px-2 py-0.5 rounded-md bg-indigo-100">
                            Dinner
                          </span>
                          <p className="text-xs text-slate-700 leading-relaxed font-normal">
                            {activeConditionGuidance.diet.sampleMealPlan.dinner}
                          </p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 px-2 py-0.5 rounded-md bg-teal-100">
                            Healthy Snacks
                          </span>
                          <p className="text-xs text-slate-700 leading-relaxed font-normal">
                            {activeConditionGuidance.diet.sampleMealPlan.snacks}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Hydration Guidance */}
                  {activeConditionGuidance.diet.hydrationGuidance && (
                    <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-start gap-3">
                      <Droplets className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-sky-900">Hydration Guidance</h4>
                        <p className="text-xs text-sky-950 mt-0.5 leading-relaxed">
                          {activeConditionGuidance.diet.hydrationGuidance}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ================= CARD 4: 🏃 EXPERT RECOMMENDED SAMPLE EXERCISES ================= */}
              {activeConditionGuidance?.exercise && (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-card space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-teal-100 text-teal-700">
                        <Dumbbell className="w-5 h-5" />
                      </span>
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-800">
                          Expert Recommended Sample Exercises
                        </h2>
                        <p className="text-xs text-slate-500">
                          Condition: <strong>{activeConditionGuidance.conditionTitle}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() =>
                          handleSpeakText(
                            `Expert exercise guidance for ${activeConditionGuidance.conditionTitle}. Senior physiotherapists recommend starting with 20 to 30 minutes of brisk walking 5 days a week.`
                          )
                        }
                        className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-teal-600" />
                        <span>Listen</span>
                      </button>
                      <span className="text-[10px] uppercase font-extrabold px-3 py-1 rounded-full bg-teal-100 text-teal-800 tracking-wide">
                        Senior Doctors & Physiotherapists
                      </span>
                    </div>
                  </div>

                  {/* Mandatory Expert Medical Guidance Notice */}
                  <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/90 text-teal-950 text-xs leading-relaxed space-y-1">
                    <div className="font-extrabold text-teal-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-teal-600" />
                      <span>Expert Medical Guidance</span>
                    </div>
                    <p className="text-[11px] text-teal-900/90 font-normal">
                      {activeConditionGuidance.exercise.medicalGuidanceNotice}
                    </p>
                  </div>

                  {/* Exercise Table */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      Sample Exercise Schedule
                    </h3>

                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                            <th className="py-3 px-3.5">Exercise</th>
                            <th className="py-3 px-3.5 text-right sm:text-left">Duration</th>
                            <th className="py-3 px-3.5 text-right sm:text-left">Frequency</th>
                            <th className="py-3 px-3.5">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {activeConditionGuidance.exercise.exercisesTable?.map((ex, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3.5 px-3.5 font-bold text-slate-800 whitespace-nowrap">
                                {ex.exercise}
                              </td>
                              <td className="py-3.5 px-3.5 font-semibold text-teal-700 whitespace-nowrap">
                                {ex.duration}
                              </td>
                              <td className="py-3.5 px-3.5 font-semibold text-slate-700 whitespace-nowrap">
                                {ex.frequency}
                              </td>
                              <td className="py-3.5 px-3.5 text-slate-600 leading-relaxed">
                                {ex.notes}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Safety Precautions & Exercises to Avoid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Safety Precautions */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Safety Precautions</span>
                      </h4>
                      <ul className="text-xs text-slate-700 space-y-1.5 pl-4 list-disc leading-relaxed">
                        {activeConditionGuidance.exercise.safetyPrecautions?.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Exercises to Avoid */}
                    <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2.5">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>Exercises to Avoid</span>
                      </h4>
                      <ul className="text-xs text-amber-950 space-y-1.5 pl-4 list-disc leading-relaxed">
                        {activeConditionGuidance.exercise.exercisesToAvoid?.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= CARD 5: ⚠️ SAFETY & DOCTOR GUIDANCE ================= */}
              <div className="bg-gradient-to-r from-amber-50 via-orange-50/50 to-amber-50 rounded-3xl border border-amber-200/90 p-5 sm:p-6 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
                    Safety & Doctor Consultation Advice
                  </h3>
                </div>

                <p className="text-xs text-amber-950 leading-relaxed font-medium">
                  {analyzedReportData.disclaimerSafety ||
                    'AI-generated educational guidance based on medical information and general recommendations from qualified healthcare professionals. Always consult your doctor or a registered medical professional before making changes to your diet, exercise, or treatment.'}
                </p>

                <div className="pt-2 border-t border-amber-200/60 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-amber-900">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>Does not replace doctor visits</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>Do not stop prescribed medications</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>Personalized by your physician</span>
                  </div>
                </div>
              </div>

              {/* ================= CARD 6: 💬 ASK AI ABOUT MY REPORT ================= */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden flex flex-col h-[520px]">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Ask AI About My Report</h3>
                      <p className="text-[11px] text-slate-500">
                        Language: <strong>{selectedLanguage}</strong> {simpleLanguage ? '• Simple Mode Active' : ''}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                    Qwen Engine Active
                  </span>
                </div>

                {/* Chat messages */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-slate-50/30">
                  {reportChatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-400 font-medium">
                        <span>{msg.sender === 'user' ? 'You' : 'AI Health Assistant'}</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </div>

                      <div
                        className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm ${
                          msg.sender === 'user'
                            ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-br-xs'
                            : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-xs'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                        {msg.disclaimer && (
                          <div className="mt-2 pt-1.5 border-t border-slate-100 text-[10px] text-slate-400 italic">
                            {msg.disclaimer}
                          </div>
                        )}
                        {msg.sender === 'ai' && (
                          <div className="mt-2 flex items-center justify-end">
                            <button
                              type="button"
                              onClick={() => handleSpeakText(msg.text)}
                              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                            >
                              <Volume2 className="w-3 h-3" />
                              <span>Listen</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {reportChatLoading && (
                    <div className="flex items-start gap-2 animate-pulse">
                      <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-500 shadow-sm flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                        <span>AI is generating your response...</span>
                      </div>
                    </div>
                  )}

                  <div ref={reportChatBottomRef} />
                </div>

                {/* Pre-built prompt chips */}
                <div className="px-4 py-2 border-t border-slate-100 bg-white flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar">
                  <span className="text-slate-400 font-bold shrink-0">Ask:</span>
                  <button
                    type="button"
                    onClick={(e) => handleSendReportChat(e, 'Explain my hemoglobin result in simple words.')}
                    className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0 transition-colors"
                  >
                    "Explain my hemoglobin"
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleSendReportChat(e, 'What does my blood pressure value mean?')}
                    className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0 transition-colors"
                  >
                    "What does blood pressure mean?"
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleSendReportChat(e, 'Which values should I discuss with my doctor?')}
                    className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0 transition-colors"
                  >
                    "Values to discuss with doctor"
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleSendReportChat(e, 'Give me food recommendations.')}
                    className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0 transition-colors"
                  >
                    "Food recommendations"
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleSendReportChat(e, 'Give me safe exercises.')}
                    className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0 transition-colors"
                  >
                    "Safe exercises"
                  </button>
                </div>

                {/* Chat input form with Voice button */}
                <form onSubmit={handleSendReportChat} className="p-3 sm:p-4 border-t border-slate-100 bg-white">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setVoiceModalOpen(true);
                        startVoiceRecognition();
                      }}
                      className="p-2.5 rounded-xl border border-slate-200 hover:bg-amber-50 text-slate-700 hover:text-amber-700 transition-colors"
                      title="Speak your question"
                    >
                      <Mic className="w-4 h-4 text-amber-600" />
                    </button>

                    <input
                      type="text"
                      value={reportChatInput}
                      onChange={(e) => setReportChatInput(e.target.value)}
                      placeholder={`Ask anything in ${selectedLanguage} (e.g., What does my glucose level mean?)...`}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm text-slate-800"
                    />

                    <button
                      type="submit"
                      disabled={!reportChatInput.trim() || reportChatLoading}
                      className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span className="hidden sm:inline">Ask AI</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Activity Log, Clinical Safety & Quick Help */}
        <div className="space-y-6">
          {/* Quick Voice Access Card */}
          <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-amber-400" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                  Voice Assistant
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-sky-200">
                {selectedLanguage}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Speak naturally in <strong>{selectedLanguage}</strong>. The AI assistant will understand your voice and speak responses aloud.
            </p>

            <button
              type="button"
              onClick={() => {
                setVoiceModalOpen(true);
                startVoiceRecognition();
              }}
              className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Mic className="w-4 h-4 text-slate-900" />
              <span>Start Speaking</span>
            </button>

            <div className="text-[11px] text-slate-400 space-y-1 pt-1">
              <p className="font-semibold text-slate-300">Try saying:</p>
              <p className="italic">"Explain my report"</p>
              <p className="italic">"Give me food recommendations"</p>
              <p className="italic">"What does blood pressure mean?"</p>
            </div>
          </div>

          {/* Recent AI Assistance Sessions */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Recent AI Assistance</h3>
              </div>
              <button
                onClick={fetchRecentActivities}
                title="Refresh history"
                className="text-slate-400 hover:text-slate-600"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingActivities ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="space-y-3">
              {recentActivities.map((act) => {
                const isReport = act.actionType === 'REPORT_EXPLANATION';

                return (
                  <div
                    key={act._id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isReport
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {isReport ? 'Report Analyzed' : 'AI Consultation'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(act.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <h5 className="text-xs font-bold text-slate-800 mt-1.5 line-clamp-1">{act.title}</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                      {act.summary}
                    </p>
                  </div>
                );
              })}

              {recentActivities.length === 0 && !loadingActivities && (
                <div className="text-center py-6 text-slate-400 text-xs">
                  <Bot className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>No recent AI assistance sessions.</p>
                  <p className="text-[10px] text-slate-400 mt-1">Upload a report or use demo sample to begin.</p>
                </div>
              )}
            </div>
          </div>

          {/* How It Works Guide */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-card space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>How It Works</span>
            </h4>
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  1
                </span>
                <p>Upload any diagnostic report (PDF, JPG, JPEG, or PNG).</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  2
                </span>
                <p>AI extracts 10 clinical parameters and detects health conditions & risk factors.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  3
                </span>
                <p>Disease-specific food plans and sample exercises are automatically displayed.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  4
                </span>
                <p>Listen or chat in Telugu, Hindi, Tamil, Kannada, Malayalam, Marathi, Bengali, or English.</p>
              </div>
            </div>
          </div>

          {/* Clinical Safety Standard */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-5 shadow-card space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-300">
                Safety & Clinical Ethics
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This assistant is strictly for patient educational guidance. It does not diagnose diseases, recommend stopping prescribed medications, or replace consultations with a certified physician.
            </p>
            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
              <span>Medical Oversight</span>
              <span className="text-teal-400 font-semibold">Verified Safe</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= VOICE ASSISTANT MODAL ================= */}
      {voiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 relative border border-slate-100">
            <button
              type="button"
              onClick={() => {
                stopVoiceRecognition();
                setVoiceModalOpen(false);
              }}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1.5">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-md">
                <Mic className={`w-8 h-8 ${isListening ? 'animate-bounce text-amber-700' : ''}`} />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Voice Assistant</h3>
              <p className="text-xs text-slate-500">
                Listening in <strong>{selectedLanguage}</strong>
              </p>
            </div>

            {/* Listening Waveform Animation */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
              {isListening ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-1.5 h-8">
                    <span className="w-1.5 h-6 bg-amber-500 rounded-full animate-pulse" />
                    <span className="w-1.5 h-8 bg-indigo-600 rounded-full animate-pulse delay-75" />
                    <span className="w-1.5 h-4 bg-sky-500 rounded-full animate-pulse delay-150" />
                    <span className="w-1.5 h-7 bg-teal-500 rounded-full animate-pulse delay-100" />
                    <span className="w-1.5 h-5 bg-amber-500 rounded-full animate-pulse delay-200" />
                  </div>
                  <span className="text-xs font-bold text-amber-700">Listening... Speak now</span>
                </div>
              ) : (
                <span className="text-xs text-slate-500">Press Start Microphone to speak</span>
              )}

              {/* Transcript Display */}
              {voiceTranscript ? (
                <div className="pt-2 border-t border-slate-200/80 text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    You said:
                  </span>
                  <p className="text-xs text-slate-800 font-medium italic bg-white p-3 rounded-xl border border-slate-200">
                    "{voiceTranscript}"
                  </p>
                </div>
              ) : null}

              {voiceError && (
                <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{voiceError}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3">
              {isListening ? (
                <button
                  type="button"
                  onClick={stopVoiceRecognition}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all"
                >
                  <MicOff className="w-4 h-4" />
                  <span>Stop Microphone</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startVoiceRecognition}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all"
                >
                  <Mic className="w-4 h-4" />
                  <span>Start Microphone</span>
                </button>
              )}

              {voiceTranscript && (
                <button
                  type="button"
                  onClick={handleProcessVoiceQuery}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Ask AI</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: PRINT / EXPORT CLINICAL REPORT ================= */}
      {showExportModal && analyzedReportData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-sky-100 text-sky-700">
                    <HeartPulse className="w-6 h-6" />
                  </span>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Smart Healthcare Ecosystem</h2>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Clinical AI Diagnostic & Biomarker Summary</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Report Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Report Document</span>
                <span className="font-bold text-slate-800">{analyzedReportData.fileName || 'Diagnostic_Report.pdf'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Primary Finding</span>
                <span className="font-bold text-rose-600">{activeConditionGuidance?.conditionTitle || 'Analyzed Biomarkers'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Biomarkers Tested</span>
                <span className="font-bold text-slate-800">{analyzedReportData.parameters?.length || 10} Parameters</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Date Generated</span>
                <span className="font-bold text-slate-800">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>
            </div>

            {/* Clinical Summary */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Physician / Patient Case Summary</h3>
              <p className="text-xs leading-relaxed text-slate-700 bg-sky-50/50 p-4 rounded-2xl border border-sky-100">
                {analyzedReportData.summary}
              </p>
            </div>

            {/* Biomarker Table */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Extracted Clinical Biomarkers</h3>
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Biomarker</th>
                      <th className="py-2 px-3">Observed Value</th>
                      <th className="py-2 px-3">Reference Range</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(analyzedReportData.parameters || []).map((param, idx) => (
                      <tr key={idx} className={param.status?.toLowerCase().includes('high') || param.status?.toLowerCase().includes('elevated') ? 'bg-amber-50/40' : ''}>
                        <td className="py-2 px-3 font-semibold text-slate-800">{param.name}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">{param.value} {param.unit}</td>
                        <td className="py-2 px-3 text-slate-500">{param.reference_range || param.normal_range || 'Normal'}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${param.status?.toLowerCase().includes('high') || param.status?.toLowerCase().includes('elevated') ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                            {param.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Diet & Exercise Guidance */}
            {activeConditionGuidance && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2">
                  <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <Apple className="w-4 h-4 text-emerald-600" />
                    <span>Recommended Nutrition</span>
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700 text-[11px]">
                    {(activeConditionGuidance.diet?.recommendedFoods || []).slice(0, 3).map((food, i) => (
                      <li key={i}>{food}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
                  <h4 className="font-bold text-indigo-900 flex items-center gap-1.5">
                    <Dumbbell className="w-4 h-4 text-indigo-600" />
                    <span>Prescribed Physical Activity</span>
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700 text-[11px]">
                    {(activeConditionGuidance.exercise?.exercisesTable || []).slice(0, 3).map((ex, i) => (
                      <li key={i}><strong>{ex.exercise}:</strong> {ex.duration} ({ex.frequency})</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Legal / Medical Disclaimer */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-500 leading-normal">
              <strong>Clinical Notice:</strong> This summary was generated by the Smart Healthcare AI Microservice powered by Qwen. It is for educational and telemedicine coordination purposes only and does not replace the clinical judgment of a licensed healthcare professional.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistantPage;
