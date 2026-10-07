# AI Microservice — Smart Healthcare Ecosystem

An independent, local-first Python FastAPI microservice providing clinical AI capabilities for the Smart Healthcare Ecosystem, powered by **Ollama** and the **Qwen** local language model.

---

## 🌟 Key Features

1. **Local Privacy-First LLM**: Runs 100% locally with Ollama and Qwen (`qwen3:4b-instruct` / `qwen`). No paid API keys, no external cloud dependence.
2. **Medical Report Explanation**: Parses diagnostic PDF/image reports (up to 10 MB), extracts 10 standard clinical biomarkers, identifies primary conditions, and generates clear summaries.
3. **Automatic Disease-Specific Guidance**: Condition-tailored expert diet plans (breakfast, lunch, dinner, snacks, hydration) and physiotherapy exercises (schedule, duration, frequency, safety precautions).
4. **Multilingual Support**: Supports 8 Indian languages (English, Telugu, Hindi, Tamil, Kannada, Malayalam, Marathi, Bengali).
5. **Voice Interaction**: Integrates browser speech recognition and Text-to-Speech (TTS) with voice commands.
6. **Simple Language Mode**: Formulates clinical findings without medical jargon.
7. **Resilient Health & Error Handling**: Graceful degradation when Ollama is unavailable without crashing the application.

---

## 🏗️ Architecture

```text
React/Vite Frontend (Port 5173)
       |
       | REST / JWT
       ↓
Node.js + Express Main Application API (Port 5000)
       |
       | AI Proxy Requests
       ↓
Python FastAPI AI Microservice (Port 8000)
       |
       ↓
Ollama Server (Port 11434)
       |
       ↓
Qwen Local Model (qwen3:4b-instruct)
```

---

## 🚀 Quick Start Instructions

### 1. Start Ollama and Download Qwen

Make sure Ollama is installed and running:

```bash
ollama serve
```

Pull the local Qwen model (if not already downloaded):

```bash
ollama pull qwen3:4b-instruct
```

Verify installed models:

```bash
ollama list
```

### 2. Configure Environment

Copy the example environment template:

```bash
cp .env.example .env
```

Ensure `.env` matches your local setup:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen3:4b-instruct
NODE_BACKEND_URL=http://localhost:5000
MAX_UPLOAD_SIZE_MB=10
PORT=8000
HOST=0.0.0.0
```

### 3. Setup Virtual Environment & Install Dependencies

```bash
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Start the FastAPI Service

```bash
uvicorn app.main:app --reload --port 8000
```

Interactive API Documentation is available at:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check verifying Ollama connection and model |
| `POST` | `/api/chat` | Context-aware healthcare assistant chat |
| `POST` | `/api/chat/stream` | Streaming chat response |
| `POST` | `/api/report/analyze` | Multipart PDF/Image report analyzer |
| `POST` | `/api/report/explain-text` | Plaintext report parameters analyzer |
| `POST` | `/api/translate` | Multilingual translation engine |
| `GET` | `/api/translate/languages`| List of 8 supported Indian languages |
| `POST` | `/api/voice/process` | Voice command parsing and TTS text synthesis |
| `POST` | `/api/health-guidance` | Disease-specific diet and exercise retriever |
