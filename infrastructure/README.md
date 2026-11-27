# Infrastructure

**Kubernetes deployment tools and cloud infrastructure configuration for the codebase.**

> For detailed architecture, deployment patterns, Helm chart configuration, and troubleshooting, see [AGENTS.md](AGENTS.md).

## Contents

| Directory                                                | Purpose                                                           |
| -------------------------------------------------------- | ----------------------------------------------------------------- |
| [helm/kubernetes-job](helm/kubernetes-job)               | Helm chart for one-shot Jobs, such as the caelundas-cli ingestion |
| [helm/kubernetes-deployment](helm/kubernetes-deployment) | Reusable Helm chart for long-running services                     |
| [helm/postgres](helm/postgres)                           | Shared PostgreSQL on CloudNativePG, with PgBouncer and backups    |
| [helm/cloudflared](helm/cloudflared)                     | Cloudflare Tunnel connector, routed from Cloudflare               |
| [helm/argocd-applications](helm/argocd-applications)     | Argo CD app-of-apps tree, synced in waves, plus `batch-low`       |
| [terraform/](terraform)                                  | Linode LKE (Kubernetes) cluster provisioning                      |
| [terraform/openrouter](terraform/openrouter)             | OpenRouter workspace, API key, guardrail, and ranked-model preset |
| [terraform/github](terraform/github)                     | GitHub repository settings, `main` ruleset, and Actions variables |
| [terraform/linode](terraform/linode)                     | The Object Storage bucket that holds Terraform state              |
| [terraform/organizzolini](terraform/organizzolini)       | LKE cluster, Cloudflare tunnel, namespaces, secrets, and Argo CD  |

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

The `terraform/openrouter` root keeps its state in a Linode Object Storage bucket. Export `TF_STATE_BUCKET`, `AWS_ENDPOINT_URL_S3`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `TF_VAR_openrouter_management_key`, then:

```bash
nx run infrastructure:terraform-format    # fmt -check, part of lint-code
nx run infrastructure:terraform-validate  # validate and unit-test every root, no backend or credentials needed, part of lint-code
nx run infrastructure:terraform-plan:openrouter      # writes plan.tfplan; use :github for the GitHub root
nx run infrastructure:terraform-apply:openrouter     # applies; CI does this on main, openrouter then github
```

Continuous Integration plans a pull request that changes the root and comments the creates, updates, replaces, and deletes on it. Continuous Deployment applies a push to `main` that changes it. Both read the `TERRAFORM_STATE_BUCKET`, `TERRAFORM_STATE_ENDPOINT`, `TERRAFORM_STATE_ACCESS_KEY_ID`, `TERRAFORM_STATE_SECRET_ACCESS_KEY`, and `OPENROUTER_MANAGEMENT_KEY` repository secrets. The management key also writes the preset, because OpenRouter rejects an inference key for that.

### Manage the Organizzolini Root with Terraform

