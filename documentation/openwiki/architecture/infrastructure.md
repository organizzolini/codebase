---
type: concept
title: Infrastructure & Deployment
description: Documents Docker Compose services (Postgres, SearxNG, Open WebUI), the reusable kubernetes-job Helm chart for batch job deployments with PVC storage, Terraform modules for Linode LKE, OpenRouter, GitHub, and state management, plus GitHub Actions CI/CD workflows.
tags: [infrastructure, deployment, kubernetes, helm, terraform, docker-compose, linode, github-actions, ci-cd]
verified:
  - by: openwiki/0.7.0
    at: 2026-10-29T03:39:46.432Z
sources:
  - id: openwiki-source-fde0a41d410be4adddc7d9c3
    resource: repo://documentation/adr/0022-give-every-database-project-its-own-database-schema-and-role.md
  - id: openwiki-source-22abed0c78ef12ea57f65cad
    resource: repo://infrastructure/AGENTS.md
  - id: openwiki-source-5af1e140a8c8b0f50fd8ad35
    resource: repo://infrastructure/docker/docker-compose.yml
  - id: openwiki-source-e7bbdf63be8e951ff0074e65
    resource: repo://infrastructure/helm/kubernetes-job/Chart.yaml
  - id: openwiki-source-81cdc9256efeb6d9b07957f0
    resource: repo://infrastructure/helm/kubernetes-job/templates/pvc.yaml
  - id: openwiki-source-b47e7fb311e337d6bffd3547
    resource: repo://infrastructure/helm/kubernetes-job/values/base.yaml
  - id: openwiki-source-20adfbd947778ab4f8c79dfb
    resource: repo://infrastructure/project.json
  - id: openwiki-source-e84c9845fa1929e0b3fde349
    resource: repo://infrastructure/README.md
  - id: openwiki-source-ad8f24a926b937b23fb1bc38
    resource: repo://infrastructure/terraform/main.tf
  - id: openwiki-source-0aba2796cdeec5dfca2ad43b
    resource: repo://infrastructure/terraform/variables.tf
generated: { by: "openwiki/0.7.0", at: "2026-10-29T03:39:46.432Z" }
---

# Infrastructure & Deployment

This page documents the infrastructure tooling that provisions cloud Kubernetes clusters, runs local development services, deploys batch workloads to Kubernetes, and automates continuous integration and deployment.

## Overview

The `infrastructure/` directory contains three independent deployment layers:

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Local services** | Docker Compose | PostgreSQL, SearxNG, Open WebUI for local development |
| **Kubernetes workloads** | Helm (`kubernetes-job`) | Reusable chart for batch Jobs with optional PVC storage |
| **Cluster & services provisioning** | Terraform | Linode LKE cluster, OpenRouter workspace/keys/presets, GitHub repository settings, Linode Object Storage bucket for Terraform state |

<!-- openwiki: broken internal link [project.json] file "project.json" does not exist. Fix the href or restore the target, then delete this comment. -->
These layers are orchestrated through [Nx targets](project.json) defined in `infrastructure/project.json`.

---

## Local Development Services (Docker Compose)

The Compose file at `infrastructure/docker/docker-compose.yml` defines three services managed via Nx targets:

```bash
# Start services
nx run infrastructure:postgres:up
nx run infrastructure:searxng:up
nx run infrastructure:open-webui:up

# Stop services
nx run infrastructure:postgres:down
nx run infrastructure:searxng:down
nx run infrastructure:open-webui:down

# Open web UIs in browser
nx run infrastructure:searxng:open
nx run infrastructure:open-webui:open

# Recreate Postgres (⚠️ destroys volume and all data)
nx run infrastructure:postgres:recreate
```

### Service Details

| Service | Image | Port | Volume | Purpose |
|---------|-------|------|--------|---------|
| **postgres** | `postgres:18-alpine` | 5432 | `postgres_data` | Shared PostgreSQL instance for all database-backed projects |
| **searxng** | `searxng/searxng:latest` | 8889 | settings.yml (bind mount) | Metasearch engine for local web search |
| **open-webui** | `ghcr.io/open-webui/open-webui:main` | 3001 | `open-webui_data` | Web UI for local LLM inference via Ollama |

