"""Multilingual Translation Service using Local Qwen LLM with offline fallback."""
import logging
from typing import Any, Optional
from app.services.ollama_service import ollama_service

logger = logging.getLogger("ai_service.translation")

# Supported Indian and International languages
SUPPORTED_LANGUAGES: dict[str, dict[str, str]] = {
    "English": {"code": "en", "native": "English", "locale": "en-US"},
    "Telugu": {"code": "te", "native": "తెలుగు", "locale": "te-IN"},
    "Hindi": {"code": "hi", "native": "हिन्दी", "locale": "hi-IN"},
    "Tamil": {"code": "ta", "native": "தமிழ்", "locale": "ta-IN"},
    "Kannada": {"code": "kn", "native": "ಕನ್ನಡ", "locale": "kn-IN"},
    "Malayalam": {"code": "ml", "native": "മലയാളം", "locale": "ml-IN"},
    "Marathi": {"code": "mr", "native": "मराठी", "locale": "mr-IN"},
    "Bengali": {"code": "bn", "native": "বাংলা", "locale": "bn-IN"},
    "Gujarati": {"code": "gu", "native": "ગુજરાતી", "locale": "gu-IN"},
    "Punjabi": {"code": "pa", "native": "ਪੰਜਾਬੀ", "locale": "pa-IN"},
    "Odia": {"code": "or", "native": "ଓଡ଼ିଆ", "locale": "or-IN"},
    "Urdu": {"code": "ur", "native": "اردو", "locale": "ur-IN"},
}