The `terraform/organizzolini` root holds everything the cluster needs, in one state. It creates the `organizzolini` LKE cluster (region `us-iad`, one `g6-standard-2` pool whose autoscaler keeps 1 to 2 nodes) and everything Cloudflare does for the public host `caelundas.organizzolini.net`. It imports the existing `organizzolini.net` zone, which it refuses to destroy, and manages no zone settings or other records. Its tunnel routes `/graphql` to `caelundas-api:80` (the Service port, which targets the API's development port) and everything else to `caelundas-web:80`, and a proxied CNAME points the host at the tunnel.

Inside the cluster it holds what must not live in git, or must exist before Argo CD. **It creates the `organizzolini` and `caelundas` namespaces**, because the Argo CD applications do not set `CreateNamespace` for them. It generates the `caelundas_username` role's password and writes it as the `caelundas-postgres` secret in both namespaces, writes `postgres-backups` and `cloudflared-token` into `organizzolini`, installs the pinned `argo-cd` chart in the core profile (no API server, Dex, or notifications; zero ApplicationSet replicas, since the chart has no switch for that controller), and installs the `argocd-apps` chart with one `root` Application that follows `infrastructure/helm/argocd-applications` on `main`. It also publishes the cluster's kubeconfig as the `KUBECONFIG` Actions secret. It reads only the `linode` root's state, for the backups key, through `try`, so a pull request plans before that output exists.

It needs `TF_VAR_linode_token`, `TF_VAR_cloudflare_api_token`, `TF_VAR_cloudflare_account_id`, `TF_VAR_cloudflare_zone_id`, `TF_VAR_state_bucket`, and `TF_VAR_github_token`. In CI the Cloudflare account and zone IDs come from the `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_ZONE_ID` repository secrets, next to `CLOUDFLARE_API_TOKEN`. The optional `TF_VAR_k8s_version` pins the LKE Kubernetes version; unset, the cluster takes the newest available. The readiness wait runs `kubectl`, which must be on `PATH`.

**Known caveat**: the kubernetes and helm providers are configured from the cluster resource's kubeconfig in the same root. That suits one cluster and one maintainer, but the provider configuration is unknown at plan time until the cluster exists, so the first plan shows the cluster and its dependents, and replacing or destroying the cluster requires removing the Kubernetes and Helm resources from state, or destroying them first, since Terraform cannot configure the providers for a cluster that is going away.

The Cloudflare token needs these permissions, and nothing else:

- Account → Cloudflare Tunnel → Edit
- Zone → Zone → Read, on `organizzolini.net` only
- Zone → DNS → Edit, on `organizzolini.net` only

**Reaching the cluster**: the root has one output, the sensitive `kubeconfig`. The `KUBECONFIG` Actions secret is write-only and serves the workflows, so an operator reads the output from state with the backend variables CI uses (`TF_STATE_BUCKET`, `AWS_ENDPOINT_URL_S3`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`):

```bash
nx run infrastructure:terraform-init:organizzolini
(cd infrastructure/terraform/organizzolini && umask 077 && terraform output -raw kubeconfig > ~/.kube/organizzolini.yaml)
export KUBECONFIG=~/.kube/organizzolini.yaml
kubectl get applications -n argocd   # every Application Synced and Healthy
```

### Merging the Stack

The application pull request (#2609) is stacked on the platform one (#2611), and the repository squash-merges, so merge in this order:

1. Merge the platform pull request. Confirm the Continuous Deployment `Infrastructure` leg applied, then that every Argo CD `Application` is `Synced` and `Healthy` (the command above).
2. Change the application pull request's base to `main`. GitHub does it when the platform branch is deleted on merge. Merge `main` into it: that is clean while the platform branch's last head is an ancestor of the application branch's head.
3. Merge the application pull request, then make its three GHCR packages public.

Owner prerequisites, all in one place:

- **Actions secrets**: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, and `CLOUDFLARE_ZONE_ID` (secrets, not variables).
- **`LINODE_TOKEN`**: Object Storage and Kubernetes read and write.
- **`GH_TOKEN`**: able to write Actions secrets.
- **GHCR visibility**: after the application pull request's first push, set `caelundas-api`, `caelundas-web`, and `caelundas-cli` to public in the package settings. No API does it, and until it is done the pods stay in `ImagePullBackOff` while Continuous Deployment reports success.

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

### Provision Kubernetes Cluster

```bash
cd infrastructure/terraform
terraform init
terraform plan -var="linode_token=$LINODE_API_TOKEN"
terraform apply -var="linode_token=$LINODE_API_TOKEN"
```

## Nx Targets

| Target               | Does                                                                   |
| -------------------- | ---------------------------------------------------------------------- |
| `postgres`           | `up`, `down`, `recreate` (removes the volume) for the local PostgreSQL |
| `searxng`            | `up`, `down`, `open` for the SearxNG metasearch service                |
| `open-webui`         | `up`, `down`, `open` for the Open WebUI service                        |
| `terraform`          | `plan` (default) or `import` against the cluster                       |
| `trivy-config`       | Trivy misconfiguration scan of the Terraform code and rendered charts  |
| `helm-lint`          | `helm lint --strict` every Helm release, with its Argo CD values files |
| `helm-render`        | Render every release to `dist/infrastructure/helm-render/`             |
| `kubeconform`        | Validate the rendered manifests against Kubernetes and CRD schemas     |
| `kube-linter`        | Lint the rendered manifests for hardening and resource settings        |
| `pluto`              | Flag deprecated or removed Kubernetes APIs in the rendered manifests   |
| `tflint`             | Lint each Terraform root with tflint's terraform ruleset               |
| `hadolint`           | Lint every Dockerfile                                                  |
| `helm-test`          | Run the helm-unittest suites under every chart with a `tests/` folder  |
| `terraform-validate` | Validate each Terraform root, then run its unit tests                  |
| `compose-config`     | Validate the Docker Compose files                                      |

`helm-lint`, `helm-test`, `kubeconform`, `kube-linter`, `pluto`, `tflint`, `hadolint`, `terraform-validate`, and `compose-config` also run in CI: `lint-code` depends on them, so the Lint leg of [continuous-integration.yml](../../.github/workflows/continuous-integration.yml) runs them. The workflow linters `actionlint` and `zizmor` belong to the configuration project and run in the same leg. The linters come from the `installation` project's `software` command (kubeconform, kube-linter, pluto, and hadolint through its `infrastructure` group, actionlint through `configuration`, the Go ones built with `go install` from a pinned tag, hadolint from its pinned release), setup-tflint, and the uv lockfile (zizmor), through the `infrastructure` and `configuration` inputs of the setup-codebase action and the devcontainer. They need `helm` and `docker compose` (`helm-test` installs the pinned helm-unittest plugin on first run); `compose-config` creates a missing root `.env` from `.env.default` and never overwrites an existing one.

## Documentation

- **[AGENTS.md](AGENTS.md)**: Complete infrastructure architecture, Helm chart config, Terraform setup, troubleshooting
- **[caelundas AGENTS.md](../caelundas/caelundas-cli/AGENTS.md)**: Application deployment example
- **[Main AGENTS.md](../../AGENTS.md)**: Codebase architecture and Nx workflows

The `terraform/github` root imports the repository's settings (merge methods, features, secret scanning, Dependabot security updates) and its `main` ruleset, and sets the `OPENWIKI_MODEL_ID` Actions variable to the OpenRouter preset (`@preset/refresh-documentation`) by reading the openrouter root's state. It needs `TF_VAR_state_bucket` and `TF_VAR_github_token`. CI reads the `GH_TOKEN` repository secret, which needs Administration, Variables and Secrets write on this repository, because `GITHUB_TOKEN` cannot be granted any of them. Because the provider cannot express the ruleset's `code_quality` rule or its unattributed-changes approval, `terraform_data.main_ruleset_unsupported_rules` patches both back through the GitHub REST API whenever the ruleset updates. Terraform cannot read the value of the imported "Default key", so `OPENROUTER_API_KEY` stays a hand-set secret.

The `terraform/linode` root imports the state bucket (`organizzolini`, region `us-iad-2`) and its access key and refuses to destroy it. It also creates the Postgres backups bucket (`organizzolini-postgres-backups`, region `us-iad-2`, private) and a key that reads and writes only that bucket, which CloudNativePG archives to; the bucket has no lifecycle rule, since Barman's retention deletes old backups, and it refuses to destroy. It needs `TF_VAR_linode_token`; CI reads the `LINODE_TOKEN` repository secret, a Linode API token with Object Storage read and write.
