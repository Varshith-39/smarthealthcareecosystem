"""Centralized Async Ollama LLM Service."""
import json
import logging
from typing import Any, AsyncGenerator, Optional
import httpx
from app.config import settings

logger = logging.getLogger("ai_service.ollama")

class OllamaService:
    def __init__(self) -> None:
        self.base_url = settings.OLLAMA_BASE_URL
        self.configured_model = settings.OLLAMA_MODEL
        self._cached_active_model: Optional[str] = None

    async def get_active_model(self, client: Optional[httpx.AsyncClient] = None) -> str:
        """Dynamically resolves the active Ollama model matching configured preference."""
        if self._cached_active_model:
            return self._cached_active_model

        close_client = False
        if client is None:
            client = httpx.AsyncClient(timeout=5.0)
            close_client = True

        try:
            resp = await client.get(f"{self.base_url}/api/tags")
            if resp.status_code == 200:
                data = resp.json()
                models = [m.get("name", "") for m in data.get("models", [])]
                
                # 1. Exact match with configured model
                if self.configured_model in models:
                    self._cached_active_model = self.configured_model
                    return self.configured_model
                
                # 2. Match with prefix or containing configured model (e.g. 'qwen3:4b-instruct' contains 'qwen')
                for m in models:
                    if self.configured_model.lower() in m.lower() or "qwen" in m.lower():
                        self._cached_active_model = m
                        return m
                
                # 3. Fallback to first available model if any
                if models:
                    self._cached_active_model = models[0]
                    return models[0]
        except Exception as e:
            logger.warning("Could not reach Ollama tags endpoint: %s", e)
        finally:
            if close_client:
                await client.aclose()

        return self.configured_model

    async def check_health(self) -> dict[str, Any]:
        """Verifies Ollama availability and retrieves running model information."""
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                resp = await client.get(f"{self.base_url}/api/tags")
                if resp.status_code == 200:
                    data = resp.json()
                    models = [m.get("name", "") for m in data.get("models", [])]
                    active_model = await self.get_active_model(client)
                    return {
                        "status": "connected",
                        "base_url": self.base_url,
                        "available_models": models,
                        "active_model": active_model,
                        "is_ready": True
                    }
        except Exception as e:
            logger.error("Ollama connection check failed: %s", e)

        return {
            "status": "unavailable",
            "base_url": self.base_url,
            "available_models": [],
            "active_model": self.configured_model,
            "is_ready": False,
            "error": "AI service is currently unavailable. Please make sure Ollama is running."
        }

    async def generate(
        self,
        prompt: str,
        system: str = "",
        temperature: float = 0.3,
        timeout: float = 120.0
    ) -> dict[str, Any]:
        """Generates a text completion from local Ollama model."""
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                model = await self.get_active_model(client)
                payload = {
                    "model": model,
                    "prompt": prompt,
                    "system": system,
                    "stream": False,
                    "options": {
                        "temperature": temperature,
                        "num_predict": 512,
                    }
                }
                
                resp = await client.post(f"{self.base_url}/api/generate", json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    raw_response = data.get("response", "").strip()
                    return {
                        "success": True,
                        "response": raw_response,
                        "model": model,
                        "done": data.get("done", True)
                    }
                else:
                    return {
                        "success": False,
                        "error": f"Ollama returned HTTP {resp.status_code}: {resp.text}",
                        "model": model
                    }
        except httpx.ConnectError:
            return {
                "success": False,
                "error": "AI service is currently unavailable. Please make sure Ollama is running.",
                "model": self.configured_model
            }
        except httpx.TimeoutException:
            return {
                "success": False,
                "error": "AI request timed out. The local model is under high compute load.",
                "model": self.configured_model
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Ollama generation failed: {str(e)}",
                "model": self.configured_model
            }

    async def stream_generate(
        self,
        prompt: str,
        system: str = "",
        temperature: float = 0.3,
        timeout: float = 120.0
    ) -> AsyncGenerator[str, None]:
        """Streams text chunks from local Ollama model."""
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                model = await self.get_active_model(client)
                payload = {
                    "model": model,
                    "prompt": prompt,
                    "system": system,
                    "stream": True,
                    "options": {"temperature": temperature}
                }
                async with client.stream("POST", f"{self.base_url}/api/generate", json=payload) as response:
                    if response.status_code != 200:
                        yield json.dumps({"error": "Failed to stream response from AI model."})
                        return

                    async for line in response.aiter_lines():
                        if line:
                            try:
                                chunk = json.loads(line)
                                text_piece = chunk.get("response", "")
                                yield text_piece
                            except Exception:
                                continue
        except Exception:
            yield "AI service is currently unavailable. Please make sure Ollama is running."

ollama_service = OllamaService()
