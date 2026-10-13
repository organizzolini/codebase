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

```bash
helm upgrade --install <release-name> projects/infrastructure/helm/kubernetes-job/ \
  --values projects/infrastructure/helm/kubernetes-job/values/base.yaml

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

### Provision Kubernetes Cluster

```bash
cd projects/infrastructure/terraform
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

## Documentation

- **[AGENTS.md](AGENTS.md)**: Complete infrastructure architecture, Helm chart config, Terraform setup, troubleshooting
- **[caelundas AGENTS.md](../caelundas/caelundas-cli/AGENTS.md)**: Application deployment example
- **[Main AGENTS.md](../../AGENTS.md)**: Codebase architecture and Nx workflows
