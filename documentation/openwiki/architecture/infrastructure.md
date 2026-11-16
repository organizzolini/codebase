---
type: concept
title: Infrastructure & Deployment
description: Documents Docker Compose services (PostgreSQL, SearxNG, Open WebUI), the reusable kubernetes-job Helm chart for batch Job deployments with PVC storage, Terraform modules for Linode LKE, OpenRouter, GitHub, and state management, plus GitHub Actions CI/CD workflows.
tags: [infrastructure, deployment, kubernetes, helm, terraform, docker-compose, linode, github-actions, ci-cd]
verified:
  - by: openwiki/0.9.0
    at: 2026-11-13T16:30:25.369Z
sources:
  - id: openwiki-source-6315af249215d8768fb68811
    resource: repo://.github/workflows/continuous-integration.yml
  - id: openwiki-source-fde0a41d410be4adddc7d9c3
    resource: repo://documentation/adr/0022-give-every-database-project-its-own-database-schema-and-role.md
  - id: openwiki-source-22abed0c78ef12ea57f65cad
    resource: repo://infrastructure/AGENTS.md
  - id: openwiki-source-5af1e140a8c8b0f50fd8ad35
    resource: repo://infrastructure/docker/docker-compose.yml
  - id: openwiki-source-e7bbdf63be8e951ff0074e65
    resource: repo://infrastructure/helm/kubernetes-job/Chart.yaml
  - id: openwiki-source-40b3a845cd481c0e77ef54f2
    resource: repo://infrastructure/helm/kubernetes-job/templates/_helpers.tpl
  - id: openwiki-source-1a33571485e19c496c3381ea
    resource: repo://infrastructure/helm/kubernetes-job/templates/job.yaml
  - id: openwiki-source-81cdc9256efeb6d9b07957f0
    resource: repo://infrastructure/helm/kubernetes-job/templates/pvc.yaml
  - id: openwiki-source-b47e7fb311e337d6bffd3547
    resource: repo://infrastructure/helm/kubernetes-job/values/base.yaml
  - id: openwiki-source-20adfbd947778ab4f8c79dfb
    resource: repo://infrastructure/project.json
  - id: openwiki-source-e84c9845fa1929e0b3fde349
    resource: repo://infrastructure/README.md
  - id: openwiki-source-ed044f21fe51f0921f329f58
    resource: repo://infrastructure/terraform/github/main.tf
  - id: openwiki-source-0833021253fa2e80686f2baa
    resource: repo://infrastructure/terraform/linode/main.tf
  - id: openwiki-source-70a46f66a844130692fc95fa
    resource: repo://infrastructure/terraform/linode/outputs.tf
  - id: openwiki-source-ad8f24a926b937b23fb1bc38
    resource: repo://infrastructure/terraform/main.tf
  - id: openwiki-source-fee95c572f00c778206fb7e0
    resource: repo://infrastructure/terraform/openrouter/main.tf
  - id: openwiki-source-0aba2796cdeec5dfca2ad43b
    resource: repo://infrastructure/terraform/variables.tf
generated: { by: "openwiki/0.9.0", at: "2026-11-13T16:30:25.369Z" }
---

# Infrastructure & Deployment

This page documents the infrastructure tooling that provisions cloud Kubernetes clusters, runs local development services, deploys batch workloads to Kubernetes, and automates continuous integration and deployment.

## Overview

The `infrastructure/` directory contains three independent deployment layers:

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Local services** | Docker Compose | PostgreSQL, SearxNG, Open WebUI for local development |
| **Kubernetes workloads** | Helm (`kubernetes-job`) | Reusable chart for batch Jobs with optional PVC storage |
| **Cluster & services provisioning** | Terraform | Linode LKE cluster, OpenRouter workspace/keys/presets, GitHub repository settings, Linode Object Storage bucket for Terraform state and Nx cache |

<!-- openwiki: broken internal link [../project.json] file "../project.json" does not exist. Fix the href or restore the target, then delete this comment. -->
These layers are orchestrated through [Nx targets](../project.json) defined in `infrastructure/project.json`.

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

