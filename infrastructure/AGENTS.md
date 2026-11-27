# Infrastructure: Kubernetes & Cloud Deployment

## Quick Start

**Purpose**: Helm charts and Terraform for Kubernetes infrastructure

### Helm (Batch Jobs)

```bash
helm upgrade --install <release-name> infrastructure/helm/kubernetes-job/ \
  --values infrastructure/helm/kubernetes-job/values/base.yaml
```

### Terraform

```bash
cd infrastructure/terraform
terraform init
terraform plan
terraform apply
```

## Architecture Overview

### Directory Structure

```text
infrastructure/
├── helm/
│   ├── argocd/ # Argo CD app-of-apps tree and the batch-low PriorityClass
│   ├── cloudflared/         # Cloudflare Tunnel connector, routing held in Cloudflare
│   ├── kubernetes-job/      # Reusable chart for K8s Jobs
│   └── postgres/            # Shared PostgreSQL as CloudNativePG resources
└── terraform/               # Cluster provisioning
    ├── github/              # Repository settings, ruleset, Actions variables
    ├── linode/              # Object Storage buckets: the state, the shared Nx cache, and Postgres backups
    ├── openrouter/          # OpenRouter workspace, key, guardrail, preset
    └── organizzolini/       # LKE cluster, Cloudflare tunnel, namespaces, secrets, Argo CD, KUBECONFIG secret
```

### kubernetes-job Chart

**Purpose**: Deploy batch jobs with optional PVC storage.

**Use cases**:

- Data migrations
- Report generation

Use a Job for work that runs to completion and leaves output behind (caelundas writes iCalendar files to a PVC); use a Deployment for anything that serves requests continuously.

**Chart tests**: `tests/*_test.yaml` holds helm-unittest suites, run by `nx run infrastructure:helm-test` over every chart that has a `tests/` folder.

