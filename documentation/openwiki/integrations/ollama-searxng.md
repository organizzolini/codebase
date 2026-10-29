---
type: integration
title: Ollama & SearxNG Integration (Affirmancy)
description: Documents the Affirmancy-specific integration where a LangGraph StateGraph pipeline uses SearxNG for metasearch research and Ollama (gemma4:e2b) for generation, with context budget management, model keepalive, and Pydantic validation.
tags: [affirmancy, ollama, searxng, langgraph, state-graph, metasearch, context-budget, keepalive, pydantic-validation]
verified:
  - by: openwiki/0.7.0
    at: 2026-10-29T03:39:46.432Z
sources:
  - id: openwiki-source-834d9e55d27cecb197701e79
    resource: repo://projects/affirmancy/AGENTS.md
  - id: openwiki-source-aa414ec11f49c0bd0511815c
    resource: repo://projects/affirmancy/project.json
  - id: openwiki-source-e6649d4abfe6e57dbc354632
    resource: repo://projects/affirmancy/searxng.settings.yml
  - id: openwiki-source-de400b0e93cead15077457ba
    resource: repo://projects/affirmancy/src/affirmancy.ipynb
  - id: openwiki-source-52fc6fd40a69feb907bfd8d5
    resource: repo://projects/affirmancy/src/services.py
generated: { by: "openwiki/0.7.0", at: "2026-10-29T03:39:46.432Z" }
---

# Ollama & SearxNG Integration (Affirmancy)

The Affirmancy application integrates **Ollama** (local LLM inference) and **SearxNG** (self-hosted metasearch) through a **LangGraph StateGraph pipeline**. The pipeline researches spiritual subjects via SearxNG, extracts and truncates content to fit the model's 128k-token context window, then generates grammatically-diverse affirmations through Ollama, validated against Pydantic models.

## Architecture Overview

```mermaid
flowchart TD
    A[Subject Selection] --> B[SearxNG Metasearch]
    B --> C[Trafilatura Extraction]
    C --> D[Context Budget Truncation]
    D --> E[Source Analysis]
    E --> F[Document Generation]
    F --> G[Document Analysis]
    G --> H[Affirmation Generation]
    H --> I[Grammar Validation]
    I --> J[Subject Validation]
    J --> K[Output JSON/Markdown]

    B -.->|12 results, 12 explicit engines + SearxNG defaults| L[SearxNG Config]
    C -.->|include_tables=True, include_comments=False| M[Trafilatura Config]
    D -.->|MAX_CHARS_PER_SOURCE=32_000| N[Context Budget]
    E -->|llm_analytical 0.12| O[Ollama]
    F -->|llm_generative 0.24| O
    G -->|llm_analytical 0.12| O
    H -->|llm_creative 0.48| O
    I -->|llm_validator 0.06| O
    J -->|llm_validator 0.06| O

    subgraph SearxNG_Config [SearxNG Configuration]
        L1[Tier 1: wikisource, openlibrary (weight 2.0)]
        L2[Tier 2: wikipedia, startpage (weight 1.5)]
        L3[Tier 3: reddit (weight 1.2)]
        L4[Tier 4: duckduckgo 1.0, brave 0.9, bing 0.7]
        L5[Disabled: google, wikidata]
        L6[~70 high-priority hostnames]
        L7[Low-priority & remove lists]
        L8[safe_search: 0, limiter: false]
        L9[timeouts: 8s/15s, reduced ban times]
    end

    subgraph Ollama_Config [Ollama Configuration]
        O1[Model: gemma4:e2b (default)]
        O2[Context: 128k tokens]
        O3[keep_alive: 12m]
        O4[Temperatures: 0.06/0.12/0.24/0.48]
        O5[reasoning: False]
        O6[Token callback tracking]
    end
```

**Caption**: End-to-end pipeline from subject selection through SearxNG research, content extraction, context budgeting, multi-stage LLM generation/validation, and structured output.

---

## SearxNG Configuration

The SearxNG instance is configured via `searxng.settings.yml`, mounted into the container at `/etc/searxng/settings.yml:ro` and layered on top of SearxNG's built-in defaults (`use_default_settings: true`). Only keys specified here override the defaults; everything else inherits upstream values. This means the full SearxNG engine catalog (135+ engines) remains available, with the 12 explicit engines below taking deduplication priority.

### Engine Configuration — 12 Explicit Engines (4 Tiers)

Engines are organized in four tiers by weight, determining deduplication priority when multiple engines return the same URL:

