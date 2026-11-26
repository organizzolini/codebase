# Infrastructure

**Kubernetes deployment tools and cloud infrastructure configuration for the codebase.**

> For detailed architecture, deployment patterns, Helm chart configuration, and troubleshooting, see [AGENTS.md](AGENTS.md).

## Contents

| Directory                                            | Purpose                                                                                  |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| [helm/kubernetes-job](helm/kubernetes-job)           | Reusable Helm chart for batch job deployments with PVC storage                           |
| [helm/postgres](helm/postgres)                       | Shared PostgreSQL on CloudNativePG, with PgBouncer and backups                           |
| [helm/cloudflared](helm/cloudflared)                 | Cloudflare Tunnel connector, routed from Cloudflare                                      |
| [helm/argocd-applications](helm/argocd-applications) | Argo CD app-of-apps tree, synced in waves, plus `batch-low`                              |
| [terraform/organizzolini](terraform/organizzolini)   | The one Terraform root: cluster, Cloudflare, Argo CD, GitHub, OpenRouter, Object Storage |

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

The `terraform/organizzolini` root manages everything Terraform owns here, in one state, `organizzolini.tfstate`, kept in a Linode Object Storage bucket: the LKE cluster and what runs in it, Cloudflare, OpenRouter, the GitHub repository settings, and the Object Storage buckets. Export `TF_STATE_BUCKET`, `AWS_ENDPOINT_URL_S3`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `TF_VAR_openrouter_management_key`, `TF_VAR_github_token`, `TF_VAR_linode_token`, `TF_VAR_cloudflare_api_token`, `TF_VAR_cloudflare_account_id`, and `TF_VAR_cloudflare_zone_id`, then:

```bash
nx run infrastructure:terraform-format    # fmt -check, part of lint-code
nx run infrastructure:terraform-validate  # no backend or credentials needed, part of lint-code
nx run infrastructure:terraform-test      # mock providers, no credentials, part of lint-code
nx run infrastructure:terraform-plan      # writes plan.tfplan
nx run infrastructure:terraform-apply     # applies; CI does this on main
```

Continuous Integration plans a pull request that changes the root and comments the creates, updates, replaces, and deletes on it. Continuous Deployment applies a push to `main` that changes it. Both read the `TERRAFORM_STATE_BUCKET`, `TERRAFORM_STATE_ENDPOINT`, `TERRAFORM_STATE_ACCESS_KEY_ID`, `TERRAFORM_STATE_SECRET_ACCESS_KEY`, `OPENROUTER_MANAGEMENT_KEY`, `GH_TOKEN`, `LINODE_TOKEN`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, and `CLOUDFLARE_ZONE_ID` repository secrets. The management key also writes the preset, because OpenRouter rejects an inference key for that.

### The Cluster in the Organizzolini Root

The `organizzolini` root also holds everything the cluster needs. It creates the `organizzolini` LKE cluster (region `us-iad`, one `g6-standard-2` pool whose autoscaler keeps 1 to 2 nodes) and the Cloudflare tunnel. It imports the existing `organizzolini.net` zone, which it refuses to destroy, and manages no zone settings or other records. The tunnel answers 404 to everything and has no DNS record: no public hostname exists until an application adds its routing rules and a record.

Inside the cluster it holds what must not live in git, or must exist before Argo CD. **It creates the `organizzolini` and `caelundas` namespaces**, because the Argo CD applications do not set `CreateNamespace` for them. It generates the `caelundas_username` role's password and writes it as the `caelundas-postgres` secret in both namespaces, writes `postgres-backups` and `cloudflared-token` into `organizzolini`, installs the pinned `argo-cd` chart in the core profile (no API server, Dex, or notifications; zero ApplicationSet replicas, since the chart has no switch for that controller), and installs the `argocd-apps` chart with one `root` Application that follows `infrastructure/helm/argocd-applications` on `main`. It also publishes the cluster's kubeconfig as the `KUBECONFIG` Actions secret. It uses the `kubernetes_namespace_v1` and `kubernetes_secret_v1` resources, since the unsuffixed ones are deprecated in provider 3.x. Each app's pieces live in one file (`caelundas.tf`), so another app is another file.

In CI the Cloudflare account and zone IDs come from the `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_ZONE_ID` repository secrets, next to `CLOUDFLARE_API_TOKEN`. The optional `TF_VAR_k8s_version` pins the LKE Kubernetes version; unset, the cluster takes the newest available. The readiness wait runs `kubectl`.

**Known caveat**: the kubernetes and helm providers are configured from the cluster resource's kubeconfig in the same root. That suits one cluster and one maintainer, but the provider configuration is unknown at plan time until the cluster exists, so the first plan shows the cluster and its dependents, and replacing or destroying the cluster requires removing the Kubernetes and Helm resources from state, or destroying them first, since Terraform cannot configure the providers for a cluster that is going away.

