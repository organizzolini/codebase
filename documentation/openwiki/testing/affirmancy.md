---
type: testing-guide
title: Affirmancy Testing
description: Documents affirmancy's pytest suites, test organization, type checking, notebook output stripping, LangGraph agent testing patterns, and Ollama/SearxNG mocking strategies.
tags: [affirmancy, testing, pytest, type-checking, notebooks, langgraph, ollama, searxng]
verified:
  - by: openwiki/0.9.0
    at: 2026-11-25T18:55:00.444Z
sources:
  - id: openwiki-source-6ba748254f38112b13d529da
    resource: repo://nx.json
  - id: openwiki-source-f361a9dd9b028b78e5690b6b
    resource: repo://projects/affirmancy/pyproject.toml
  - id: openwiki-source-de400b0e93cead15077457ba
    resource: repo://projects/affirmancy/src/affirmancy.ipynb
  - id: openwiki-source-a2f679f5203c524c717c7b87
    resource: repo://projects/affirmancy/src/grammars.py
  - id: openwiki-source-7f021c3e0bdddd11c2f6c548
    resource: repo://projects/affirmancy/src/models.py
  - id: openwiki-source-61101a9d5011320030cd00a7
    resource: repo://projects/affirmancy/testing/test_grammars.py
  - id: openwiki-source-8b1cfa86c1e1766d27607208
    resource: repo://projects/affirmancy/testing/test_models.py
  - id: openwiki-source-501fcbe5600235f6ccad2e7d
    resource: repo://projects/affirmancy/testing/test_output.py
  - id: openwiki-source-abced944398f0fb7a02f8f05
    resource: repo://projects/affirmancy/testing/test_prompts.py
  - id: openwiki-source-29bc3185c9e8810f2d6f2941
    resource: repo://projects/affirmancy/testing/test_services.py
  - id: openwiki-source-4c172bf9a04a8dafe2a723fe
    resource: repo://projects/affirmancy/testing/test_subjects.py
generated: { by: "openwiki/0.9.0", at: "2026-11-25T18:55:00.444Z" }
---

# Affirmancy Testing

This page documents the testing infrastructure, conventions, and tooling for the affirmancy project. The project uses pytest with a unit/integration split, runs two type checkers (pyright and ty), and includes Jupyter notebooks that require special handling. LangGraph agents interacting with Ollama and SearxNG are tested using mocked HTTP servers and service validation.

## Test Organization

Tests live under `projects/affirmancy/testing/` with one test file per source module:

| Test file | Source module | Purpose |
|-----------|---------------|---------|
| `test_grammars.py` | `src/grammars.py` | Grammar enum values, Grammar model construction, specifiers, slugs |
| `test_models.py` | `src/models.py` | Pydantic model construction, serialization, validation logic |
| `test_prompts.py` | `src/prompts.py` | LangChain prompt template formatting and message structure |
| `test_subjects.py` | `src/subjects.py` | Subject/SubjectCategory construction, predefined subject counts |
| `test_output.py` | `src/output.py` | JSON/Markdown file I/O, directory structure, content formatting |
| `test_services.py` | `src/services.py` | SearxNG health checks, service availability validation |

Each test file uses `@pytest.mark.unit` for fast unit tests with mocked I/O. Integration tests requiring real services use `@pytest.mark.integration`.

## Running Tests

From the project root (`projects/affirmancy`):

```bash
uv run pytest
```

This runs all tests (unit + integration). To filter:

```bash
# Unit tests only
uv run pytest -m unit

# Integration tests only
uv run pytest -m integration
```

The project exposes Nx targets for common test workflows:

- `nx run affirmancy:pytest` — all tests
- `nx run affirmancy:pytest:unit` — only unit tests
- `nx run affirmancy:pytest:integration` — only integration tests
- `nx run affirmancy:pytest:coverage` — all tests + coverage report (XML for CI)
- `nx run affirmancy:pytest:watch` — watch mode for continuous testing

The pytest target is defined in `nx.json` targetDefaults with configurations for each mode. The `unit` and `integration` configurations select tests by the markers declared in `pyproject.toml`, while `coverage` adds coverage reporting and `watch` runs `pytest-watch` for continuous testing.

## Pytest Configuration

Configuration lives in `pyproject.toml` under `[tool.pytest.ini_options]`:

