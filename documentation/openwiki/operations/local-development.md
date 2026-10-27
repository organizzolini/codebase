---
type: operations-guide
title: Local Development Setup
description: Complete local development environment including dev container, Docker Compose services, Nx targets, environment files, dependency installation, and project-specific quickstarts.
tags: [devcontainer, docker-compose, nx, environment, quickstart]
sources:
  - id: openwiki-source-9bdedb6b4cae230293bf415c
    resource: repo://.devcontainer/README.md
  - id: openwiki-source-2fe644645addbb5d683744e9
    resource: repo://.env.default
  - id: openwiki-source-7a238773a33bfa517e4a1925
    resource: repo://configuration/pyproject.toml
  - id: openwiki-source-5af1e140a8c8b0f50fd8ad35
    resource: repo://infrastructure/docker/docker-compose.yml
  - id: openwiki-source-20adfbd947778ab4f8c79dfb
    resource: repo://infrastructure/project.json
  - id: openwiki-source-e84c9845fa1929e0b3fde349
    resource: repo://infrastructure/README.md
  - id: openwiki-source-5b54a58d1b51cd490b0e7162
    resource: repo://package.json
  - id: openwiki-source-40275cb92c3610938f16ade3
    resource: repo://pnpm-workspace.yaml
  - id: openwiki-source-65feee223eea8eae1972cca5
    resource: repo://projects/affirmancy/README.md
  - id: openwiki-source-ff39bf7091d4164b7610dff3
    resource: repo://projects/caelundas/caelundas-cli/.env.default
  - id: openwiki-source-365913b525ddd217ee2335b6
    resource: repo://projects/caelundas/caelundas-cli/README.md
  - id: openwiki-source-e5dd7c210542971c10f4aeba
    resource: repo://projects/lexico/lexico-cli/.env.default
  - id: openwiki-source-5e40db637ff9cea3eb6ab5fe
    resource: repo://projects/lexico/lexico-cli/README.md
  - id: openwiki-source-a106a461b02c44c1c748438d
    resource: repo://projects/meanderaw/meanderaw-cli/.env.default
  - id: openwiki-source-a6e80b612169ffb94413f377
    resource: repo://projects/meanderaw/meanderaw-cli/README.md
generated: { by: "openwiki/0.7.0", at: "2026-10-24T21:02:40.299Z" }
---

# Local Development Setup

This guide documents the complete local development environment for the codebase: the dev container that provides a reproducible toolchain, the Docker Compose services for local infrastructure, Nx targets for service management, environment file conventions, dependency installation, and project-specific quickstarts for each domain.

## Dev Container

The codebase uses a **single dev container** (rather than per-project containers) that provides all required tools pre-installed. This avoids "works on my machine" issues and supports Nx development spanning multiple projects with shared tooling.

### Configurations

Two named configurations are provided. Select the appropriate one when opening in a container.

| Configuration | File | Docker Mode | Use When |
|---------------|------|-------------|----------|
| `Codebase Devcontainer (Cloud)` | `cloud/devcontainer.json` | Docker-in-Docker (DinD) | GitHub Codespaces, CI, or when isolation is required |
| `Codebase Devcontainer (Local)` | `local/devcontainer.json` | Docker-outside-of-Docker (DooD) | Local machine with Docker Desktop running |

**DooD advantages on a local machine:**
- Shared image/layer cache with the host — no re-pulling Ollama images
- No second Docker daemon — saves ~200–500 MB RAM and eliminates DinD startup delay
- Host OS manages container memory directly — no `--memory` cap needed in `runArgs`

**DinD advantages:**
- Completely isolated Docker environment — no interference with host containers
- Works in environments without a host socket (Codespaces, CI runners)

### Provided Tools

