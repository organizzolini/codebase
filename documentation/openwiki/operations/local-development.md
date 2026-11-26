---
type: operations-guide
title: Local Development Setup
description: Complete local development environment including dev container, Docker Compose services, Nx targets, environment files, dependency installation, and project-specific quickstarts.
tags: [devcontainer, docker-compose, nx, environment, quickstart]
verified:
  - by: openwiki/0.9.0
    at: 2026-11-25T18:55:00.444Z
sources:
  - id: openwiki-source-7ce83b1fa051a437b5baffc6
    resource: repo://.devcontainer/cloud/devcontainer.json
  - id: openwiki-source-36b751a4c96b6d4e9193da92
    resource: repo://.devcontainer/local/devcontainer.json
  - id: openwiki-source-9bdedb6b4cae230293bf415c
    resource: repo://.devcontainer/README.md
  - id: openwiki-source-4df2ef2c03e83df67e2fd009
    resource: repo://.devcontainer/scripts/post-create-command.sh
  - id: openwiki-source-2fe644645addbb5d683744e9
    resource: repo://.env.default
  - id: openwiki-source-6f998d83c145b9379bd4ec08
    resource: repo://configuration/python/pyproject.toml
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
  - id: openwiki-source-bfc67abb6a9bedba78f585cd
    resource: repo://projects/caelundas/caelundas-cli/configuration/.env.default
  - id: openwiki-source-365913b525ddd217ee2335b6
    resource: repo://projects/caelundas/caelundas-cli/README.md
  - id: openwiki-source-74efd1b4fbc60ac637a3d639
    resource: repo://projects/lexico/lexico-cli/configuration/.env.default
  - id: openwiki-source-5e40db637ff9cea3eb6ab5fe
    resource: repo://projects/lexico/lexico-cli/README.md
  - id: openwiki-source-13fd90ad26a1489c04561ff4
    resource: repo://projects/meanderaw/meanderaw-cli/configuration/.env.default
  - id: openwiki-source-a6e80b612169ffb94413f377
    resource: repo://projects/meanderaw/meanderaw-cli/README.md
generated: { by: "openwiki/0.9.0", at: "2026-11-25T18:55:00.444Z" }
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
| `node:26` | 26.x (LTS) | Node.js 26 with TypeScript support | Both |
| `pnpm:2` | 11.2.2 | pnpm package manager | Both |
| `docker-in-docker` | 2 | Isolated Docker daemon inside container (DinD) | Cloud only |
| `docker-outside-of-docker` | 1 | Mounts host Docker socket (DooD) | Local only |
| `github-cli:1` | 2.87.3 | `gh` command for GitHub operations | Both |
| `kubectl-helm-minikube:1` | kubectl 1.35.1, Helm 4.1.1 | kubectl and Helm (minikube disabled) | Both |
| `terraform:1` | 1.14.5 + tflint 0.61.0 | Terraform CLI + tflint for infrastructure | Both |
| `python:1` | 3.14 | Python with JupyterLab and tools | Both |
| `nx-npm:1` | 22.7.3 | Nx CLI globally | Both |
| `uv:1` | latest | Fast Python package installer | Both |
| `jq-likes:2` | jq 1.8.1 | JSON/YAML processors | Both |
| `sqlite:1` | 3.40.1 | SQLite CLI for database querying (caelundas ephemeris caching) | Both |

**Custom installations (via `postCreateCommand`):**
- **PostgreSQL 18 Client** (`pg_dump`, `psql`) — installed via apt from PGDG repository
- **Gitleaks** — version from `GITLEAKS_VERSION` remoteEnv (8.30.1)
- **Trivy** — version from `TRIVY_VERSION` remoteEnv (0.74.0)
- **uv** — version from `UV_VERSION` remoteEnv (0.12.3)
- **node-gyp** — latest via npm global install

### Lifecycle Scripts

| Hook | Tasks |
|------|-------|
| `initializeCommand` | Creates `.kube/config` directory for kubeconfig |
| `postCreateCommand` | Enable pnpm via Corepack, install dependencies, sync VS Code Machine settings, generate Nx graph |
| `postAttachCommand` | Verify tool versions (node, pnpm, gh, helm) |

### Port Forwarding

Ports are automatically forwarded to your host machine:

| Port | Service | Auto-Forward | Notes |
|------|---------|--------------|-------|
| 3000 | Lexico Dev Server | Notify | TanStack Start dev server |
| 3001 | Open WebUI | Notify | |
| 8889 | SearxNG | Notify | |
| 11434 | Ollama API | Silent | Proxied via `host.docker.internal` |