| Tier | Engines | Weight | Purpose |
|------|---------|--------|---------|
| **Tier 1: Primary Sources** | `wikisource`, `openlibrary` | 2.0 | Public-domain occult/primary texts (Waite, Papus, Etteilla, Agrippa) |
| **Tier 2: Encyclopedic/High-Trust** | `wikipedia`, `startpage` | 1.5 | Authoritative prose references; Startpage proxies Google without rate limits |
| **Tier 3: Practitioner Community** | `reddit` | 1.2 | Real-world interpretive discussions from r/tarot, r/lenormand, r/astrology |
| **Tier 4: General Web** | `duckduckgo` (1.0), `brave` (0.9), `bing` (0.7) | 0.7–1.0 | Broad coverage; independent indexes prioritized over commercial |
| **Disabled** | `google`, `wikidata` | — | Google redundant with Startpage; Wikidata returns structured data, not prose |

**Source**: `repo://projects/affirmancy/searxng.settings.yml#L246-L363`

### Hostname Boosting — Curated Spiritual Sources

The `hostnames` plugin (`searx.plugins.hostnames.SXNGPlugin`) promotes trusted spiritual/occult domains and demotes noise:

- **High priority (~70 domains)**: `sacred-texts.com`, `hermetic.com`, `biddytarot.com`, `labyrinthos.co`, `astro.com`, `cafeastrology.com`, `chabad.org`, `sefaria.org`, `esotericarchives.com`, `crystalvaults.com`, `runesecrets.com`, `norse-mythology.org`, and many more across tarot, lenormand, astrology, chakras, kabbalah, runes, gemstones, numerology, alchemy, solfeggio.
- **Low priority**: Thin SEO tarot sites, Wikihow, Quora, Facebook, Coursera, dictionary sites, generic horoscope generators.
- **Remove**: Non-English content farms (zhihu.com), medical sites (clevelandclinic.org), image-only sites (Pinterest), affiliate marketplaces (Etsy, Amazon).

**Source**: `repo://projects/affirmancy/searxng.settings.yml#L62-L239`

### Rate Limiting & Resilience

| Setting | Value | Rationale |
|---------|-------|-----------|
| `limiter` | `false` | Instance only queried by LangGraph agent, not end users |
| `ban_time_on_fail` | `5` seconds | Fast engine recovery during iterative notebook runs |
| `max_ban_time_on_fail` | `30` seconds | Cap on exponential backoff (default: 120s) |
| `suspended_times` | 1h for AccessDenied/Captcha, 10m for TooManyRequests | Reduced from 24h/1h defaults for dev velocity |
| `outgoing.request_timeout` | `8.0` seconds | Higher than default 2.0s; slow engines still return useful content for LLM |
| `outgoing.max_request_timeout` | `15.0` seconds | Upper bound |

**Source**: `repo://projects/affirmancy/searxng.settings.yml#L22-L51`, `repo://projects/affirmancy/searxng.settings.yml#L240-L244`

### Safe Search & Output Formats

- `safe_search: 0` (off) — Occult/spiritual content frequently misclassified as unsafe by content filters
- `autocomplete: ""` — Disabled; queries generated by agent, not typed by humans
- `formats: [html, json]` — HTML for browser UI, JSON for LangGraph agent's SearxNG tool

---

## Ollama Configuration

### Model Variants & Nx Commands

Three Gemma4 model variants are available, pulled via the `affirmancy:ollama` Nx target with different configurations:

| Command | Model | Parameters | Use Case |
|---------|-------|------------|----------|
| `nx run affirmancy:ollama --configuration=pull-small` | `gemma4:e2b` | ~2B | Default, CPU-only, interactive generation |
| `nx run affirmancy:ollama --configuration=pull-medium` | `gemma4:e4b` | ~4B | Higher capacity when needed |
| `nx run affirmancy:ollama --configuration=pull-large` | `gemma4:e26b` | ~26B | Maximum quality, slower inference |

The `pull-small` command is used in the quickstart; `pull-medium` and `pull-large` fetch larger variants when more capacity is worth the wait.

**Source**: `repo://projects/affirmancy/project.json#L20-L27`, `repo://projects/affirmancy/README.md#L150-L152`

### Lifecycle Management Commands

| Command | Action |
|---------|--------|
| `nx run affirmancy:ollama --configuration=start` | Starts Ollama via `brew services start ollama` (local) or instructs to run `ollama serve` on host |
| `nx run affirmancy:ollama --configuration=stop` | Stops Ollama via `brew services stop ollama` (local) or `pkill ollama` on host |

The Ollama service runs natively on the host machine (not in Docker) and listens on port **11434** by default.

**Source**: `repo://projects/affirmancy/project.json#L29-L34`, `repo://projects/affirmancy/AGENTS.md#L68-L70`

### ChatOllama Instances — Four Temperature Tiers

All four `ChatOllama` instances in the notebook share the same base configuration but differ in temperature:

```python
def make_llm(temperature: float) -> ChatOllama:
    return ChatOllama(
        base_url=os.environ.get("OLLAMA_HOST", "http://localhost:11434"),
        keep_alive="12m",
        model="gemma4:e2b",
        temperature=temperature,
        reasoning=False,
        callbacks=[token_counts_callback_handler],
    )

llm_validator      = make_llm(temperature=0.06)  # Validation, deterministic
llm_analytical     = make_llm(temperature=0.12)  # Source/document analysis
llm_generative     = make_llm(temperature=0.24)  # Document generation
llm_creative       = make_llm(temperature=0.48)  # Affirmation generation
```

Shared settings:
- `model="gemma4:e2b"` — 128k token context window
- `keep_alive="12m"` — Keeps model loaded in VRAM/RAM between calls to avoid reload latency
- `reasoning=False` — Disables reasoning mode (faster, adequate for this use case)
- `base_url` from `OLLAMA_HOST` env var (default: `http://localhost:11434`)
- `callbacks=[token_counts_callback_handler]` — Tracks input/output/total tokens per call

**Source**: `repo://projects/affirmancy/src/affirmancy.ipynb#L57-L71`

---

## LangGraph StateGraph Pipeline

The pipeline is an **8-node StateGraph** (not a traditional ReAct `create_react_agent`), defined in `affirmancy.ipynb`. Each node is a pure function transforming typed state.

### State Schema

```python
class GenerateAffirmationsState(GenerateDocumentFromAnalysisState):
    document_analysis: NotRequired[str]
    grammars: list[Grammar]
    grammar_affirmations: NotRequired[list[GrammarAffirmations]]
    validation_failures: NotRequired[Annotated[list[str], operator.add]]
```

Accumulates `validation_failures` across validation nodes via `operator.add`.

**Source**: `repo://projects/affirmancy/src/affirmancy.ipynb#L382-L387`

### Node Sequence

```mermaid
flowchart LR
    START --> Search[search_sources]
    Search --> AnalyzeSources[analyze_sources]
    AnalyzeSources --> GenDoc[generate_document]
    GenDoc --> AnalyzeDoc[analyze_document]
    AnalyzeDoc --> GenAff[generate_affirmations]
    GenAff --> ValGram[validate_affirmations_grammars]
    ValGram --> ValSubj[validate_affirmations_subject]
    ValSubj --> Write[write_affirmations]
    Write --> END
```

| Node | LLM | Temperature | Purpose |
|------|-----|-------------|---------|
| `search_sources` | — | — | Queries SearxNG (12 results), extracts via Trafilatura, truncates to 32k chars/source |
| `analyze_sources` | `llm_analytical` | 0.12 | Analyzes extracted sources for key themes |
| `generate_document` | `llm_generative` | 0.24 | Generates structured document from source analysis |
| `analyze_document` | `llm_analytical` | 0.12 | Analyzes generated document for affirmation-relevant content |
| `generate_affirmations` | `llm_creative` | 0.48 | Generates affirmations per grammar (uses structured output) |
| `validate_affirmations_grammars` | `llm_validator` | 0.06 | Validates each affirmation matches its grammar spec |
| `validate_affirmations_subject` | `llm_validator` | 0.06 | Validates each affirmation is relevant to the subject |
| `write_affirmations` | — | — | Writes validated output to JSON and Markdown |

**Source**: `repo://projects/affirmancy/src/affirmancy.ipynb#L551-L569`

### Retry Policy

All LLM calls use a shared retry policy via `tenacity`:

- **Max attempts**: 6
- **Backoff**: Exponential (multiplier=1, min=1s, max=10s)
- **Logging**: Each failure logged with attempt number and delay before retry

```python
def attempts() -> Retrying:
    return Retrying(
        stop=stop_after_attempt(6),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        before_sleep=before_sleep,
        reraise=True,
    )
```

**Source**: `repo://projects/affirmancy/src/affirmancy.ipynb#L247-L261`

### Structured Output & JSON5 Parsing

The `generate_affirmations` and validation nodes use `llm.bind(format=...)` with a custom `Json5PydanticOutputParser` that:
- Strips markdown code fences (` ```json ... ``` `)
- Parses lenient JSON5 (trailing commas, comments)
- Validates against Pydantic models (`GeneratedAffirmations`, `ValidationResult`)

**Source**: `repo://projects/affirmancy/src/affirmancy.ipynb#L361-L379`

---

## Context Budget Management

The `gemma4:e2b` model has a **128k token context window** (~4 chars/token). The pipeline enforces a budget:

1. **SearxNG query**: Requests `num_results=12`
2. **Trafilatura extraction**: `include_tables=True`, `include_comments=False`, `no_fallback=False`
3. **Per-source truncation**: `MAX_CHARS_PER_SOURCE = 32_000` chars
4. **Total source budget**: 12 sources × 32,000 chars = 288,000 chars ≈ **72,000 tokens**
5. **Remaining margin**: ~56k tokens for prompts, system messages, and output

