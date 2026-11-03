# Infrastructure

**Kubernetes deployment tools and cloud infrastructure configuration for the codebase.**

> For detailed architecture, deployment patterns, Helm chart configuration, and troubleshooting, see [AGENTS.md](AGENTS.md).

## Contents

| Directory                                    | Purpose                                                           |
| -------------------------------------------- | ----------------------------------------------------------------- |
| [helm/kubernetes-job](helm/kubernetes-job)   | Reusable Helm chart for batch job deployments with PVC storage    |
| [terraform/](terraform)                      | Linode LKE (Kubernetes) cluster provisioning                      |
| [terraform/openrouter](terraform/openrouter) | OpenRouter workspace, API key, guardrail, and ranked-model preset |
| [terraform/github](terraform/github)         | GitHub repository settings, `main` ruleset, and Actions variables |
| [terraform/linode](terraform/linode)         | The Object Storage bucket that holds Terraform state              |

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

### Manage OpenRouter with Terraform

The `terraform/openrouter` root keeps its state in a Linode Object Storage bucket. Export `TF_STATE_BUCKET`, `AWS_ENDPOINT_URL_S3`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `TF_VAR_openrouter_management_key`, and `TF_VAR_openrouter_api_key`, then:

```bash
nx run infrastructure:terraform-format    # fmt -check, part of lint-code
nx run infrastructure:terraform-validate  # no backend or credentials needed, part of lint-code
nx run infrastructure:terraform-plan:openrouter      # writes plan.tfplan; use :github for the GitHub root
nx run infrastructure:terraform-apply:openrouter     # applies; CI does this on main, openrouter then github
```

Continuous Integration plans a pull request that changes the root and comments the creates, updates, replaces, and deletes on it. Continuous Deployment applies a push to `main` that changes it. Both read the `TERRAFORM_STATE_BUCKET`, `TERRAFORM_STATE_ENDPOINT`, `TERRAFORM_STATE_ACCESS_KEY_ID`, `TERRAFORM_STATE_SECRET_ACCESS_KEY`, `OPENROUTER_MANAGEMENT_KEY`, and `OPENROUTER_API_KEY` repository secrets. The last is the existing key the Terraform imports, whose value it writes the preset with.

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

| Target           | Does                                                                   |
| ---------------- | ---------------------------------------------------------------------- |
| `postgres`       | `up`, `down`, `recreate` (removes the volume) for the local PostgreSQL |
| `searxng`        | `up`, `down`, `open` for the SearxNG metasearch service                |
| `open-webui`     | `up`, `down`, `open` for the Open WebUI service                        |
| `terraform`      | `plan` (default) or `import` against the cluster                       |
| `trivy-config`   | Trivy misconfiguration scan of the Terraform code                      |
| `helm-lint`      | Lint the `kubernetes-job` chart against its base values                |
| `compose-config` | Validate the Docker Compose file                                       |

`helm-lint` and `compose-config` also run in CI: `lint-code` depends on both, so the Lint leg of [continuous-integration.yml](../../.github/workflows/continuous-integration.yml) runs them. They need `helm` and `docker compose`; `compose-config` creates a missing root `.env` from `.env.default` and never overwrites an existing one.

## Documentation

- **[AGENTS.md](AGENTS.md)**: Complete infrastructure architecture, Helm chart config, Terraform setup, troubleshooting
- **[caelundas AGENTS.md](../caelundas/caelundas-cli/AGENTS.md)**: Application deployment example
- **[Main AGENTS.md](../../AGENTS.md)**: Codebase architecture and Nx workflows

The `terraform/github` root imports the repository's settings (merge methods, features, secret scanning, Dependabot security updates) and its `main` ruleset, and sets the `OPENWIKI_MODEL_ID` Actions variable to the OpenRouter preset (`@preset/refresh-documentation`) by reading the openrouter root's state. It needs `TF_VAR_state_bucket` and `TF_VAR_github_token`; CI reads the `GH_TOKEN` repository secret, which needs Administration and Variables write on this repository, because `GITHUB_TOKEN` cannot be granted either. Because the provider cannot express the ruleset's `code_quality` rule or its unattributed-changes approval, `terraform_data.main_ruleset_unsupported_rules` patches both back through the GitHub REST API whenever the ruleset updates. Terraform cannot read the value of the imported "Default key", so `OPENROUTER_API_KEY` stays a hand-set secret.

The `terraform/linode` root imports the state bucket (`organizzolini`, region `us-iad-2`) and its access key and refuses to destroy it. It needs `TF_VAR_linode_token`; CI reads the `LINODE_TOKEN` repository secret, a Linode API token with Object Storage read and write.
