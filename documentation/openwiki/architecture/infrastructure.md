---
type: concept
title: Infrastructure & Deployment
description: Documents Docker Compose services (Postgres, SearxNG, Open WebUI), the reusable kubernetes-job Helm chart for batch job deployments with PVC storage, and Terraform provisioning for Linode LKE clusters.
tags: [infrastructure, deployment, kubernetes, helm, terraform, docker-compose, linode]
verified:
  - by: openwiki/0.7.0
    at: 2026-10-26T01:23:39.729Z
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
generated: { by: "openwiki/0.7.0", at: "2026-10-26T01:23:39.729Z" }
---

# Infrastructure & Deployment

This page documents the infrastructure tooling that provisions cloud Kubernetes clusters, runs local development services, and deploys batch workloads to Kubernetes.

## Overview

The `infrastructure/` directory contains three independent deployment layers:

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Local services** | Docker Compose | PostgreSQL, SearxNG, Open WebUI for local development |
| **Kubernetes workloads** | Helm (`kubernetes-job`) | Reusable chart for batch Jobs with optional PVC storage |
| **Cluster provisioning** | Terraform | Linode LKE (Linode Kubernetes Engine) cluster |

<!-- openwiki: broken internal link [../workflows/nx-targets.md] file "../workflows/nx-targets.md" does not exist. Fix the href or restore the target, then delete this comment. -->
These layers are orchestrated through [Nx targets](../workflows/nx-targets.md) defined in `infrastructure/project.json`.

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
# 2. Recreate the container (keeps the volume)
nx run infrastructure:postgres:up
# 3. Run the init script for only the missing project(s)
docker exec -e POSTGRES_PROJECTS=<project> postgres sh /docker-entrypoint-initdb.d/databases.sh
```

The script stops at the first object that already exists, so specify only the projects the volume lacks. See [ADR 0022](../../documentation/adr/0022-give-every-database-project-its-own-database-schema-and-role.md) for the full rationale and meanderaw's one exception (its database existed from a prior ADR).

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

## Cluster Provisioning (Terraform)

Terraform at `infrastructure/terraform/` provisions a **Linode LKE (Linode Kubernetes Engine)** cluster.

### Configuration

| File | Purpose |
|------|---------|
| `main.tf` | Cluster resource definition |
| `variables.tf` | Input variables |

**`main.tf`** defines:
- A single-node pool (`g6-standard-1`) with autoscaling (1–3 nodes)
- Kubernetes version 1.34
- Region configurable via variable (default: `us-east`)
- Cluster label `lexico-prod`
- Outputs the kubeconfig (sensitive)

**`variables.tf`** declares:
- `linode_token` (sensitive) — Linode API token
- `linode_region` (default: `us-east`)
- `linode_kubernetes_engine_cluster_id` — for import operations

### Provisioning Workflow

```bash
cd infrastructure/terraform
terraform init
terraform plan -var="linode_token=$LINODE_API_TOKEN"
terraform apply -var="linode_token=$LINODE_API_TOKEN"
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
| `terraform` | `plan` (default), `import` | Run Terraform commands against the cluster |
| `trivy-config` | — | Scan Terraform infrastructure code for misconfigurations using Trivy |
| `helm-lint` | — | Lint the `kubernetes-job` chart against its base values |
| `compose-config` | — | Validate the Docker Compose file |

### CI Integration

- `helm-lint` and `compose-config` run in CI as part of `lint-code` (the Lint leg of `.github/workflows/continuous-integration.yml`)
- `compose-config` creates a missing root `.env` from `.env.default` and never overwrites an existing one
- `trivy-config` runs in the Secure Code workflow when triggered

---

## Related Pages

- [Database Management](../operations/database-management.md) — Per-project database, schema, and role conventions
- [Local Development](../operations/local-development.md) — Running services locally with Nx
- [CI/CD Workflows](../workflows/ci-cd.md) — Continuous integration and deployment pipelines
