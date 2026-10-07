import httpx
import json

def run_tests():
    client = httpx.Client(base_url="http://127.0.0.1:8000", timeout=120.0)
    print("=" * 60)
    print("RUNNING END-TO-END FASTAPI AI TESTS")
    print("=" * 60)

    # 1. Health
    res = client.get("/health")
    print("\n[TEST 1] Health:", res.status_code, res.json())
    assert res.status_code == 200
    assert res.json().get("ollama") == "connected"

    # 2. Report Analysis
    sample_report_text = (
        "CLINICAL DIAGNOSTIC REPORT\n"
        "Patient: Rahul Verma\n"
        "Hemoglobin: 11.2 g/dL\n"
        "Blood Glucose: 145 mg/dL\n"
        "Blood Pressure: 145/95 mmHg\n"
        "Heart Rate: 74 BPM\n"
        "SpO2: 98%\n"
        "Temperature: 36.8 C\n"
        "Total Cholesterol: 210 mg/dL\n"
        "WBC: 7400 /mcL\n"
        "RBC: 4.6 M/mcL\n"
        "Platelets: 240000 /mcL\n"
    )
    files = {
        "file": ("blood_report.pdf", sample_report_text.encode("utf-8"), "application/pdf")
    }
    data = {
        "language": "English",
        "simple_language": "false"
    }
    res = client.post("/api/report/analyze", files=files, data=data)
    print("\n[TEST 2] Report Analysis:", res.status_code)
    assert res.status_code == 200
    rep_data = res.json()
    print("  Summary:", rep_data.get("summary")[:180].encode("ascii", "replace").decode("ascii"), "...")
    print("  Detected Conditions:", rep_data.get("detected_conditions"))
    print("  Extracted Parameters Count:", len(rep_data.get("parameters", [])))
    print("  Diet Recommended Foods Count:", len(rep_data.get("expert_diet", {}).get("recommendedFoods", [])))
    print("  Exercise Schedule Count:", len(rep_data.get("expert_exercises", {}).get("exercisesTable", [])))
    print("  Diet Notice:", rep_data.get("expert_diet", {}).get("medicalGuidanceNotice")[:80], "...")
    print("  Exercise Notice:", rep_data.get("expert_exercises", {}).get("medicalGuidanceNotice")[:80], "...")

    # 3. Translation into Telugu
    trans_payload = {
        "text": "Your blood glucose level is higher than the normal range.",
        "source_language": "English",
        "target_language": "Telugu"
    }
    res = client.post("/api/translate", json=trans_payload)
    print("\n[TEST 3] Telugu Translation:", res.status_code)
    assert res.status_code == 200
    trans_data = res.json()
    telugu_text = trans_data.get("translated_text", "")
    print("  Telugu text length:", len(telugu_text))
    print("  Telugu Unicode codepoints:", [f"U+{ord(c):04X}" for c in telugu_text[:10]])

    # 4. Voice Process
    voice_payload = {
        "transcript": "Give me food recommendations for my blood sugar",
        "language": "English",
        "simple_language": True
    }
    res = client.post("/api/voice/process", json=voice_payload)
    print("\n[TEST 4] Voice Process:", res.status_code)
    assert res.status_code == 200
    voice_data = res.json()
    print("  Action:", voice_data.get("action"))
    print("  Speech Text:", voice_data.get("speech_text")[:150].encode("ascii", "replace").decode("ascii"), "...")

    print("\nALL FASTAPI ENDPOINTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