- **testpaths**: `["testing"]` — discovers tests only in the `testing/` directory
- **python_files**: `["test_*.py"]` — matches files named `test_*.py`
- **python_classes**: `["Test*"]` — matches classes named `Test*`
- **python_functions**: `["test_*"]` — matches functions named `test_*`
- **markers**: `unit` (fast, mocked I/O) and `integration` (requires real services)

## Type Checking

Two type checkers run in parallel as part of the type-checking gate:

### pyright (primary)

- Strict mode enabled via `projects/affirmancy/pyproject.toml`
- Reads only its local config (no config inheritance)
- Suppresses LangChain/LangGraph false positives for missing type stubs
- Uses the shared workspace venv at the repository root

### ty (supplementary)

- Validates type annotations with additional rules
- Configured in `pyproject.toml` with Python 3.14 target
- Ignores false-positive bound violations from LangGraph TypedDict subclasses
- Root set to `./src` for source-only checking

## Linting and Security

- **ruff**: Extends workspace config, excludes notebooks and vulture whitelist; per-file ignores for notebooks (F811, TC002) and Pydantic BaseModel runtime evaluation
- **bandit**: Excludes `testing/`, `output/`, `notebooks/`; skips B101 (assert_used) which appears in test fixtures

## Jupyter Notebook Output Stripping

Jupyter notebooks in `src/` (`affirmancy.ipynb`, `prices.ipynb`, `semantics.ipynb`) have their outputs stripped on commit by `nbstripout`. This ensures diffs show code changes rather than the last run's results.

The tool is a dev dependency in `pyproject.toml` installed in the shared workspace venv. The `nbstripout` Nx target in `nx.json` runs it over every notebook in `src/` with two configurations:
- **check** (default): runs `nbstripout --verify` to verify outputs are stripped without modifying files
- **write**: runs `nbstripout` to strip outputs from all notebooks

The target is filtered to projects tagged `language:python` and uses the workspace Python environment.

## LangGraph Agent Testing

The main pipeline in `src/affirmancy.ipynb` builds LangGraph state graphs for:
1. **Search sources** — queries SearxNG, fetches and extracts content via trafilatura
2. **Generate document** — uses LLM to generate affirmations from sources
3. **Analyze sources** — LLM analyzes sources with retry logic (tenacity)
4. **Generate from analysis** — LLM generates final document from analysis

Testing strategies for these agents:

### Fixed clock and deterministic execution

Not explicitly configured in current tests; the notebook pipeline relies on Ollama's `temperature` parameter for reproducibility (lower for validation/analytical, higher for generative/creative).

### Mocked external services

- **SearxNG**: `test_services.py` uses a local HTTP server fixture (`serve`) that returns configurable status codes (200, 403, 404, 500) to test `require_searxng()` behavior. Any HTTP response (including 4xx/5xx) proves the server is up; only connection failures (refused, DNS, timeout) count as down.
- **Ollama**: Not currently mocked in unit tests; the notebooks require a running Ollama instance at `OLLAMA_HOST` (default `http://localhost:11434`) with the `gemma4:e2b` model pulled.

### Service validation

`src/services.py` provides `require_searxng(host)` which:
- Accepts any HTTP response as "service is running"
- Raises `RuntimeError` with the host and fix command (`nx run infrastructure:searxng:up`) on connection failure
- Uses a 3-second timeout for connection attempts

This allows unit tests to verify the validation logic without requiring a real SearxNG instance.

## Test Files Overview

### `test_services.py`
Tests `require_searxng()` with a parameterized HTTP server fixture:
- `test_reachable_host_returns_none` — 200 OK returns None
- `test_non_success_response_still_counts_as_running` — 403/404/500 still return None (server is up)
- `test_unreachable_host_raises_naming_host_and_fix` — connection refused raises RuntimeError with host and fix command

### `test_prompts.py`
Tests all LangChain prompt templates format correctly:
- Verifies SystemMessage + HumanMessage structure
- Checks subject name, category, and key content appear in formatted messages
- Tests: analyze document, generate affirmations, validate affirmation, search query, analyze sources

### `test_output.py`
Tests file I/O with `tmp_path` fixture:
- JSON and Markdown writers create correct directory structure
- Content formatting matches expected schema
- Predefined subject counts are accurate

### Other test files
Follow similar patterns: unit tests with mocked I/O, Pydantic model validation, enum value verification.

## Continuous Integration

The Nx `test-code` aggregate target runs `pytest` and `vitest` across the workspace. The pytest coverage configuration produces JUnit XML at `coverage/python.xml` for CI consumption.
