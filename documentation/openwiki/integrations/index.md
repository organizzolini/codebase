# Files

- [External Service Integrations](external-services.md) - Overview of all external service integrations: Ollama (local LLM for Affirmancy), SearxNG (metasearch for Affirmancy), Swiss Ephemeris (astronomical data for Caelundas), PostgreSQL (shared container for Lexico and Meanderaw), and Open WebUI (chat interface for Ollama).
- [Ollama & SearxNG Integration (Affirmancy)](ollama-searxng.md) - Documents the Affirmancy-specific integration where a LangGraph StateGraph pipeline uses SearxNG for metasearch research and Ollama (gemma4:e2b) for generation, with context budget management, model keepalive, and Pydantic validation.
- [Swiss Ephemeris Integration (Caelundas)](swiss-ephemeris.md) - Documents how caelundas uses the Swiss Ephemeris library with JPL DE431 data files for local astronomical computations, including download mechanism, fallback behavior, supported date range, and error handling.