**Organizzolini root**: what `terraform/organizzolini` holds and how to run it are in the [README](README.md#manage-the-organizzolini-root-with-terraform), and Key Files below maps each file. Its conventions:

- Each app's Terraform lives in one file like `caelundas.tf`, so another app is another file. The apps do not set `CreateNamespace`, so that file creates the app's namespace.
- The kubernetes and helm providers are configured from the cluster resource's own kubeconfig, so every Kubernetes and Helm resource that calls the cluster depends on `terraform_data.cluster_ready`. The known caveats are in the README.
- `state_bucket` locates the `linode` state read for the backups key, through `try`, so a pull request plans before that output exists.
- The `argo-cd` chart has no ApplicationSet switch, so `argocd-values.yaml` sets `applicationSet.replicas: 0`.
- Namespaces and secrets use `kubernetes_namespace_v1` and `kubernetes_secret_v1`, since the unsuffixed ones are deprecated in provider 3.x.
- New cloud-visible resources carry the `organizzolini_codebase_` address prefix and the `organizzolini-codebase-` label prefix.

**Terraform tests**: `tests/` holds the `terraform test` suites written in HCL, which run against `mock_provider` blocks, so they need no credentials. `nx run infrastructure:terraform-validate` initializes each root with `-backend=false`, validates it, and runs its tests when it has a `tests/` folder.

### cloudflared Chart

**Purpose**: Run the remotely managed Cloudflare Tunnel connector in the `organizzolini` namespace. The connector dials out, so the chart has no Service and no ingress rules: routing lives in Cloudflare.

- The token comes from the `cloudflared-token` Secret (key `token`) through `TUNNEL_TOKEN`. The `organizzolini` Terraform root creates that Secret.
- `image.tag` is pinned to an exact release, never `latest`. Bump it deliberately.
- `metricsPort` (2000) serves `/healthcheck` (the process is up) for liveness and `/ready` (a connection to Cloudflare's edge is registered) for readiness. It binds `0.0.0.0` so the kubelet can reach it.
- Pods run as uid 65532 with a read-only root filesystem, no privilege escalation, all capabilities dropped, and the `RuntimeDefault` seccomp profile.

`tests/cloudflared_test.yaml` asserts on rendered YAML only, so it needs no cluster or tunnel.

### postgres Chart

**Purpose**: The shared PostgreSQL cluster in the `organizzolini` namespace, as CloudNativePG resources: a `Cluster` (`postgres`, PostgreSQL 18 pinned to an exact minor), a managed role and `Database` per project database, a `Pooler` (`postgres-pooler-rw`, PgBouncer in transaction mode), and Barman Cloud backups (`ObjectStore` `postgres-backups` with 30-day retention, and a daily `ScheduledBackup` at 03:00 UTC).

- `projects` lists each project with its `databases`. Each project gets role `<name>_username` (password from the `<name>-postgres` Secret) and each database a `Database` resource whose PostgreSQL name is `<name>_<database>`, owned by that role, with schema `<name>`. Adding a project is adding a list entry, as with `POSTGRES_PROJECTS` in the local Compose file.
- The direct service is `postgres-rw`; the app and jobs address the pooler, `postgres-pooler-rw`.
- The volume uses the `linode-block-storage-retain` storage class, so deleting the `Cluster` keeps its data.
- The chart needs the CloudNativePG operator and the Barman Cloud plugin CRDs, and the `postgres-backups` and `<name>-postgres` Secrets from the `organizzolini` Terraform root.

`tests/postgres_test.yaml` asserts on rendered YAML only, since the CRDs are not installed locally.

### postgres Runbooks

**Connect to the database**: forward the direct service and read the password from the `caelundas-postgres` Secret:

```bash
kubectl port-forward -n organizzolini svc/postgres-rw 5433:5432
```

**Copy local data up**: dump the local schema, then restore it into a cluster database as the project role:

```bash
pg_dump --schema caelundas --format custom --dbname caelundas_development > caelundas.dump
pg_restore --no-owner --role caelundas_username --dbname caelundas_production caelundas.dump
```

Use `caelundas_staging` in place of `caelundas_production` for staging. The same pair copies staging to production until the merge spec lands.

**Rehearse a restore**: bootstrap a throwaway `Cluster` from `postgres-backups` with a `recoveryTarget`, check the row counts against the live cluster, then delete it. Never restore over `postgres`.

### argocd Chart

**Purpose**: The Argo CD app-of-apps tree (this repository's `helm/argocd` chart, not the upstream `argo-cd` chart that Terraform installs as the `argocd` release). Each `applications` entry renders one `Application` in the `argocd` namespace, ordered by `argocd.argoproj.io/sync-wave` (0 cert-manager, 1 cloudnative-pg, 2 plugin-barman-cloud, 3 postgres, 4 cloudflared). The chart also renders the `batch-low` PriorityClass (value -10, `preemptionPolicy: Never`, not global), which batch Jobs use.

- Upstream entries (`chart`) pin an exact `version`, never a range. `cert-manager` installs its CRDs through a Helm parameter and uses `ServerSideApply=true`; the two operator namespaces set `CreateNamespace=true`.
- Repository entries (`path`) take `valueFiles` relative to the chart path. `organizzolini` and `caelundas` come from Terraform, so their apps do not set `CreateNamespace`.
- Every Application auto-syncs with `prune` and `selfHeal`, retries with backoff, and sets `SkipDryRunOnMissingResource=true`.
- The root `Application` created by the `organizzolini` Terraform root points at this chart's path.

`tests/applications_test.yaml` asserts on rendered YAML: the wave order, exact upstream pins, automated sync, dry-run skipping, and the PriorityClass.

**Read drift** between the repository and the cluster:

```bash
kubectl get applications -n argocd            # Sync and Health per app
argocd app diff --core <name>                 # the live-versus-desired diff, read from the cluster without an Argo CD server
```

## Helm Chart References

- Chart metadata: [helm/kubernetes-job/Chart.yaml](helm/kubernetes-job/Chart.yaml)
- Base values: [helm/kubernetes-job/values/base.yaml](helm/kubernetes-job/values/base.yaml)
- Templates: [helm/kubernetes-job/templates/](helm/kubernetes-job/templates/)
- Chart metadata: [helm/cloudflared/Chart.yaml](helm/cloudflared/Chart.yaml)
- Base values: [helm/cloudflared/values/base.yaml](helm/cloudflared/values/base.yaml)
- Templates: [helm/cloudflared/templates/](helm/cloudflared/templates/)
- Chart metadata: [helm/postgres/Chart.yaml](helm/postgres/Chart.yaml)
- Base values: [helm/postgres/values/base.yaml](helm/postgres/values/base.yaml)
- Templates: [helm/postgres/templates/](helm/postgres/templates/)
- Chart metadata: [helm/argocd/Chart.yaml](helm/argocd/Chart.yaml)
- Base values: [helm/argocd/values/base.yaml](helm/argocd/values/base.yaml)
- Templates: [helm/argocd/templates/](helm/argocd/templates/)

## Kubernetes Deployment

See [README.md](README.md) for the Helm deploy commands and the `nx run infrastructure:*` targets. `helm-test`, `terraform-validate` (validate and test), and `compose-config` of this project run in CI as part of `lint-code`, as do `deployment:helm-lint` and the linters of the `integration` project (`kubeconform`, `kube-linter`, `pluto`, `tflint`), in the Lint leg of [continuous-integration.yml](../../.github/workflows/continuous-integration.yml).

## Linters

The `helm-lint` and `helm-render` commands, and targets, of the `deployment` project discover the Helm releases, so none is listed anywhere: every folder under `helm/` holding a `Chart.yaml` installs as `<chart>` with `values/base.yaml`, and once more as `<chart>-<name>` for each other `values/<name>.yaml` layered over it. The namespace comes from the Argo CD Application in `helm/argocd/values/base.yaml` whose `path` and `valueFiles` match the release, else `default`; an empty `image.tag` in the values is filled with a placeholder so the chart renders. A chart whose release the files cannot describe adds an optional `release.yaml` beside `Chart.yaml` with `namespace` and `strings` (extra `--set-string` pairs), as `argocd` does for its namespace. `deployment:helm-lint` runs `helm lint --strict` over the releases, and `deployment:helm-render` templates them into `dist/deployment/helm-render/`, which `integration:kubeconform`, `integration:kube-linter`, `integration:pluto`, and `infrastructure:trivy-config` read. The four linters are defined in `nx.json` and applied to the `integration` project by its `name:integration` tag; they read this project's charts and Terraform through their inputs. Add a chart or values file and the next run picks it up; edit no code.

- **kubeconform**: strict schemas for Kubernetes 1.35.0 plus the datreeio CRDs catalog for Argo CD, CloudNativePG, Barman Cloud, and cert-manager. A kind with no schema fails, so nothing is skipped. It reads schemas from raw.githubusercontent.com.
- **kube-linter**: runs its default checks, which include the hardening ones, with no config and no exclusions. Fix the chart, not the check.
- **pluto**: a removed API fails, a deprecated one prints and passes.
- **trivy-config**: also scans the rendered manifests at CRITICAL and HIGH. Fix the chart; never add a trivyignore entry.
- **tflint**: `terraform/.tflint.hcl` enables the bundled terraform ruleset (`preset = "all"`). The `github` root's `outputs.tf` holds only a comment, since `terraform_standard_module_structure` wants every root to declare where its outputs go.
- **actionlint** and **zizmor** (configuration project): `.github/actionlint.yaml` and `.github/zizmor.yml` record every ignored message and changed rule with its reason.

A failure prints the tool's own message with the file and line; the rendered file name is the release, so open `dist/deployment/helm-render/<release>.yaml` to see what was linted.

## Moving the Terraform State Bucket

The state moves from the original `organizzolini` bucket to
`organizzolini-codebase-terraform-state`. Linode cannot rename a bucket, so the
`linode` root creates the new bucket and its key beside the old ones, and a
person moves the state across. Every step before step 5 leaves the old bucket
serving all three roots, so the move can stop at any point.

1. **Create**: merge the change that adds the bucket. The Continuous Deployment `Infrastructure` job applies the `linode` root.
2. **Read the new credentials**: initialize the `linode` root against the old bucket, then read the outputs without printing them:

   ```bash
   cd infrastructure/terraform/linode
   terraform output -raw terraform_state_access_key
   terraform output -raw terraform_state_secret_key
   ```

3. **Copy**: with the old key as one AWS CLI profile and the new key as another, sync every object, then compare object counts and ETags:

   ```bash
   aws s3 sync s3://organizzolini s3://organizzolini-codebase-terraform-state \
     --endpoint-url https://us-iad-18.linodeobjects.com
   ```

   The `sync` needs one profile that can read the old bucket and write the new one, so copy through a local directory when the two keys differ.

4. **Check the copy**: `aws s3 ls --recursive` on both buckets lists the same `*.tfstate` keys, and the new `linode.tfstate` matches the old one byte for byte.
5. **Switch**: set `TERRAFORM_STATE_BUCKET`, `TERRAFORM_STATE_ENDPOINT`, `TERRAFORM_STATE_ACCESS_KEY_ID`, and `TERRAFORM_STATE_SECRET_ACCESS_KEY` to the new values with `gh secret set`, reading each from the `terraform output` of step 2.
6. **Prove it**: run `nx run infrastructure:terraform-init:<root>` and `terraform plan` for each of `openrouter`, `github`, and `linode` with the new values. Each plan must show no changes, since the state is the same state. Roll back by restoring the four secrets to the old values.
7. **Retire the old bucket** only after a week of clean runs: `terraform state rm` the `state` bucket and key in the `linode` root, delete their resources and `bucket_label`, then delete the old bucket and key in Linode by hand. Both resources set `prevent_destroy` so that Terraform cannot do this itself.

## Troubleshooting

- **Job stuck in `Pending`** — inspect with `kubectl describe job <name>`, then the pod and PVC. Usual causes are an image pull failure against GHCR, insufficient cluster CPU/memory, or an unbound PVC.
- **PVCs outliving their Job** — PVCs are never deleted automatically when a Job or pod goes away. Remove them explicitly (`kubectl delete pvc <name>`) once you have what you need from it.
- **`exec format error`** — the image was built for arm64. Rebuild with `--platform linux/amd64`.

## Key Files

- [helm/kubernetes-job/templates/job.yaml](helm/kubernetes-job/templates/job.yaml): Job template
- [helm/kubernetes-job/templates/pvc.yaml](helm/kubernetes-job/templates/pvc.yaml): PVC template
- [helm/kubernetes-job/templates/\_helpers.tpl](helm/kubernetes-job/templates/_helpers.tpl): Helpers
- [terraform/organizzolini/main.tf](terraform/organizzolini/main.tf): Backend, remote state, and the provider wiring from the cluster's kubeconfig
- [terraform/organizzolini/cluster.tf](terraform/organizzolini/cluster.tf): LKE cluster and its readiness wait
- [terraform/organizzolini/cloudflare.tf](terraform/organizzolini/cloudflare.tf): Zone import and tunnel
- [terraform/organizzolini/argocd.tf](terraform/organizzolini/argocd.tf): Argo CD core and the root Application
- [terraform/organizzolini/secrets.tf](terraform/organizzolini/secrets.tf): Platform secrets
- [terraform/organizzolini/caelundas.tf](terraform/organizzolini/caelundas.tf): Caelundas namespace, database password, and secrets
- [terraform/openrouter/main.tf](terraform/openrouter/main.tf): OpenRouter resources and the S3-compatible state backend