```python
# 12 sources × 24 000 chars = 288 000 chars ≈ 72 000 tokens, leaving
# a comfortable margin for prompt overhead and output.
```

**Source**: `repo://projects/affirmancy/src/affirmancy.ipynb#L98-L101`, `repo://projects/affirmancy/src/affirmancy.ipynb#L118-L151`

---

## SearxNG Health Check Utility

The `require_searxng()` utility in `services.py` performs a fast health check before the notebook runs:

- **Success**: Any HTTP response (including 4xx/5xx) proves the server is up
- **Failure**: Only connection failures (refused, DNS, timeout) trigger a `RuntimeError` with the exact `nx run infrastructure:searxng:up` command to fix it

```python
def require_searxng(host: str) -> None:
    """Raise a RuntimeError naming the fix when SearxNG is not answering at `host`."""
    # ... connection attempt ...
    except (OSError, http.client.HTTPException) as error:
        message = f"SearxNG is not reachable at {host} ({error}). Start it with: {START_COMMAND}"
        raise RuntimeError(message) from error
```

**Source**: `repo://projects/affirmancy/src/services.py#L10-L26`

---

## Docker Compose Services & Healthchecks

The infrastructure Docker Compose (`infrastructure/docker/docker-compose.yml`) runs SearxNG and Open WebUI as containers; Ollama runs on the host.

### SearxNG Service

```yaml
searxng:
  image: searxng/searxng:latest
  container_name: searxng
  ports:
    - 8889:8080
  volumes:
    - ../../projects/affirmancy/searxng.settings.yml:/etc/searxng/settings.yml:ro
  environment:
    SEARXNG_BASE_URL: http://localhost:8889
  healthcheck:
    test: [CMD, wget, -qO-, http://localhost:8080/]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 15s
  restart: unless-stopped
```

- **Port mapping**: 8889 (host) → 8080 (container)
- **Config mount**: Read-only bind mount of `searxng.settings.yml`
- **Healthcheck**: `wget` against root endpoint every 30s

**Source**: `repo://infrastructure/docker/docker-compose.yml#L50-L70`

### Open WebUI Service

```yaml
open-webui:
  image: ghcr.io/open-webui/open-webui:main
  container_name: open-webui
  ports:
    - 3001:8080
  environment:
    OLLAMA_BASE_URL: http://host.docker.internal:11434
  healthcheck:
    test: [CMD, curl, -f, http://localhost:8080/health]
    interval: 30s
    timeout: 10s
    retries: 5
    start_period: 60s
  restart: unless-stopped
```

- **Port mapping**: 3001 (host) → 8080 (container)
- **Ollama connectivity**: Uses `host.docker.internal` to reach host Ollama
- **Healthcheck**: `curl` against `/health` endpoint

**Source**: `repo://infrastructure/docker/docker-compose.yml#L3-L24`

### Service Ports Summary

| Service | Host Port | Container Port | URL |
|---------|-----------|----------------|-----|
| Ollama | 11434 | N/A (host) | `http://localhost:11434` |
| SearxNG | 8889 | 8080 | `http://localhost:8889` |
| Open WebUI | 3001 | 8080 | `http://localhost:3001` |

**Source**: `repo://projects/affirmancy/AGENTS.md#L98-L100`, `repo://projects/affirmancy/README.md#L137-L146`

---

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `OLLAMA_HOST` | `http://localhost:11434` | Ollama server URL for `ChatOllama` |
| `SEARXNG_HOST` | `http://localhost:8889` | SearxNG server URL for `SearxSearchWrapper` |

Both are read in `affirmancy.ipynb` at runtime with fallbacks.

**Source**: `repo://projects/affirmancy/src/affirmancy.ipynb#L59-L60`, `repo://projects/affirmancy/src/affirmancy.ipynb#L95-L96`

---

## Quickstart Commands

```bash
# 1. Start local services
nx run affirmancy:ollama --configuration=start
nx run infrastructure:searxng:up
nx run infrastructure:open-webui:up

# 2. Pull the model (one-time download)
nx run affirmancy:ollama --configuration=pull-small   # gemma4:e2b

# 3. Open src/affirmancy.ipynb in VSCode and run the pipeline
#    (the notebook raises an error naming `nx run infrastructure:searxng:up`
#    if SearxNG is not running)
```

**Source**: `repo://projects/affirmancy/README.md#L38-L49`, `repo://projects/affirmancy/AGENTS.md#L67-L74`

---

## Related Pages

- [Affirmancy Domain](../domain/affirmancy.md) — Application architecture, subjects, grammar system
- [External Services](../integrations/external-services.md) — Other service integrations
- [Local Development](../operations/local-development.md) — Nx, Docker, and devcontainer workflows