Current `POSTGRES_PROJECTS` value: `caelundas lexico meanderaw`

#### Adding a Project to an Existing Volume

If the volume already contains data (e.g., lexico's ingested rows), **do not use `recreate`** — it deletes the volume. Instead:

```bash
# 1. Add the project name to POSTGRES_PROJECTS in docker-compose.yml
# 2. Recreate the container while keeping the volume
nx run infrastructure:postgres:up

# 3. Run the init script for only the missing project(s)
docker exec -e POSTGRES_PROJECTS=<project> postgres sh /docker-entrypoint-initdb.d/databases.sh
```

The script stops at the first `CREATE` whose object already exists, so name only the projects the volume lacks. For meanderaw (whose database existed from an earlier ADR), a manual `ALTER DATABASE` is needed instead of `CREATE DATABASE` — see [ADR 0022](../../documentation/adr/0022-give-every-database-project-its-own-database-schema-and-role.md).

---

## Kubernetes Batch Jobs (Helm Chart)

The `infrastructure/helm/kubernetes-job/` chart is a reusable Helm chart for deploying applications as Kubernetes Jobs with optional PVC storage.

### Purpose

Deploy batch workloads that run to completion and leave output behind (e.g., data migrations, report generation, iCalendar file generation). Use a Job for work that completes; use a Deployment for anything that serves requests continuously.

### Key Configuration (from `values/base.yaml`)

| Setting | Default | Description |
|---------|---------|-------------|
| `image.repository` | `my-application` | Placeholder; override at deploy time |
| `job.backoffLimit` | `3` | Retries before marking Job failed |
| `job.completions` | `1` | Successful completions required |
| `job.parallelism` | `1` | Pods running in parallel |
| `job.ttlSecondsAfterFinished` | `86400` | Auto-delete after 24h |
| `persistence.enabled` | `true` | Create and mount a PVC |
| `persistence.storageClassName` | `standard` | Storage class for PVC |
| `persistence.accessMode` | `ReadWriteOnce` | PVC access mode |
| `persistence.size` | `1Gi` | PVC size |
| `persistence.mountPath` | `/app/output` | Container mount path |

### Deploying

```bash
helm upgrade --install <release-name> infrastructure/helm/kubernetes-job/ \
  --values infrastructure/helm/kubernetes-job/values/base.yaml \
  --set image.repository=<image> --set image.tag=<tag>

# Monitor the Job
kubectl get jobs -w

# Clean up (PVC is NOT deleted automatically)
helm uninstall <release-name>
```

### Important Behaviors

- **PVCs outlive their Job** — PVCs are never deleted automatically when a Job or pod goes away. Remove them explicitly (`kubectl delete pvc <name>`) once you have the output.
- **Labels for traceability** — The chart stamps `caelundas.job/git-commit` and `caelundas.job/timestamp` labels on the Job and PVC when `metadata.gitCommit` and `metadata.timestamp` values are provided.
- **Image architecture** — `exec format error` means the image was built for arm64. Rebuild with `--platform linux/amd64`.

### Chart Structure

- `Chart.yaml` — Chart metadata (v0.1.0)
- `values/base.yaml` — Default values with placeholder image
- `templates/job.yaml` — Job template with PVC mount, env, resources, security context
- `templates/pvc.yaml` — Conditional PVC (enabled by `persistence.enabled`)
- `templates/_helpers.tpl` — Name, fullname, chart, labels, selector labels helpers

---

## Cluster & Services Provisioning (Terraform)

Terraform configuration lives under `infrastructure/terraform/` with four independent roots:

```
infrastructure/terraform/
├── main.tf                 # Linode LKE cluster (linode_lke_cluster)
├── variables.tf            # linode_token, linode_region, linode_kubernetes_engine_cluster_id
├── openrouter/             # OpenRouter workspace, API key, guardrail, ranked-model preset
├── github/                 # GitHub repository settings, main ruleset, Actions variables
└── linode/                 # Object Storage buckets: Terraform state + shared Nx cache
```

All roots share an **S3-compatible backend** pointing to a Linode Object Storage bucket. The backend uses environment variables (`TF_STATE_BUCKET`, `AWS_ENDPOINT_URL_S3`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) and skips AWS-specific validation. No state lock — CI serializes applies with a workflow concurrency group.

### 1. Linode LKE Cluster (`main.tf`)

Provisions a Linode Kubernetes Engine cluster:

- **Label**: `lexico-prod`
- **Kubernetes version**: `1.34`
- **Region**: `us-east` (configurable via `linode_region` variable)
- **Node pool**: `g6-standard-1`, count `1`, autoscaler `min=1` / `max=3`
- **Required variable**: `linode_token` (sensitive)
- **Output**: `kubeconfig` (sensitive)

### 2. OpenRouter (`openrouter/`)

Manages OpenRouter resources using the `OpenRouterTeam/openrouter` provider:

- **Workspace**: Imports existing workspace by `workspace_id`
- **Guardrail**: `refresh-documentation` — restricts models via `allowed_models` and sets monthly USD spend limit
- **API Key**: Imports existing `refresh-documentation` key by name (value stays in `OPENROUTER_API_KEY` secret)
- **Preset**: Written via `local-exec` provisioner to OpenRouter's API; ranked fallback list defined in `models` variable; changes to `models` or `preset_slug` replace the resource
- **Output**: `refresh_documentation_model` — the preset slug used by the Refresh Documentation workflow

### 3. GitHub (`github/`)

Manages GitHub repository settings using the `integrations/github` provider (requires fine-grained token with Variables/Secrets write):

- **Actions variables** sourced from other roots' outputs:
  - `OPENWIKI_MODEL_ID` ← OpenRouter preset slug
  - `NX_CACHE_BUCKET`, `NX_CACHE_ENDPOINT`, `NX_CACHE_REGION` ← Linode Nx cache bucket
- Uses `terraform_remote_state` data sources to read outputs from `openrouter` and `linode` roots (wrapped in `try()` for PR planning before roots apply)

### 4. Linode Object Storage (`linode/`)

Manages the Object Storage bucket that holds **all Terraform state** and the **shared Nx cache**:

- **State bucket** (`linode_object_storage_bucket.state`): Original bucket `organizzolini`, imported, `prevent_destroy = true`
- **State key** (`linode_object_storage_key.state`): Access key for the state bucket, imported by numeric ID, `prevent_destroy = true`
- **New state bucket** (`linode_object_storage_bucket.terraform_state`): Target bucket `organizzolini-codebase-terraform-state` for migration (Linode cannot rename buckets)
- **New state key** (`linode_object_storage_key.terraform_state`): Access key for new bucket; secret readable via `terraform output`
- **Nx cache bucket** (`linode_object_storage_bucket.nx_cache`): Separate bucket for shared Nx cache
- **Nx cache keys**: Read-only key (for PR runs) and read-write key (for trusted main runs)

**Outputs** (all sensitive where appropriate):
- `nx_cache_bucket`, `nx_cache_endpoint` — for Nx cache configuration
- `nx_cache_read_only_access_key`, `nx_cache_read_only_secret_key` — PR runs
- `nx_cache_read_write_access_key`, `nx_cache_read_write_secret_key` — main runs
- `terraform_state_bucket`, `terraform_state_endpoint`, `terraform_state_access_key`, `terraform_state_secret_key` — for backend migration cutover

### State Bucket Migration

The state is moving from `organizzolini` to `organizzolini-codebase-terraform-state`. The migration procedure (from `infrastructure/README.md`):

1. **Create**: Merge the change adding the new bucket; CD applies the `linode` root.
2. **Read new credentials**: Initialize `linode` root against old bucket, read outputs:
   ```bash
   cd infrastructure/terraform/linode
   terraform output -raw terraform_state_access_key
   terraform output -raw terraform_state_secret_key
   ```
3. **Copy**: Sync objects between buckets using AWS CLI with appropriate profiles.
4. **Verify**: Compare object counts and ETags; ensure `linode.tfstate` matches byte-for-byte.
5. **Switch**: Update GitHub secrets `TERRAFORM_STATE_BUCKET`, `TERRAFORM_STATE_ENDPOINT`, `TERRAFORM_STATE_ACCESS_KEY_ID`, `TERRAFORM_STATE_SECRET_ACCESS_KEY` to new values.
6. **Prove**: Run `nx run infrastructure:terraform-init:<root>` and `terraform plan` for each root (`openrouter`, `github`, `linode`) — each must show no changes.
7. **Retire**: After a week of clean runs, `terraform state rm` the old bucket/key resources, delete their config, then delete the old bucket and key in Linode console (both have `prevent_destroy`).

### Terraform Nx Targets

| Target | Configuration | Purpose |
|--------|---------------|---------|
| `terraform-format` | — | `terraform fmt -check -diff -recursive openrouter github linode` (part of lint-code) |
| `terraform-validate` | — | Validates Terraform syntax (no backend/creds needed, part of lint-code) |
| `terraform-init` | `openrouter`, `github`, `linode` | Initialize a root against its S3 backend |
| `terraform-plan` | `openrouter`, `github`, `linode` | Plan a root, write `plan.tfplan` (depends on `terraform-init`) |
| `terraform-apply` | `openrouter`, `github`, `linode` | Apply a root (depends on `terraform-init`); run by CD on main |
| `terraform` | `plan` (default), `import` | Legacy target at root `terraform/` for LKE cluster |

---

## CI/CD Integration

### Continuous Integration (`.github/workflows/continuous-integration.yml`)

- **`helm-lint`** and **`compose-config`** run in the **Lint** leg (`nx run infrastructure:helm-lint` and `nx run infrastructure:compose-config`).
- **`plan-terraform`** target runs for PRs changing `infrastructure/terraform/**`, comments plan output on the PR.
- **`build-devcontainer`** runs for PRs changing devcontainer, `.env.default`, CI workflows, or docker-compose.

### Continuous Deployment

- Applies Terraform roots in order: `openrouter` → `github` → `linode` (enforced by workflow).
- Pushes devcontainer image on main.
- Uses GitHub secrets for all sensitive values (Linode token, OpenRouter keys, Terraform backend credentials).

---

## Troubleshooting

| Symptom | Common Causes |
|---------|---------------|
| Job stuck in `Pending` | Image pull failure (GHCR auth), insufficient cluster CPU/memory, unbound PVC |
| PVCs outliving their Job | PVCs are never auto-deleted; remove explicitly with `kubectl delete pvc <name>` |
| `exec format error` | Image built for arm64; rebuild with `--platform linux/amd64` |
| Terraform plan shows changes after state move | Secrets not updated to new bucket credentials; verify all four `TERRAFORM_STATE_*` secrets |

---

## Key Files

- `infrastructure/docker/docker-compose.yml` — Local services definition
- `infrastructure/project.json` — Nx targets for all infrastructure operations
- `infrastructure/helm/kubernetes-job/Chart.yaml` — Helm chart metadata
- `infrastructure/helm/kubernetes-job/values/base.yaml` — Helm chart defaults
- `infrastructure/helm/kubernetes-job/templates/job.yaml` — Job template
- `infrastructure/helm/kubernetes-job/templates/pvc.yaml` — PVC template
- `infrastructure/helm/kubernetes-job/templates/_helpers.tpl` — Helm helpers
- `infrastructure/terraform/main.tf` — LKE cluster definition
- `infrastructure/terraform/variables.tf` — LKE variables
- `infrastructure/terraform/openrouter/main.tf` — OpenRouter resources
- `infrastructure/terraform/github/main.tf` — GitHub resources
- `infrastructure/terraform/linode/main.tf` — Linode Object Storage buckets/keys
- `infrastructure/terraform/linode/outputs.tf` — Outputs for CI/CD secrets
- `documentation/adr/0022-give-every-database-project-its-own-database-schema-and-role.md` — PostgreSQL multi-project ADR