The Cloudflare token needs these permissions, and nothing else:

- Account → Cloudflare Tunnel → Edit
- Zone → Zone → Read, on `organizzolini.net` only
- Zone → DNS → Edit, on `organizzolini.net` only

The readiness wait writes the kubeconfig to a temporary file and needs `kubectl` on the runner. Its `kubeconfig` output and the tunnel token are sensitive.

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

| Target            | Does                                                                   |
| ----------------- | ---------------------------------------------------------------------- |
| `postgres`        | `up`, `down`, `recreate` (removes the volume) for the local PostgreSQL |
| `searxng`         | `up`, `down`, `open` for the SearxNG metasearch service                |
| `open-webui`      | `up`, `down`, `open` for the Open WebUI service                        |
| `terraform-init`  | Initialize the `organizzolini` root against its Object Storage backend |
| `terraform-plan`  | Plan the `organizzolini` root and write `plan.tfplan`                  |
| `terraform-apply` | Apply the `organizzolini` root                                         |
| `terraform-test`  | Run the Terraform unit tests of the `organizzolini` root               |
| `tflint`          | Lint the `organizzolini` root with tflint's terraform ruleset          |
| `trivy-config`    | Trivy misconfiguration scan of the Terraform code and rendered charts  |
| `helm-lint`       | `helm lint --strict` every Helm release, with its Argo CD values files |
| `helm-render`     | Render every release to `dist/infrastructure/helm-render/`             |
| `kubeconform`     | Validate the rendered manifests against Kubernetes and CRD schemas     |
| `kube-linter`     | Lint the rendered manifests for hardening and resource settings        |
| `pluto`           | Flag deprecated or removed Kubernetes APIs in the rendered manifests   |
| `helm-test`       | Run the helm-unittest suites under every chart with a `tests/` folder  |
| `compose-config`  | Validate the Docker Compose file                                       |

`helm-lint`, `helm-test`, `kubeconform`, `kube-linter`, `pluto`, `tflint`, `terraform-test`, and `compose-config` also run in CI: `lint-code` depends on them, so the Lint leg of [continuous-integration.yml](../../.github/workflows/continuous-integration.yml) runs them. The workflow linters `actionlint` and `zizmor` belong to the configuration project and run in the same leg. The linters come from the `installation` project's `software` command (kubeconform, kube-linter, and pluto through its `infrastructure` group, actionlint through `configuration`, each built with `go install` from a pinned tag), setup-tflint, and the uv lockfile (zizmor), through the `infrastructure` and `configuration` inputs of the setup-codebase action and the devcontainer. They need `helm` and `docker compose` (`helm-test` installs the pinned helm-unittest plugin on first run); `compose-config` creates a missing root `.env` from `.env.default` and never overwrites an existing one.

## Documentation

- **[AGENTS.md](AGENTS.md)**: Complete infrastructure architecture, Helm chart config, Terraform setup, troubleshooting
- **[caelundas AGENTS.md](../caelundas/caelundas-cli/AGENTS.md)**: Application deployment example
- **[Main AGENTS.md](../../AGENTS.md)**: Codebase architecture and Nx workflows

`github.tf` imports the repository's settings (merge methods, features, secret scanning, Dependabot security updates) and its `main` ruleset, and sets the `OPENWIKI_MODEL_ID` Actions variable to the OpenRouter preset (`@preset/refresh-documentation`) that `openrouter.tf` writes. It needs `TF_VAR_github_token`; CI reads the `GH_TOKEN` repository secret, which needs Administration and Variables write on this repository, because `GITHUB_TOKEN` cannot be granted either. Because the provider cannot express the ruleset's `code_quality` rule or its unattributed-changes approval, `terraform_data.main_ruleset_unsupported_rules` patches both back through the GitHub REST API whenever the ruleset updates. Terraform cannot read the value of the imported "Default key", so `OPENROUTER_API_KEY` stays a hand-set secret.

`linode.tf` manages the Terraform state bucket (`organizzolini-terraform-state`) and its access key, the shared Nx cache bucket and its keys, and imports the original state bucket (`organizzolini`, region `us-iad-2`) and key, refusing to destroy any of them. It also creates the Postgres backups bucket (`organizzolini-postgres-backups`, region `us-iad-2`, private) and a key that reads and writes only that bucket, which CloudNativePG archives to; the bucket has no lifecycle rule, since Barman's retention deletes old backups, and it refuses to destroy. It needs `TF_VAR_linode_token`; CI reads the `LINODE_TOKEN` repository secret, a Linode API token with Object Storage read and write.
