---
type: testing-guide
title: Affirmancy Testing
description: Documents affirmancy's pytest suites, test organization, type checking, and notebook output stripping conventions.
tags: [affirmancy, testing, pytest, type-checking, notebooks]
sources:
  - id: openwiki-source-f361a9dd9b028b78e5690b6b
    resource: repo://projects/affirmancy/pyproject.toml
  - id: openwiki-source-65feee223eea8eae1972cca5
    resource: repo://projects/affirmancy/README.md
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
generated: { by: "openwiki/0.7.0", at: "2026-10-24T21:02:40.299Z" }
---

# Affirmancy Testing

This page documents the testing infrastructure, conventions, and tooling for the affirmancy project.

## Test Organization

Tests are organized under `testing/` with one test file per source module:

| Test file | Source module | Purpose |
|-----------|---------------|---------|
| `test_grammars.py` | `src/grammars.py` | Grammar enum values, Grammar model construction, specifiers, slugs |
| `test_models.py` | `src/models.py` | Pydantic model construction, serialization, validation logic |
| `test_prompts.py` | `src/prompts.py` | LangChain prompt template formatting and message structure |
| `test_subjects.py` | `src/subjects.py` | Subject/SubjectCategory construction, predefined subject counts |
| `test_output.py` | `src/output.py` | JSON/Markdown file I/O, directory structure, content formatting |
| `test_services.py` | `src/services.py` | SearxNG health checks, service availability validation |

Each test file uses `@pytest.mark.unit` to mark fast unit tests with mocked I/O. Integration tests requiring real services use `@pytest.mark.integration`.

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

The project also exposes Nx targets for common test workflows:

- `nx run affirmancy:pytest` — all tests
- `nx run affirmancy:pytest:unit` — only unit tests
- `nx run affirmancy:pytest:integration` — only integration tests
- `nx run affirmancy:test-coverage` — all tests + coverage report

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

- Pre-1.0 type checker with project-level config in `pyproject.toml`
- Configured for Python 3.14, root `./src`
- Ignores `invalid-argument-type` for LangGraph TypedDict subclasses

Run both via:

```bash
uv run pyright
uv run ty check
```

Or via Nx: `nx run affirmancy:typecheck` (runs both in parallel).

## Notebook Output Stripping

Jupyter notebooks in `src/` (e.g., `affirmancy.ipynb`, `prices.ipynb`, `semantics.ipynb`) have their outputs stripped on commit by `nbstripout`. This ensures diffs show code changes rather than the last run's results.

The tool is configured as a dev dependency in `pyproject.toml` and installed in the shared workspace. No manual action is needed — it runs automatically on `git commit`.

## Linting and Security

The test environment includes several static analysis tools:

- **ruff**: linting and formatting (extends shared workspace config, excludes notebooks)
- **vulture**: dead code detection (excludes `.vulture_whitelist.py`)
- **bandit**: security linting (excludes `testing/`, `output/`, `notebooks/`, skips B101)

Run all checks via:

```bash
nx run affirmancy:lint-codebase
nx run affirmancy:form-codebase
```

Or individually: `nx run affirmancy:ruff-lint`, `nx run affirmancy:vulture`, `nx run affirmancy:bandit`.