# Offline phrase fallbacks if Ollama is unavailable
OFFLINE_DISCLAIMERS: dict[str, dict[str, str]] = {
    "Telugu": {
        "disclaimer_report": "ఈ AI వివరణ విద్యా ప్రయోజనాల కోసం మాత్రమే మరియు ఇది వైద్య నిర్ధారణ కాదు. వైద్య సలహా కోసం అర్హత కలిగిన వైద్యుడిని సంప్రదించండి.",
        "disclaimer_safety": "వైద్య సమాచారం ఆధారంగా అందించిన విద్యా మార్గదర్శకత్వం. ఆహారం లేదా వ్యాయామంలో మార్పులు చేసే ముందు ఎల్లప్పుడూ మీ వైద్యుడిని సంప్రదించండి.",
        "diet_notice": "నిపుణుల వైద్య మార్గదర్శకత్వం: ఈ ఆహార సిఫార్సులు సీనియర్ వైద్యులు మరియు డైటీషియన్ల సాధారణ మార్గదర్శకాల ఆధారంగా ఉన్నాయి.",
        "exercise_notice": "నిపుణుల వైద్య మార్గదర్శకత్వం: ఈ నమూనా వ్యాయామాలు సీనియర్ వైద్యులు మరియు ఫిజియోథెరపిస్టుల మార్గదర్శకాల ఆధారంగా ఉన్నాయి.",
        "emergency": "తీవ్రమైన ఛాతీ నొప్పి లేదా శ్వాస తీసుకోవడంలో ఇబ్బంది ఉంటే వెంటనే అత్యవసర వైద్య సంరక్షణను పొందండి."
    },
    "Hindi": {
        "disclaimer_report": "यह AI स्पष्टीकरण केवल शैक्षिक उद्देश्यों के लिए है और यह चिकित्सीय निदान नहीं है। चिकित्सीय सलाह के लिए योग्य डॉक्टर से परामर्श लें।",
        "disclaimer_safety": "चिकित्सीय जानकारी पर आधारित शैक्षिक मार्गदर्शन। आहार या व्यायाम में बदलाव करने से पहले हमेशा अपने डॉक्टर से परामर्श लें।",
        "diet_notice": "विशेषज्ञ चिकित्सीय मार्गदर्शन: ये खाद्य सिफारिशें वरिष्ठ डॉक्टरों और आहार विशेषज्ञों के सामान्य मार्गदर्शन पर आधारित हैं।",
        "exercise_notice": "विशेषज्ञ चिकित्सीय मार्गदर्शन: ये व्यायाम वरिष्ठ डॉक्टरों और फिजियोथेरेपिस्ट के सामान्य मार्गदर्शन पर आधारित हैं।",
        "emergency": "यदि आपको सीने में तेज दर्द या सांस लेने में कठिनाई हो रही है, तो तुरंत आपातकालीन चिकित्सा सहायता लें।"
    },
    "Tamil": {
        "disclaimer_report": "இந்த AI விளக்கம் கல்வி நோக்கங்களுக்காக மட்டுமே, மருத்துவ பரிசோதனை அல்ல. தகுதியான மருத்துவரை அணுகவும்.",
        "disclaimer_safety": "மருத்துவ தகவல்களை அடிப்படையாகக் கொண்ட கல்வி வழிகாட்டுதல். உணவு அல்லது உடற்பயிற்சியை மாற்றுவதற்கு முன் உங்கள் மருத்துவரை அணுகவும்.",
        "diet_notice": "நிபுணர் மருத்துவ வழிகாட்டுதல்: இந்த உணவு பரிந்துரைகள் மூத்த மருத்துவர்கள் மற்றும் ஊட்டச்சத்து நிபுணர்களின் வழிகாட்டுதலை அடிப்படையாகக் கொண்டவை.",
        "exercise_notice": "நிபுணர் மருத்துவ வழிகாட்டுதல்: இந்த உடற்பயிற்சி பரிந்துரைகள் மருத்துவர்கள் மற்றும் பிசியோதெரபிஸ்ட்டுகளின் வழிகாட்டுதலை அடிப்படையாகக் கொண்டவை.",
        "emergency": "கடுமையான மார்பு வலி அல்லது மூச்சுத் திணறல் ஏற்பட்டால், உடனடியாக அவசர மருத்துவ உதவியை நாடவும்."
    },
    "Kannada": {
        "disclaimer_report": "ಈ AI ವಿವರಣೆಯು ಶೈಕ್ಷಣಿಕ ಉದ್ದೇಶಗಳಿಗಾಗಿ ಮಾತ್ರ ಮತ್ತು ಇದು ವೈದ್ಯಕೀಯ ರೋಗನಿರ್ಣಯವಲ್ಲ. ಅರ್ಹ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
        "disclaimer_safety": "ವೈದ್ಯಕೀಯ ಮಾಹಿತಿಯ ಆಧಾರದ ಮೇಲೆ ಶೈಕ್ಷಣಿಕ ಮಾರ್ಗದರ್ಶನ. ಆಹಾರ ಅಥವಾ ವ್ಯಾಯಾಮವನ್ನು ಬದಲಾಯಿಸುವ ಮೊದಲು ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
        "diet_notice": "ತಜ್ಞರ ವೈದ್ಯಕೀಯ ಮಾರ್ಗದರ್ಶನ: ಈ ಆಹಾರ ಶಿಫಾರಸುಗಳು ಹಿರಿಯ ವೈದ್ಯರು ಮತ್ತು ಆಹಾರ ತಜ್ಞರ ಸಾಮಾನ್ಯ ಮಾರ್ಗದರ್ಶನವನ್ನು ಆಧರಿಸಿವೆ.",
        "exercise_notice": "ತಜ್ಞರ ವೈದ್ಯಕೀಯ ಮಾರ್ಗದರ್ಶನ: ಈ ವ್ಯಾಯಾಮ ಶಿಫಾರಸುಗಳು ಹಿರಿಯ ವೈದ್ಯರು ಮತ್ತು ಫಿಸಿಯೋಥೆರಪಿಸ್ಟ್‌ಗಳ ಮಾರ್ಗದರ್ಶನವನ್ನು ಆಧರಿಸಿವೆ.",
        "emergency": "ತೀವ್ರ ಎದೆ ನೋವು ಅಥವಾ ಉಸಿರಾಟದ ತೊಂದರೆ ಇದ್ದರೆ ತಕ್ಷಣ ತುರ್ತು ವೈದ್ಯಕೀಯ ಆರೈಕೆಯನ್ನು ಪಡೆಯಿರಿ."
    },
    "Malayalam": {
        "disclaimer_report": "ഈ AI വിവരണം വിദ്യാഭ്യാസ ആവശ്യങ്ങൾക്ക് മാത്രമുള്ളതാണ്, ഇത് ഒരു മെഡിക്കൽ രോഗനിർണയമല്ല. ഡോക്ടറെ സമീപിക്കുക.",
        "disclaimer_safety": "മെഡിക്കൽ വിവരങ്ങളെ അടിസ്ഥാനമാക്കിയുള്ള വിദ്യാഭ്യാസ മാർഗ്ഗനിർദ്ദേശം. ഭക്ഷണക്രമത്തിലോ വ്യായാമത്തിലോ മാറ്റം വരുത്തുന്നതിന് മുമ്പ് ഡോക്ടറോട് സംസാരിക്കുക.",
        "diet_notice": "വിദഗ്ദ്ധ മെഡിക്കൽ മാർഗ്ഗനിർദ്ദേശം: മുതിർന്ന ഡോക്ടർമാരുടെയും ഡയറ്റീഷ്യൻമാരുടെയും പൊതുവായ മാർഗ്ഗനിർദ്ദേശങ്ങളെ അടിസ്ഥാനമാക്കിയുള്ളതാണ് ഈ ഭക്ഷണ നിർദ്ദേശങ്ങൾ.",
        "exercise_notice": "വിദഗ്ദ്ധ മെഡിക്കൽ മാർഗ്ഗനിർദ്ദേശം: മുതിർന്ന ഡോക്ടർമാരുടെയും ഫിസിയോതെറാപ്പിസ്റ്റുകളുടെയും മാർഗ്ഗനിർദ്ദേശത്തെ അടിസ്ഥാനമാക്കിയുള്ളതാണ് ഈ വ്യായാമങ്ങൾ.",
        "emergency": "കഠിനമായ നെഞ്ചുവേദനയോ ശ്വാസതടസ്സമോ ഉണ്ടായാൽ ഉടൻ അടിയന്തര വൈദ്യസഹായം തേടുക."
    },
    "Marathi": {
        "disclaimer_report": "हे AI स्पष्टीकरण केवळ शैक्षणिक हेतूंसाठी आहे आणि हे वैद्यकीय निदान नाही. कृपया डॉक्टरांचा सल्ला घ्या.",
        "disclaimer_safety": "वैद्यकीय माहितीवर आधारित शैक्षणिक मार्गदर्शन. आहार किंवा व्यायामामध्ये बदल करण्यापूर्वी नेहमी आपल्या डॉक्टरांचा सल्ला घ्या.",
        "diet_notice": "तज्ज्ञ वैद्यकीय मार्गदर्शन: या आहारातील शिफारसी वरिष्ठ डॉक्टर आणि आहारतज्ज्ञांच्या सामान्य मार्गदर्शनावर आधारित आहेत.",
        "exercise_notice": "तज्ज्ञ वैद्यकीय मार्गदर्शन: हे व्यायाम वरिष्ठ डॉक्टर आणि फिजिओथेरपिस्टच्या सामान्य मार्गदर्शनावर आधारित आहेत.",
        "emergency": "छातीत तीव्र दुखत असल्यास किंवा श्वास घेण्यास त्रास होत असल्यास त्वरित आणीबाणी वैद्यकीय मदत घ्या."
    },
    "Bengali": {
        "disclaimer_report": "এই AI ব্যাখ্যাটি শুধুমাত্র শিক্ষামূলক উদ্দেশ্যে এবং এটি কোনো চিকিৎসা নির্ণয় নয়। ডাক্তারের পরামর্শ নিন।",
        "disclaimer_safety": "চিকিৎসা তথ্যের উপর ভিত্তি করে শিক্ষামূলক নির্দেশিকা। ডায়েট বা ব্যায়ামে পরিবর্তনের আগে ডাক্তারের সাথে পরামর্শ করুন।",
        "diet_notice": "বিশেষজ্ঞ চিকিৎসা নির্দেশিকা: এই খাবারের সুপারিশগুলি সিনিয়র ডাক্তার এবং ডায়েটিশিয়ানদের সাধারণ নির্দেশনার উপর ভিত্তি করে।",
        "exercise_notice": "বিশেষজ্ঞ চিকিৎসা নির্দেশিকা: এই ব্যায়ামগুলি সিনিয়র ডাক্তার এবং ফিজিওথেরাপিস্টদের নির্দেশনার উপর ভিত্তি করে।",
        "emergency": "বুকে তীব্র ব্যথা বা শ্বাসকষ্ট হলে অবিলম্বে জরুরি চিকিৎসার সাহায্য নিন।"
    }
}

