## Requirements

- Python `>=3.11`
- [uv](https://docs.astral.sh/uv/) package manager

## Setup

This application is a member of the uv workspace declared in
`configuration/pyproject.toml`, sharing
`configuration/uv.lock` and the root `.venv`. Sync from the
repository root and point uv at that workspace config.

```bash
uv sync --project configuration
```

## Run tests

```bash
cd projects/{{nameKebabCase}}
uv run pytest
```

## Lint / format / typecheck

```bash
cd projects/{{nameKebabCase}}
uv run ruff check .
uv run ruff format .
uv run pyright
uv run ty check
uv run vulture src testing
uv run bandit -r src
```

## 👔 Conformetry

This project was generated from the [jupyter-notebook-application](../../configuration/conformetry-templates/jupyter-notebook-application) conformetry template.
