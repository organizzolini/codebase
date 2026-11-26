# Infrastructure

**Kubernetes deployment tools and cloud infrastructure configuration for the codebase.**

> For detailed architecture, deployment patterns, Helm chart configuration, and troubleshooting, see [AGENTS.md](AGENTS.md).

## Contents

| Directory                                          | Purpose                                                                                |
| -------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [helm/kubernetes-job](helm/kubernetes-job)         | Reusable Helm chart for batch job deployments with PVC storage                         |
| [terraform/organizzolini](terraform/organizzolini) | One Terraform root: OpenRouter, GitHub, and Linode Object Storage (state and Nx cache) |

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

### Manage Terraform

The `terraform/organizzolini` root manages OpenRouter, GitHub, and Linode Object Storage in one state, `organizzolini.tfstate`, kept in a Linode Object Storage bucket. Export `TF_STATE_BUCKET`, `AWS_ENDPOINT_URL_S3`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `TF_VAR_openrouter_management_key`, `TF_VAR_github_token`, and `TF_VAR_linode_token`, then:

```bash
nx run infrastructure:terraform-format    # fmt -check, part of lint-code
nx run infrastructure:terraform-validate  # no backend or credentials needed, part of lint-code
nx run infrastructure:terraform-plan      # writes plan.tfplan
nx run infrastructure:terraform-apply     # applies; CI does this on main
```

Continuous Integration plans a pull request that changes the root and comments the creates, updates, replaces, and deletes on it. Continuous Deployment applies a push to `main` that changes it. Both read the `TERRAFORM_STATE_BUCKET`, `TERRAFORM_STATE_ENDPOINT`, `TERRAFORM_STATE_ACCESS_KEY_ID`, `TERRAFORM_STATE_SECRET_ACCESS_KEY`, `OPENROUTER_MANAGEMENT_KEY`, `GH_TOKEN`, and `LINODE_TOKEN` repository secrets. The management key also writes the preset, because OpenRouter rejects an inference key for that.

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

For caelundas, the project that most recently joined the list:

```bash
docker exec -e POSTGRES_PROJECTS=caelundas postgres sh /docker-entrypoint-initdb.d/databases.sh
```

The script stops at the first object that already exists, so name only the
projects the volume lacks. Never use `infrastructure:postgres:recreate` for this:
it deletes the volume and every row in it.

## Nx Targets

| Target           | Does                                                                                         |
| ---------------- | -------------------------------------------------------------------------------------------- |
| `postgres`       | `up`, `down`, `recreate` (removes the volume) for the local PostgreSQL                       |
| `searxng`        | `up`, `down`, `open` for the SearxNG metasearch service                                      |
| `open-webui`     | `up`, `down`, `open` for the Open WebUI service                                              |
| `terraform-plan` | Plan the `organizzolini` root (`terraform-init`, `-apply`, `-format`, `-validate` alongside) |
| `trivy-config`   | Trivy misconfiguration scan of the Terraform code                                            |
| `helm-lint`      | Lint the `kubernetes-job` chart against its base values                                      |
| `compose-config` | Validate the Docker Compose file                                                             |

`helm-lint` and `compose-config` also run in CI: `lint-code` depends on both, so the Lint leg of [continuous-integration.yml](../../.github/workflows/continuous-integration.yml) runs them. They need `helm` and `docker compose`; `compose-config` creates a missing root `.env` from `.env.default` and never overwrites an existing one.

## Documentation

- **[AGENTS.md](AGENTS.md)**: Complete infrastructure architecture, Helm chart config, Terraform setup, troubleshooting
- **[caelundas AGENTS.md](../caelundas/caelundas-cli/AGENTS.md)**: Application deployment example
- **[Main AGENTS.md](../../AGENTS.md)**: Codebase architecture and Nx workflows

`github.tf` imports the repository's settings (merge methods, features, secret scanning, Dependabot security updates) and its `main` ruleset, and sets the `OPENWIKI_MODEL_ID` Actions variable to the OpenRouter preset (`@preset/refresh-documentation`) that `openrouter.tf` writes. It needs `TF_VAR_github_token`; CI reads the `GH_TOKEN` repository secret, which needs Administration and Variables write on this repository, because `GITHUB_TOKEN` cannot be granted either. Because the provider cannot express the ruleset's `code_quality` rule or its unattributed-changes approval, `terraform_data.main_ruleset_unsupported_rules` patches both back through the GitHub REST API whenever the ruleset updates. Terraform cannot read the value of the imported "Default key", so `OPENROUTER_API_KEY` stays a hand-set secret.

`linode.tf` manages the Terraform state bucket (`organizzolini-terraform-state`) and its access key, the shared Nx cache bucket and its keys, and imports the original state bucket (`organizzolini`, region `us-iad-2`) and key, refusing to destroy any of them. It needs `TF_VAR_linode_token`; CI reads the `LINODE_TOKEN` repository secret, a Linode API token with Object Storage read and write.