class TranslationService:
    def get_supported_languages(self) -> dict[str, dict[str, str]]:
        """Returns the dictionary of supported languages and metadata."""
        return SUPPORTED_LANGUAGES

    async def translate_text(
        self,
        text: str,
        source_language: str = "English",
        target_language: str = "English"
    ) -> dict[str, Any]:
        """Translates text to target language using Qwen or offline dictionary."""
        cleaned_text = (text or "").strip()
        if not cleaned_text:
            return {
                "translated_text": "",
                "source_language": source_language,
                "target_language": target_language,
                "model_used": "none"
            }

        # If target matches source or English with no change needed
        if target_language.lower() == source_language.lower() or (
            target_language.lower() == "english" and source_language.lower() == "english"
        ):
            return {
                "translated_text": cleaned_text,
                "source_language": source_language,
                "target_language": target_language,
                "model_used": "direct"
            }

        # Check offline notice match
        if target_language in OFFLINE_DISCLAIMERS:
            for key, translated_val in OFFLINE_DISCLAIMERS[target_language].items():
                if len(cleaned_text) < 250 and ("educational purposes" in cleaned_text.lower() and key == "disclaimer_report"):
                    return {
                        "translated_text": translated_val,
                        "source_language": source_language,
                        "target_language": target_language,
                        "model_used": "dictionary_verified"
                    }

        # Use Qwen local model for medical-grade translation
        prompt = (
            f"You are a professional medical translator. Translate the following healthcare text from "
            f"{source_language} into natural, accurate, patient-friendly {target_language}.\n\n"
            f"CRITICAL RULES:\n"
            f"1. Accurately convey all clinical insights, food items, and exercise instructions.\n"
            f"2. Keep important medical lab terms and units (e.g., mg/dL, Blood Pressure, Hemoglobin, Glucose) "
            f"clearly recognizable, with English in parentheses if useful.\n"
            f"3. Return ONLY the translated text without extra conversational commentary or preamble.\n\n"
            f"TEXT TO TRANSLATE:\n{cleaned_text}"
        )

        gen_result = await ollama_service.generate(
            prompt=prompt,
            system=f"You are a specialized medical translation engine into {target_language}.",
            temperature=0.2,
            timeout=60.0
        )

        if gen_result.get("success") and gen_result.get("response"):
            translated = gen_result["response"].strip()
            # Remove any wrapping quotes if model added them
            if (translated.startswith('"') and translated.endswith('"')) or (
                translated.startswith("'") and translated.endswith("'")
            ):
                translated = translated[1:-1].strip()
                
            return {
                "translated_text": translated,
                "source_language": source_language,
                "target_language": target_language,
                "model_used": gen_result.get("model", "qwen")
            }

        # Fallback if Ollama unavailable: return original with notice
        logger.warning("Ollama translation fallback triggered for language: %s", target_language)
        return {
            "translated_text": cleaned_text,
            "source_language": source_language,
            "target_language": target_language,
            "model_used": "fallback_original"
        }

    async def translate_diet_guidance(self, diet_data: dict[str, Any], target_language: str) -> dict[str, Any]:
        """Translates diet guidance fields into target language."""
        if target_language.lower() == "english":
            return diet_data

        translated_diet = dict(diet_data)
        
        # Translate notice
        notice_res = await self.translate_text(diet_data.get("medicalGuidanceNotice", ""), "English", target_language)
        translated_diet["medicalGuidanceNotice"] = notice_res["translated_text"]

        # Translate hydration
        hydration_res = await self.translate_text(diet_data.get("hydrationGuidance", ""), "English", target_language)
        translated_diet["hydrationGuidance"] = hydration_res["translated_text"]

        return translated_diet

    async def translate_exercise_guidance(self, exercise_data: dict[str, Any], target_language: str) -> dict[str, Any]:
        """Translates exercise guidance fields into target language."""
        if target_language.lower() == "english":
            return exercise_data

        translated_exercise = dict(exercise_data)
        
        notice_res = await self.translate_text(exercise_data.get("medicalGuidanceNotice", ""), "English", target_language)
        translated_exercise["medicalGuidanceNotice"] = notice_res["translated_text"]

        if exercise_data.get("whenToStop"):
            stop_res = await self.translate_text(exercise_data["whenToStop"], "English", target_language)
            translated_exercise["whenToStop"] = stop_res["translated_text"]

        if exercise_data.get("whenToConsultDoctor"):
            doc_res = await self.translate_text(exercise_data["whenToConsultDoctor"], "English", target_language)
            translated_exercise["whenToConsultDoctor"] = doc_res["translated_text"]

        return translated_exercise

translation_service = TranslationService()