### PostgreSQL Multi-Project Initialization

The `postgres` service uses a Compose **config** (`postgres-databases`) that installs an executable init script at `/docker-entrypoint-initdb.d/databases.sh`. This script runs **only when the volume is empty** (i.e., on first `up` or after `recreate`).

The script reads `POSTGRES_PROJECTS` (a space-separated list in the Compose environment) and for each project creates:

1. A role: `<project>_username` with password `<project>_password`
2. A database: `<project>_development` owned by that role
3. A schema: `<project>` inside that database, owned by the role

Current `POSTGRES_PROJECTS` value: `lexico meanderaw`

#### Adding a Project to an Existing Volume

If the volume already contains data (e.g., lexico's ingested rows), **do not use `recreate`** — it deletes the volume. Instead:

```bash
# 1. Add the project name to POSTGRES_PROJECTS in docker-compose.yml
# 2. Recreate the container (keeps the volume)
nx run infrastructure:postgres:up
# 3. Run the init script for only the missing project(s)
docker exec -e POSTGRES_PROJECTS=<project> postgres sh /docker-entrypoint-initdb.d/databases.sh
```

<!-- openwiki: broken internal link [../documentation/adr/0022-give-every-database-project-its-own-database-schema-and-role.md] file "../documentation/adr/0022-give-every-database-project-its-own-database-schema-and-role.md" does not exist. Fix the href or restore the target, then delete this comment. -->
The script stops at the first object that already exists, so specify only the projects the volume lacks. See [ADR 0022](../documentation/adr/0022-give-every-database-project-its-own-database-schema-and-role.md) for the full rationale and meanderaw's one exception (its database existed from a prior ADR).

---

## Kubernetes Job Deployments (Helm Chart)

The `kubernetes-job` chart at `infrastructure/helm/kubernetes-job/` is a reusable Helm chart for deploying **batch Jobs** (work that runs to completion) with optional **PVC storage** for output artifacts.

### When to Use This Chart

- **Use a Job** for work that runs to completion and leaves output behind (e.g., caelundas writes iCalendar files to a PVC, data migrations, report generation)
- **Use a Deployment** for anything that serves requests continuously

### Chart Structure

```
infrastructure/helm/kubernetes-job/
├── Chart.yaml              # Chart metadata (v0.1.0)
├── values/
│   └── base.yaml           # Default values (placeholder image: my-application)
└── templates/
    ├── _helpers.tpl        # Name, label, selector helpers
    ├── job.yaml            # Job template with optional PVC mount
    └── pvc.yaml            # PVC template (conditionally rendered)
```

### Key Configuration (`values/base.yaml`)

| Section | Purpose |
|---------|---------|
| `image.repository` / `image.tag` | **Must be overridden at deploy time** — defaults to placeholder `my-application` |
| `job.backoffLimit` | Retries before marking Job failed (default: 3) |
| `job.completions` / `job.parallelism` | Job completion semantics (defaults: 1/1) |
| `job.ttlSecondsAfterFinished` | Auto-delete finished Job after 24h (86400s) |
| `persistence.enabled` | Enable PVC (default: true) |
| `persistence.storageClassName` | Storage class (default: `standard`) |
| `persistence.size` | PVC size (default: 1Gi) |
| `persistence.mountPath` | Container mount path (default: `/app/output`) |
| `metadata.gitCommit` / `metadata.timestamp` | Labels stamped on Job and PVC for traceability |

### Deploying an Application

Override the image at deploy time — `values/base.yaml` holds chart defaults including the placeholder image:

```bash
helm upgrade --install <release-name> infrastructure/helm/kubernetes-job/ \
  --values infrastructure/helm/kubernetes-job/values/base.yaml \
  --set image.repository=<your-image> --set image.tag=<tag> \
  --set metadata.gitCommit=$(git rev-parse HEAD) \
  --set metadata.timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
```

Monitor and clean up:

```bash
# Watch Job progress
kubectl get jobs -w

# Inspect a stuck Job
kubectl describe job <name>

# Clean up
helm uninstall <release-name>
# PVCs are NOT deleted automatically — remove explicitly when done:
kubectl delete pvc <pvc-name>
```

### PVC Behavior

- PVC is created with the same name as the Job (`kubernetes-job.fullname` helper)
- PVC **outlives the Job** — not deleted when Job or pod terminates
- Use `ttlSecondsAfterFinished` to auto-delete the Job, but **manually delete the PVC** once you've retrieved its data
- Labels on PVC include `application: caelundas` plus git commit/timestamp if provided

### Linting the Chart

```bash
nx run infrastructure:helm-lint
# Runs: helm lint infrastructure/helm/kubernetes-job --values infrastructure/helm/kubernetes-job/values/base.yaml
```

This runs in CI as part of `lint-code`.

---

## Cluster & Services Provisioning (Terraform)

Terraform provisions four independent roots, all using a shared Linode Object Storage bucket (S3-compatible backend) for state:

### Directory Structure

```
infrastructure/terraform/
├── main.tf                 # Root module: Linode LKE cluster
├── variables.tf            # Input variables (linode_token, linode_region, cluster_id)
├── openrouter/             # OpenRouter workspace, API key, guardrail, preset
├── github/                 # GitHub repository settings, ruleset, Actions variables
└── linode/                 # Object Storage bucket and access key for Terraform state
```

### Root Module: Linode LKE Cluster (`main.tf`)

Provisions a **Linode LKE (Linode Kubernetes Engine)** cluster:

- **Label**: `lexico-prod`
- **Kubernetes version**: 1.34
- **Region**: configurable via `linode_region` variable (default: `us-east`)
- **Node pool**: `g6-standard-1`, count 1, autoscaler min 1 / max 3
- **Required variable**: `linode_token` (sensitive)
- **Output**: kubeconfig (sensitive)

```bash
cd infrastructure/terraform
terraform init
terraform plan -var="linode_token=$LINODE_API_TOKEN"
terraform apply -var="linode_token=$LINODE_API_TOKEN"
```

### Module: OpenRouter (`terraform/openrouter/`)

Manages OpenRouter resources for the `refresh-documentation` workflow:

- **Workspace**: imports existing workspace by ID
- **Guardrail**: `refresh-documentation` with allowed models and monthly USD limit
- **API Key**: imports existing key by name (`refresh-documentation`), preserves its value
- **Preset**: ranked model list written via `terraform_data` + `local-exec` (provider lacks preset resource)
- **State backend**: Linode Object Storage bucket, key `codebase/terraform.tfstate`

### Module: GitHub (`terraform/github/`)

Manages GitHub repository configuration:

- **Repository**: imported, squash merges only, security features enabled
- **Branch protection**: `main` ruleset with required status checks, linear history
- **Actions variables**: `OPENWIKI_MODEL_ID` sourced from OpenRouter module output
- **State backend**: same bucket, key `codebase/github.tfplan`
- **Depends on**: OpenRouter module outputs (applied first in CD)

### Module: Linode (`terraform/linode/`)

Manages the Object Storage bucket that holds **all Terraform state**:

- **Bucket**: imported, label configurable, region configurable, ACL private, `prevent_destroy = true`
- **Access key**: imported by numeric ID, read_write permissions on the bucket, `prevent_destroy = true`
- **State backend**: same bucket, key `codebase/linode.tfstate`

### State Management

All four roots share a **Linode Object Storage bucket** as an S3-compatible backend:

- **Bucket**: created/managed by `linode` root, imported by others
- **Endpoint**: `AWS_ENDPOINT_URL_S3` (Linode S3 endpoint)
- **Credentials**: `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` (Linode Object Storage key)
- **No state locking**: CI serializes applies via workflow concurrency group
- **Backend config**: `skip_credentials_validation`, `skip_metadata_api_check`, `skip_region_validation`, `skip_requesting_account_id`, `skip_s3_checksum`

### Provisioning Workflow

Each root is initialized, planned, and applied independently via Nx targets:

```bash
# Initialize a root (--configuration=openrouter, github, or linode)
nx run infrastructure:terraform-init:openrouter

# Plan a root and write plan.tfplan
nx run infrastructure:terraform-plan:openrouter

# Apply a root (run by CD on main; run locally only on purpose)
nx run infrastructure:terraform-apply:openrouter
```

### Trivy Configuration Scan

The `trivy-config` Nx target scans Terraform code for misconfigurations:

```bash
nx run infrastructure:trivy-config
# Runs: trivy config infrastructure/terraform --format table --severity CRITICAL,HIGH --exit-code 1 --ignorefile configuration/trivyignore
```

This runs identically to the CI Secure Code workflow, so a local run reproduces CI exactly. The `configuration/trivyignore` file allows suppressing verified false positives.

---

## Nx Targets for Infrastructure

All infrastructure operations are available as Nx targets in `infrastructure/project.json`:

| Target | Configurations | Description |
|--------|----------------|-------------|
| `postgres` | `up`, `down`, `recreate` | Start, stop, or recreate the local PostgreSQL container (recreate removes the volume) |
| `searxng` | `up`, `down`, `open` | Manage the SearxNG Docker service |
| `open-webui` | `up`, `down`, `open` | Manage the Open WebUI Docker service |
| `terraform` | `plan` (default), `import` | Run Terraform commands against the LKE cluster root |
| `terraform-init` | `openrouter`, `github`, `linode` | Initialize a Terraform root against its Linode Object Storage backend |
| `terraform-plan` | `openrouter`, `github`, `linode` | Plan a Terraform root and write `plan.tfplan` |
| `terraform-apply` | `openrouter`, `github`, `linode` | Apply a Terraform root (CD runs on main) |
| `terraform-format` | — | Check Terraform formatting (`fmt -check -diff -recursive`) |
| `terraform-validate` | — | Validate Terraform without backend or credentials |
| `trivy-config` | — | Scan Terraform infrastructure code for misconfigurations using Trivy |
| `helm-lint` | — | Lint the `kubernetes-job` chart against its base values |
| `compose-config` | — | Validate the Docker Compose file (creates missing `.env` from `.env.default`) |

### CI Integration

- `helm-lint` and `compose-config` run in CI as part of `lint-code` (the Lint leg of `.github/workflows/continuous-integration.yml`)
- `compose-config` creates a missing root `.env` from `.env.default` and never overwrites an existing one
- `terraform-format` and `terraform-validate` run in CI as part of `lint-code`
- `trivy-config` runs in the Secure Code workflow when triggered

---

## GitHub Actions CI/CD Workflows

### `setup-codebase` Composite Action (`.github/actions/setup-codebase/action.yml`)

Reusable setup for every CI/CD job. All optional steps are gated by inputs so a job pays only for what it uses.

| Input | Default | Purpose |
|-------|---------|---------|
| `gitleaks` | `false` | Install gitleaks (secret scanning) |
| `install` | `true` | Install node dependencies with pnpm |
| `nx-cache` | `true` | Restore and save the Nx task cache |
| `nx-cache-scope` | `${{ github.job }}` | Cache key partition (matrix jobs must pass unique value) |
| `nx-graph-cache` | `true` | Restore/save Nx project graph (~11s cold start savings) |
| `nx-shas` | `true` | Resolve NX_BASE/NX_HEAD for `nx affected` |
| `nx-base` | `last-successful` | Push base: `last-successful` or `push-before` |
| `python-dependencies` | `true` | Sync uv workspace into `.venv` (for yamllint, sqlfluff) |
| `postgres-client` | `false` | Install PostgreSQL 18 client tools (pg_dump, pg_restore) |
| `trivy` | `false` | Install trivy (infrastructure scanning) |
| `terraform` | `false` | Install terraform (lint, plan, apply) |
| `eslint-cache` | `false` | Restore/save ESLint cache |
| `uv` | `true` | Install uv (used by yaml-lint, sqlfluff on every TS project) |

**Outputs**: `nx-cache-primary-key`, `nx-cache-scope` (for `cleanup-codebase`)

### `cleanup-codebase` Composite Action (`.github/actions/cleanup-codebase/action.yml`)

Saves Nx cache progress even on timeout/cancellation. Call as last step with `if: always()`.

| Input | Default | Purpose |
|-------|---------|---------|
| `nx-cache` | `true` | Save the Nx task cache |
| `nx-cache-primary-key` | — | Exact-match key from `setup-codebase` output (required when `nx-cache=true`) |
| `nx-cache-scope` | `""` | Names the artifact for merge group |
| `nx-cache-artifact` | `false` | Upload cache as artifact for merge group (PRs only) |
| `eslint-cache` | `false` | Save ESLint cache |

### Continuous Integration (`.github/workflows/continuous-integration.yml`)

Runs on push to `main`, PRs, merge group, and workflow_dispatch.

**Concurrency**: per-workflow + ref, cancels in-progress on non-main refs.

**Matrix jobs** (fail-fast: false):

| Target | Name | Emoji | Timeout |
|--------|------|-------|---------|
| `typecheck-code` | Typecheck | 🧑‍🎓 | 12m |
| `format-code` | Format | 🧑‍🎨 | 12m |
| `lint-code` | Lint | 🧑‍🔧 | 12m |
| `deprecate-code` | Deprecate | 🧟 | 12m |
| `guard-code` | Guard | 💂 | 20m |
| `test-code` | Test | 🧑‍🔬 | 12m |
| `test-code` (caelundas shard) | Test Caelundas | 🧑‍🔬 | 12m |
| `test-code` (meanderaw-cli shard) | Test Meanderaw | 🧑‍🔬 | 12m |
| `test-code` (ic-suite shard) | Test IC Suite | 🧑‍🔬 | 12m |
| `secure-code` | Secure | 🕵️ | 12m |
| `build-projects` | Build | 👷 | 12m |

**Key setup-codebase inputs per job**: `secure-code` enables `trivy`; `lint-code` runs `helm-lint`, `compose-config`, `terraform-format`, `terraform-validate` via Nx.

### Continuous Deployment (`.github/workflows/continuous-deployment.yml`)

Runs on push to `main` and workflow_dispatch. **Never cancels** (`cancel-in-progress: false`).

**Matrix targets**:

| ID | Name | Emoji | Timeout | Purpose |
|----|------|-------|---------|---------|
| `build-devcontainer` | Devcontainer | 🧑‍🏭 | 20m | Build & test devcontainer image |
| `push-releases` | Releases | 🦸 | 32m | Version, build, publish npm packages |
| `apply-terraform` | Infrastructure | 🏗️ | 20m | Apply Terraform roots on main |

**Infrastructure apply order** (enforced by CD):
1. `openrouter` — GitHub root reads its outputs
2. `github` — Depends on OpenRouter outputs
3. `linode` — Manages state bucket

**Secrets injected for `apply-terraform`**:
- `TERRAFORM_STATE_BUCKET`, `TERRAFORM_STATE_ENDPOINT`, `TERRAFORM_STATE_ACCESS_KEY_ID`, `TERRAFORM_STATE_SECRET_ACCESS_KEY`
- `OPENROUTER_API_KEY`, `OPENROUTER_MANAGEMENT_KEY`
- `GH_TOKEN`, `LINODE_TOKEN`

### Refresh Documentation (`.github/workflows/refresh-documentation.yml`)

Weekly scheduled (Friday 8:18 UTC) + manual dispatch.

Runs OpenWiki in repository code mode, opens PR with documentation updates on `docs/documentation-refresh` branch.

### Upgrade Dependencies (`.github/workflows/upgrade-dependencies.yml`)

Weekly scheduled (Friday 8:18 UTC) + manual dispatch.

Runs upgrades for pnpm, Node, Python, lockfile, Python deps, skills, Impeccable. Opens PR with results.

---

## Related Pages

- [Database Management](../operations/database-management.md) — Per-project database, schema, and role conventions
- [Local Development](../operations/local-development.md) — Running services locally with Nx
- [CI/CD Workflows](../workflows/ci-cd.md) — Continuous integration and deployment pipelines
- [Ollama & SearxNG Integration](../integrations/ollama-searxng.md) — Local LLM inference and metasearch
- [External Services](../integrations/external-services.md) — OpenRouter, Linode, GitHub configuration
