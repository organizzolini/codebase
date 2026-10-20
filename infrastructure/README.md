# Infrastructure

**Kubernetes deployment tools and cloud infrastructure configuration for the codebase.**

> For detailed architecture, deployment patterns, Helm chart configuration, and troubleshooting, see [AGENTS.md](AGENTS.md).

## Contents

| Directory                                  | Purpose                                                        |
| ------------------------------------------ | -------------------------------------------------------------- |
| [helm/kubernetes-job](helm/kubernetes-job) | Reusable Helm chart for batch job deployments with PVC storage |
| [terraform/](terraform)                    | Linode LKE (Kubernetes) cluster provisioning                   |

## Quick Start

### Deploy Application with Helm

`values/base.yaml` holds chart defaults, including a placeholder image (`my-application`), so override the image at deploy time.

```bash
helm upgrade --install <release-name> infrastructure/helm/kubernetes-job/ \
  --values infrastructure/helm/kubernetes-job/values/base.yaml \
  --set image.repository=<image> --set image.tag=<tag>

# Monitor the Job
kubectl get jobs -w

# Clean up
helm uninstall <release-name>
```

### Run Local Services

```bash
nx run infrastructure:postgres:up
nx run infrastructure:searxng:up
nx run infrastructure:open-webui:up
```

### Project Databases on an Existing Volume

The Compose `postgres` service creates every database-backed project's
`<project>_username` role, `<project>_development` database, and `<project>`
schema from its `POSTGRES_PROJECTS` list, but only when the volume is empty.
To add a project to a volume that already holds data, add its name to the
list, recreate the container while keeping its volume, and run the same init
script for that project alone:

```bash
nx run infrastructure:postgres:up
docker exec -e POSTGRES_PROJECTS=<project> postgres sh /docker-entrypoint-initdb.d/databases.sh
```

The script stops at the first object that already exists, so name only the
projects the volume lacks. Never use `infrastructure:postgres:recreate` for this:
it deletes the volume and every row in it. See
[ADR 0022](../../documentation/adr/0022-give-every-database-project-its-own-database-schema-and-role.md)
for meanderaw's one exception.

### Provision Kubernetes Cluster

```bash
cd infrastructure/terraform
terraform init
terraform plan -var="linode_token=$LINODE_API_TOKEN"
terraform apply -var="linode_token=$LINODE_API_TOKEN"
```

## Nx Targets

| Target                              | Does                                                                      |
| ----------------------------------- | ------------------------------------------------------------------------- |
| `postgres`                          | `up`, `down`, `recreate` (removes the volume) for the local PostgreSQL    |
| `searxng`                           | `up`, `down`, `open` for the SearxNG metasearch service                   |
| `open-webui`                        | `up`, `down`, `open` for the Open WebUI service                           |
| `terraform`                         | `plan` (default) or `import` against the cluster                          |
| `trivy-config`                      | Trivy misconfiguration scan of the Terraform code                         |
| `helm-lint`                         | Lint the `kubernetes-job` chart against its base values                   |
| `compose-config`                    | Validate the Docker Compose file                                          |

`helm-lint` and `compose-config` also run in CI: `lint-code` depends on both, so the Lint leg of [continuous-integration.yml](../../.github/workflows/continuous-integration.yml) runs them. They need `helm` and `docker compose`; `compose-config` creates a missing root `.env` from `.env.default` and never overwrites an existing one.

## Documentation

- **[AGENTS.md](AGENTS.md)**: Complete infrastructure architecture, Helm chart config, Terraform setup, troubleshooting
- **[caelundas AGENTS.md](../caelundas/caelundas-cli/AGENTS.md)**: Application deployment example
- **[Main AGENTS.md](../../AGENTS.md)**: Codebase architecture and Nx workflows