### Quick Start

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) and [VS Code Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
2. Open the codebase folder in VS Code
3. Open the command palette (`Ctrl/Cmd+Shift+P`) → **Dev Containers: Reopen in Container**
4. When prompted to select a configuration, choose:
   - **Codebase Devcontainer (Local)** — for local development (Docker outside of Docker)
   - **Codebase Devcontainer (Cloud)** — for GitHub Codespaces or if you want isolated Docker (Docker in Docker)
5. Wait for container build (~2-3 minutes first time, cached after)
6. Terminal opens with all tools ready

> **Tip:** On a local machine, the `Local` configuration is strongly recommended. It shares your host's Docker daemon (faster builds, shared image cache, no memory overhead from a second Docker daemon). Codespaces must use the `Cloud` configuration since no host Docker socket is available.

### Post-Build Verification

After building the container, verify the setup:

```bash
# 1. Check tool versions
node --version          # Should output v26.x (per .nvmrc and engines.node in package.json)
pnpm --version          # Should output 11.2.2 (per devcontainer feature)
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
<!-- openwiki: broken internal link [../../documentation/adr/0022-give-every-database-project-its-own-database-schema-and-role.md] file "../../documentation/adr/0022-give-every-database-project-its-own-database-schema-and-role.md" does not exist. Fix the href or restore the target, then delete this comment. -->
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
| `terraform-plan` | `openrouter`, `github`, `linode` | Plan a Terraform root and write plan.tfplan |
| `terraform-apply` | `openrouter`, `github`, `linode` | Apply a Terraform root (CI does this on main) |
| `terraform-init` | `openrouter`, `github`, `linode` | Initialize a Terraform root against its Linode Object Storage backend |
| `terraform-format` | - | Check that Terraform code is formatted (part of lint-code) |
| `terraform-validate` | - | Validate Terraform without a backend (part of lint-code) |
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

`helm-lint`, `terraform-format`, `terraform-validate`, and `compose-config` run in CI: `lint-code` depends on them, so the Lint leg of continuous-integration.yml runs them. They need `helm`, `terraform`, and `docker compose`; `compose-config` creates a missing root `.env` from `.env.default` and never overwrites an existing one.

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

Each project has its own `configuration/.env.default` that must be copied to `configuration/.env` (gitignored) in the project directory:

```bash
# Caelundas
cp projects/caelundas/caelundas-cli/configuration/.env.default projects/caelundas/caelundas-cli/configuration/.env

# Lexico
cp projects/lexico/lexico-cli/configuration/.env.default projects/lexico/lexico-cli/configuration/.env

# Meanderaw
cp projects/meanderaw/meanderaw-cli/configuration/.env.default projects/meanderaw/meanderaw-cli/configuration/.env
```

Project `.env` files contain project-prefixed database variables (e.g., `CAELUNDAS_POSTGRES_*`, `LEXICO_POSTGRES_*`, `MEANDERAW_POSTGRES_*`) that default to the local container's per-project role, database, and schema. The `MEANDERAW_` prefix keeps them apart from the unprefixed `POSTGRES_*` variables the workspace root's `.env` sets as the container's admin login, which Nx also loads into every task and which meanderaw never reads.

Example `meanderaw-cli/configuration/.env.default`:
```
MEANDERAW_POSTGRES_DATABASE="meanderaw_development"
MEANDERAW_POSTGRES_HOST="localhost"
MEANDERAW_POSTGRES_PASSWORD="meanderaw_password"
MEANDERAW_POSTGRES_PORT=5432
MEANDERAW_POSTGRES_SCHEMA="meanderaw"
MEANDERAW_POSTGRES_USERNAME="meanderaw_username"
```

## Dependency Installation

### Node.js / TypeScript (pnpm)

Install all workspace dependencies from the repository root:

```bash
pnpm install
```

This installs dependencies for all projects in the pnpm workspace (defined in `pnpm-workspace.yaml`), including the root `package.json`, `configuration/`, `infrastructure/`, and all projects under `projects/*`.

The workspace uses `pnpm@12.21.0` (per `packageManager` in `package.json`); the dev container installs `pnpm@11.2.2` via feature, and Corepack upgrades to the lockfile version on first `pnpm install`.

### Python (uv)

Python projects are managed as a uv workspace declared in `configuration/python/pyproject.toml`, sharing `configuration/python/uv.lock` and the root `.venv`. Sync from the repository root and point uv at that workspace config:

```bash
uv sync --project configuration/python
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
# 1. Start Postgres
nx run infrastructure:postgres:up

# 2. Copy project .env
cp projects/caelundas/caelundas-cli/configuration/.env.default projects/caelundas/caelundas-cli/configuration/.env

# 3. Run migrations
nx run caelundas-db:migration:run

# 4. Generate calendar (and fill night sky for web app)
nx run caelundas-cli:start
```

### Lexico

Dictionary and language tooling with dictionary, library, literature, and wiktionary ingestion stages.

**Quick Start:**
```bash
# 1. Start Postgres
nx run infrastructure:postgres:up

# 2. Copy project .env
cp projects/lexico/lexico-cli/configuration/.env.default projects/lexico/lexico-cli/configuration/.env

# 3. Run CLI (with optional stage flags)
nx run lexico-cli:start --stage=dictionary
nx run lexico-cli:start --stage=library
nx run lexico-cli:start --stage=literature
nx run lexico-cli:start --stage=wiktionary
```

### Meanderaw

Procedural meander generation stored in PostgreSQL, with draw and single-drawing modes.

**Quick Start:**
```bash
# 1. Start Postgres
nx run infrastructure:postgres:up

# 2. Run migrations
nx run meanderaw-db:migration:run

# 3. Run CLI (draw mode is default)
nx run meanderaw-cli:start

# Single-drawing mode (requires all three flags together)
nx run meanderaw-cli:start --args="--rows <n> --columns <n> --code <code>"
```

Meanderaw follows the workspace's shared Postgres convention: the `meanderaw_development` database holds a `meanderaw` schema, both owned by the `meanderaw_username` role. The local Postgres container creates all three the first time its volume starts empty; on a volume that predates that, the [infrastructure README](../../../infrastructure/README.md) describes how to add them without discarding what the volume holds.

**Run tests:**
```bash
nx run meanderaw-cli:vitest
```