The container uses [Dev Container Features](https://containers.dev/features) for modular tool installation:

| Feature | Version | Purpose | Config |
|---------|---------|---------|--------|
| `typescript-node:22` | Base | Node.js 22 with TypeScript support | Both |
| `docker-in-docker` | 2 | Isolated Docker daemon inside container (DinD) | Cloud only |
| `docker-outside-of-docker` | 1 | Mounts host Docker socket (DooD) | Local only |
| `github-cli` | 1 | `gh` command for GitHub operations | Both |
| `kubectl-helm-minikube` | 1 | kubectl and Helm (minikube disabled) | Both |
| `terraform` | 1 | Terraform CLI + tflint for infrastructure | Both |

**Custom installations:**
- **SQLite**: Installed via `apt-get` in `postCreateCommand` for database querying and management (caelundas ephemeris caching)

### Lifecycle Scripts

| Hook | Tasks |
|------|-------|
| `postCreateCommand` | Enable pnpm via Corepack, install dependencies, sync VS Code Machine settings |
| `postAttachCommand` | Verify tool versions (node, pnpm, gh, helm) |

### Port Forwarding

Ports are automatically forwarded to your host machine:

| Port | Service | Auto-Forward | Notes |
|------|---------|--------------|-------|
| 3000 | Lexico Dev Server | Notify | TanStack Start dev server |

### Quick Start

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) and [VS Code Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
2. Open the codebase folder in VS Code
3. Open the command palette (`Ctrl/Cmd+Shift+P`) → **Dev Containers: Reopen in Container**
4. When prompted, choose:
   - **Codebase Devcontainer (Local)** — for local development (Docker outside of Docker)
   - **Codebase Devcontainer (Cloud)** — for GitHub Codespaces or isolated Docker (Docker in Docker)
5. Wait for container build (~2-3 minutes first time, cached after)
6. Terminal opens with all tools ready

> **Tip:** On a local machine, the `Local` configuration is strongly recommended. It shares your host's Docker daemon (faster builds, shared image cache, no memory overhead from a second Docker daemon). Codespaces must use the `Cloud` configuration since no host Docker socket is available.

### Post-Build Verification

After building the container, verify the setup:

```bash
# 1. Check tool versions
node --version          # Should output v22.20.0
pnpm --version          # Should output 10.20.0
gh --version            # Should output gh version X.Y.Z
helm version --short    # Should output vX.Y.Z
kubectl version --client # Should output client version

# 2. Verify Docker access
docker run hello-world  # Should complete successfully

# 3. Install dependencies (if not done by postCreateCommand)
pnpm install            # Should complete with no errors

# 4. Start dev server
nx run lexico-web:start   # Should be accessible at localhost:3000
```

## Docker Compose Services

The `infrastructure/docker/docker-compose.yml` file defines three services for local development. All services are managed through Nx targets (see [Nx Targets](#nx-targets-for-infrastructure-services)).

### Services

#### PostgreSQL

The shared PostgreSQL 18 Alpine container runs on port 5432. It uses the workspace-root `.env` (from `env_file`) for the admin login (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`).

**Project databases:** The Compose `postgres` service creates every database-backed project's `<project>_username` role, `<project>_development` database, and `<project>` schema from its `POSTGRES_PROJECTS` list, but **only when the volume is empty**.

Current `POSTGRES_PROJECTS` list: `caelundas lexico meanderaw`

For each project in the list, the init script creates:
- A `<project>_username` role with password `<project>_password`
- A `<project>_development` database owned by that role
- Inside that database, a `<project>` schema owned by that role

**Adding a project to an existing volume:**
```bash
nx run infrastructure:postgres:up
docker exec -e POSTGRES_PROJECTS=<project> postgres sh /docker-entrypoint-initdb.d/databases.sh
```
The script stops at the first object that already exists, so name only the projects the volume lacks. Never use `infrastructure:postgres:recreate` for this — it deletes the volume and every row in it. See [ADR 0022](../../documentation/adr/0022-give-every-database-project-its-own-database-schema-and-role.md) for meanderaw's one exception.

#### SearxNG

SearxNG metasearch service running on port 8889. Uses the Affirmancy project's settings file mounted read-only at `/etc/searxng/settings.yml`.

#### Open WebUI

Open WebUI service running on port 3001, connecting to Ollama via `host.docker.internal:11434`.

## Nx Targets for Infrastructure Services

The `infrastructure` project defines Nx targets for managing local services:

| Target | Configurations | Description |
|--------|----------------|-------------|
| `postgres` | `up`, `down`, `recreate` | Start, stop, or recreate the local PostgreSQL container (recreate removes the volume) |
| `searxng` | `up`, `down`, `open` | Manage the SearxNG Docker service (up, down, open in browser) |
| `open-webui` | `up`, `down`, `open` | Manage the Open WebUI Docker service (up, down, open in browser) |
| `terraform` | `plan` (default), `import` | Terraform operations against the Linode LKE cluster |
| `trivy-config` | - | Trivy misconfiguration scan of the Terraform code |
| `helm-lint` | - | Lint the `kubernetes-job` chart against its base values |
| `compose-config` | - | Validate the Docker Compose file |

### Usage Examples

```bash
# Start all services
nx run infrastructure:postgres:up
nx run infrastructure:searxng:up
nx run infrastructure:open-webui:up

# Stop a specific service
nx run infrastructure:searxng:down

# Recreate PostgreSQL (WARNING: destroys volume and all data)
nx run infrastructure:postgres:recreate

# Open service in browser
nx run infrastructure:searxng:open    # http://localhost:8889
nx run infrastructure:open-webui:open # http://localhost:3001
```

### CI Integration

`helm-lint` and `compose-config` also run in CI: `lint-code` depends on both, so the Lint leg of continuous-integration.yml runs them. They need `helm` and `docker compose`; `compose-config` creates a missing root `.env` from `.env.default` and never overwrites an existing one.

## Environment Files

The codebase uses a two-tier environment file convention:

### Root `.env` (Workspace Root)

Copied from `.env.default` on first setup. This file is **gitignored** and provides:
- Shared service URLs (Ollama, SearxNG)
- PostgreSQL admin credentials (container healthcheck and init script only — no application reads these)
- GitHub tokens
- OpenWiki configuration
- Terraform variables

```bash
# First-time setup
cp .env.default .env
```

### Project-Specific `.env` Files

Each project has its own `.env.default` that must be copied to `.env` (gitignored) in the project directory:

```bash
# Caelundas
cp projects/caelundas/caelundas-cli/.env.default projects/caelundas/caelundas-cli/.env

# Lexico
cp projects/lexico/lexico-cli/.env.default projects/lexico/lexico-cli/.env

# Meanderaw
cp projects/meanderaw/meanderaw-cli/.env.default projects/meanderaw/meanderaw-cli/.env
```

Project `.env` files contain project-prefixed database variables (e.g., `CAELUNDAS_POSTGRES_*`, `LEXICO_POSTGRES_*`, `MEANDERAW_POSTGRES_*`) that default to the local container's per-project role, database, and schema. The `MEANDERAW_` prefix keeps them apart from the unprefixed `POSTGRES_*` variables the workspace root's `.env` sets as the container's admin login, which Nx also loads into every task and which meanderaw never reads.

## Dependency Installation

### Node.js / TypeScript (pnpm)

Install all workspace dependencies from the repository root:

```bash
pnpm install
```

This installs dependencies for all projects in the pnpm workspace (defined in `pnpm-workspace.yaml`), including the root `package.json`, `configuration/`, `infrastructure/`, and all projects under `projects/*`.

### Python (uv)

Python projects are managed as a uv workspace declared in `configuration/pyproject.toml`, sharing `configuration/uv.lock` and the root `.venv`. Sync from the repository root and point uv at that workspace config:

```bash
uv sync --project configuration
```

This installs all Python project members (currently `projects/affirmancy`) and dev tools (ruff, pyright, pytest, sqlfluff, etc.) into the shared `.venv`.

## Project-Specific Quickstarts

Each domain project has its own quickstart sequence. All require the local PostgreSQL container running (`nx run infrastructure:postgres:up`).

### Affirmancy

Spiritual affirmation generation using LangChain, LangGraph, and Ollama.

**Requirements:** Python ≥3.11, uv, Docker (for Ollama and SearxNG). Devcontainer provides Python 3.14.

**Quickstart:**
```bash
# 1. Start the local services
nx run affirmancy:ollama --configuration=start
nx run infrastructure:searxng:up
nx run infrastructure:open-webui:up

# 2. Pull the model (one-time download)
nx run affirmancy:ollama --configuration=pull-small   # gemma4:e2b

# 3. Open src/affirmancy.ipynb in VSCode and run the pipeline
#    (the notebooks raise an error naming `nx run infrastructure:searxng:up`
#    if SearxNG is not running)
```

**Run tests:**
```bash
cd projects/affirmancy
uv run pytest
```

### Caelundas

Astronomical calendar generation using Swiss Ephemeris, storing events in PostgreSQL and rendering iCalendar (`.ics`) files.

**Quick Start:**
```bash
# 1. Download the Swiss Ephemeris data files (one-time, about 2 MB)
nx run caelundas-cli:download-ephemeris

# 2. Configure your observer location and date range
cp projects/caelundas/caelundas-cli/.env.default projects/caelundas/caelundas-cli/.env

# 3. Create the calendar_events table (needs the local Postgres container running)
nx run caelundas-cli:migration:run

# 4. Generate the calendar
nx run caelundas-cli:start
```

The result lands in `output/caelundas_<start>_<end>.ics`, with a `.json` file beside it.

### Lexico Ingestion

NestJS CLI application that scrapes, parses, and loads dictionary sources into PostgreSQL.

**Quick Start:**
```bash
cp projects/lexico/lexico-cli/.env.default projects/lexico/lexico-cli/.env      # Database connection
nx run lexico-cli:start
```

The default command is the root pipeline, which prompts for any stage flags it was not given and then runs the selected stages in order.

```bash
# Run specific stages
nx run lexico-cli:start -- --dictionary --literature
```

**Individual stages** (each addressable as a `start` configuration):
```bash
nx run lexico-cli:start:dictionary -- --startLemma=a --endLemma=c
nx run lexico-cli:start:wiktionary
nx run lexico-cli:start:clear
```

**Run tests:**
```bash
nx run lexico-cli:vitest
```

### Meanderaw

Procedural meander pattern generation, storing results in PostgreSQL and rendering HTML pages.

**Quick Start:**
```bash
nx run infrastructure:postgres:up
nx run meanderaw-cli:migration:run
nx run meanderaw-cli:start
```

Meanderaw follows the workspace's shared Postgres convention: the `meanderaw_development` database holds a `meanderaw` schema, both owned by the `meanderaw_username` role. The local Postgres container creates all three the first time its volume starts empty.

**Migrations:**
```bash
nx run meanderaw-cli:migration:run        # Build or update the meanders table
nx run meanderaw-cli:migration:generate   # After editing the Meander entity, write the next migration
```

**Single drawing mode:**
```bash
nx run meanderaw-cli:start --args="--rows <n> --columns <n> --code <code>"
```

**Run tests:**
```bash
nx run meanderaw-cli:vitest
```

## Troubleshooting

### Container fails to build
1. Ensure Docker Desktop is running
2. Try `Dev Containers: Rebuild Container` from command palette
3. Check Docker has sufficient resources (8GB RAM recommended)

### Docker commands fail inside container
The container uses Docker-in-Docker (DinD) with an isolated Docker daemon:
1. Verify the DinD daemon is running: `docker info`
2. If daemon not running, rebuild the container: `Dev Containers: Rebuild Container`
3. Container user (`root`) should have docker group membership automatically

### pnpm version mismatch
Corepack should handle this automatically. If issues persist:
```bash
corepack enable
corepack prepare pnpm@10.20.0 --activate
```

### Port already in use
If host already uses a forwarded port:
1. Stop the conflicting service on host
2. Or modify `forwardPorts` in `devcontainer.json` to use different ports

### Adding a project to existing PostgreSQL volume
See [PostgreSQL service](#postgresql) above for the correct procedure — never use `recreate` for this.

## Related Documentation

- [Architecture / Infrastructure](../architecture/infrastructure.md) — Complete infrastructure architecture, Helm chart config, Terraform setup
- [Quickstart](../quickstart.md) — High-level getting started guide
- [Domain: Affirmancy](../domain/affirmancy.md) — Affirmancy architecture and internals
- [Domain: Caelundas](../domain/caelundas.md) — Caelundas architecture and internals
- [Domain: Lexico](../domain/lexico.md) — Lexico architecture and internals
- [Domain: Meanderaw](../domain/meanderaw.md) — Meanderaw architecture and internals
- [ADR 0020: Store Meanders in Postgres](../../documentation/adr/0020-store-meanders-in-postgres.md)
- [ADR 0021: Stop Committing the Meander Pages](../../documentation/adr/0021-stop-committing-the-meander-pages.md)
- [ADR 0022: Give Every Database Project Its Own Database Schema and Role](../../documentation/adr/0022-give-every-database-project-its-own-database-schema-and-role.md)
