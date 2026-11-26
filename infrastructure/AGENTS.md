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
nx run infrastructure:terraform-init
nx run infrastructure:terraform-plan
nx run infrastructure:terraform-apply
```

## Architecture Overview

### Directory Structure

```text
infrastructure/
├── helm/
│   ├── argocd-applications/ # Argo CD app-of-apps tree and the batch-low PriorityClass
│   ├── cloudflared/         # Cloudflare Tunnel connector, routing held in Cloudflare
│   ├── kubernetes-job/      # Reusable chart for K8s Jobs
│   └── postgres/            # Shared PostgreSQL as CloudNativePG resources
└── terraform/
    └── organizzolini/       # The one root, one state (organizzolini.tfstate)
        ├── main.tf          # Backend, providers, and the kubeconfig the cluster providers read
        ├── cluster.tf       # LKE cluster and its readiness wait
        ├── cloudflare.tf    # Zone import and tunnel
        ├── argocd.tf        # Argo CD core and the root Application
        ├── namespaces.tf    # The platform namespace
        ├── secrets.tf       # Platform secrets
        ├── caelundas.tf     # Caelundas namespace, database password, and secrets
        ├── github.tf        # Repository settings, ruleset, Actions variables and secrets
        ├── linode.tf        # Object Storage buckets: the state, the shared Nx cache, and Postgres backups
        └── openrouter.tf    # OpenRouter workspace, key, guardrail, preset
```

### kubernetes-job Chart

**Purpose**: Deploy batch jobs with optional PVC storage.

**Use cases**:

- Data migrations
- Report generation

Use a Job for work that runs to completion and leaves output behind (caelundas writes iCalendar files to a PVC); use a Deployment for anything that serves requests continuously.

**Chart tests**: `tests/*_test.yaml` holds helm-unittest suites, run by `nx run infrastructure:helm-test` over every chart that has a `tests/` folder.

**Organizzolini root**: `terraform/organizzolini` is the one root for all of this repository's infrastructure, in one state (`organizzolini.tfstate`). It replaces the former `openrouter`, `github`, and `linode` roots, so no root reads another's state and there is no apply order to keep. `github.tf` holds the repository settings, the `main` ruleset, the `OPENWIKI_MODEL_ID` and Nx cache Actions variables and secrets, and the `KUBECONFIG` secret; `linode.tf` holds the Object Storage buckets and keys for the state, the shared Nx cache, and Postgres backups; `openrouter.tf` holds the OpenRouter workspace, key, guardrail, and preset. For the cluster it holds: the LKE cluster and its readiness wait (`cluster.tf`), the Cloudflare zone import and tunnel, which answers 404 until an application adds routing rules (`cloudflare.tf`), the `organizzolini` namespace (`namespaces.tf`), the platform secrets `postgres-backups` and `cloudflared-token` (`secrets.tf`), Argo CD core and a `root` Application on `main` (`argocd.tf`), and everything Terraform owns for Caelundas: its namespace and the `caelundas-postgres` secret in both namespaces (`caelundas.tf`). Adding another app means adding another file like `caelundas.tf`. The apps do not set `CreateNamespace`, so Terraform creates their namespaces. `k8s_version` is optional and pins the cluster's Kubernetes version; unset, it takes the newest from `linode_lke_versions`. `region` is the cluster's region and `object_storage_region` the buckets' (`us-iad-2`, whose S3 endpoint is `us-iad-18`). `refresh_documentation_key_hash` pins the OpenRouter key to import and skips the lookup by name, which a plan under a mock provider cannot make. `github_token` (`TF_VAR_github_token`) writes the Actions variables and secrets. The kubernetes and helm providers are configured from the cluster resource's own kubeconfig, so every Kubernetes and Helm resource depends on `terraform_data.cluster_ready`; the known caveats are in the README. The `argo-cd` chart has no ApplicationSet switch, so `argocd-values.yaml` sets `applicationSet.replicas: 0`. The namespaces and secrets use the `kubernetes_namespace_v1` and `kubernetes_secret_v1` resources, since the unsuffixed ones are deprecated in provider 3.x. New cloud-visible resources carry the `organizzolini_codebase_` address prefix and the `organizzolini-codebase-` label prefix.

**Terraform tests**: `tests/` holds the `terraform test` suites written in HCL, which run against `mock_provider` blocks, so they need no credentials. `nx run infrastructure:terraform-test` initializes the root with `-backend=false` and runs its tests. A mock provider cannot import, so the suite overrides each imported resource.

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

### argocd-applications Chart

**Purpose**: The Argo CD app-of-apps tree. Each `applications` entry renders one `Application` in the `argocd` namespace, ordered by `argocd.argoproj.io/sync-wave` (0 cert-manager, 1 cloudnative-pg, 2 plugin-barman-cloud, 3 postgres, 4 cloudflared). The chart also renders the `batch-low` PriorityClass (value -10, `preemptionPolicy: Never`, not global), which batch Jobs use.

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
- Chart metadata: [helm/argocd-applications/Chart.yaml](helm/argocd-applications/Chart.yaml)
- Base values: [helm/argocd-applications/values/base.yaml](helm/argocd-applications/values/base.yaml)
- Templates: [helm/argocd-applications/templates/](helm/argocd-applications/templates/)

## Kubernetes Deployment

See [README.md](README.md) for the Helm deploy commands and the `nx run infrastructure:*` targets. `helm-lint`, `helm-test`, `kubeconform`, `kube-linter`, `pluto`, `tflint`, `terraform-test`, and `compose-config` run in CI as part of `lint-code`, in the Lint leg of [continuous-integration.yml](../../.github/workflows/continuous-integration.yml).

## Linters

The `helm-releases` command of the `deployment` project discovers the Helm releases, so none is listed anywhere: every folder under `helm/` holding a `Chart.yaml` installs as `<chart>` with `values/base.yaml`, and once more as `<chart>-<name>` for each other `values/<name>.yaml` layered over it. The namespace comes from the Argo CD Application in `helm/argocd-applications/values/base.yaml` whose `path` and `valueFiles` match the release, else `default`; an empty `image.tag` in the values is filled with a placeholder so the chart renders. A chart whose release the files cannot describe adds an optional `release.yaml` beside `Chart.yaml` with `namespace` and `strings` (extra `--set-string` pairs), as `argocd-applications` does for its namespace. `helm-lint` runs `helm lint --strict` over the releases, and `helm-render` templates them into `dist/infrastructure/helm-render/`, which `kubeconform`, `kube-linter`, `pluto`, and `trivy-config` read. Add a chart or values file and the next run picks it up; edit no code.

- **kubeconform**: strict schemas for Kubernetes 1.35.0 plus the datreeio CRDs catalog for Argo CD, CloudNativePG, Barman Cloud, and cert-manager. A kind with no schema fails, so nothing is skipped. It reads schemas from raw.githubusercontent.com.
- **kube-linter**: `configuration/kube-linter.yaml` adds the hardening checks to the defaults, with no exclusions. Fix the chart, not the config.
- **pluto**: a removed API fails, a deprecated one prints and passes.
- **trivy-config**: also scans the rendered manifests at CRITICAL and HIGH. Fix the chart; never add a trivyignore entry.
- **tflint**: `terraform/.tflint.hcl` enables the bundled terraform ruleset (`preset = "all"`).
- **actionlint** and **zizmor** (configuration project): `.github/actionlint.yaml` and `.github/zizmor.yml` record every ignored message and changed rule with its reason.

A failure prints the tool's own message with the file and line; the rendered file name is the release, so open `dist/infrastructure/helm-render/<release>.yaml` to see what was linted.

## Merging the Terraform Roots

The `openrouter`, `github`, and `linode` roots became the one `organizzolini` root, and its state moves to the `organizzolini-terraform-state` bucket as `organizzolini.tfstate`. Linode cannot rename a bucket, so `linode.tf` creates that bucket and its key beside the original `organizzolini` ones. A person merges the three states and uploads the result **before** the pull request merges: Continuous Deployment applies on any change under `infrastructure/terraform`, and against a missing state it would try to create everything again, including a second set of keys whose secrets the cache secrets depend on.

Never re-import instead of moving: the `nx_cache_*` keys' secrets exist only in the old state, and a fresh import loses them. Work on local copies, never on the live remote state, and keep CI and Continuous Deployment quiet until step 6.

1. **Read the credentials**: with `TF_STATE_BUCKET`, `AWS_ENDPOINT_URL_S3` (`https://us-iad-18.linodeobjects.com`), and the old key in `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`, initialize the original `linode` state, then read the new bucket's key without printing it:

   ```bash
   terraform output -raw terraform_state_access_key
   terraform output -raw terraform_state_secret_key
   ```

   If the new bucket does not exist yet, apply it first with the old layout. `terraform_state_bucket_label` is `organizzolini-terraform-state`; if the `organizzolini-codebase-terraform-state` bucket was already created, `terraform state rm` its bucket and key and delete them in Linode by hand.

2. **Back up**: copy every `*.tfstate` out of both buckets into a local directory, and keep that directory until step 8.
3. **Merge**: `terraform state mv -state=<root>.tfstate -state-out=organizzolini.tfstate <address> <address>` for every managed resource in `openrouter.tfstate`, `github.tfstate`, and `linode.tfstate`, from `terraform state list`. Skip data sources: they refresh. Addresses do not change, since the root has no modules. If the cluster root was applied before this change, `organizzolini.tfstate` already exists in the original bucket: download it first and move into it, so the cluster's resources stay.
4. **Prove it**: point `nx run infrastructure:terraform-init` at a bucket holding `organizzolini.tfstate`, then `terraform plan`. It must show no changes.
5. **Upload**: put `organizzolini.tfstate` in `organizzolini-terraform-state` and compare the object with the local file.
6. **Switch**: set `TERRAFORM_STATE_BUCKET`, `TERRAFORM_STATE_ENDPOINT`, `TERRAFORM_STATE_ACCESS_KEY_ID`, and `TERRAFORM_STATE_SECRET_ACCESS_KEY` to the new values with `gh secret set`, then merge the pull request. Its plan must show no changes. Roll back by restoring the four secrets; the old `*.tfstate` objects are untouched.
7. **Retire the old roots' states** once a week of runs is clean: delete `openrouter.tfstate`, `github.tfstate`, and `linode.tfstate` from the original bucket.
8. **Retire the original bucket**: `terraform state rm` the `state` bucket and key, delete their resources and `bucket_label` from `linode.tf` and `variables.tf`, then delete the bucket and key in Linode by hand. Both set `prevent_destroy` so that Terraform cannot do this itself.

## Troubleshooting

- **Job stuck in `Pending`** — inspect with `kubectl describe job <name>`, then the pod and PVC. Usual causes are an image pull failure against GHCR, insufficient cluster CPU/memory, or an unbound PVC.
- **PVCs outliving their Job** — PVCs are never deleted automatically when a Job or pod goes away. Remove them explicitly (`kubectl delete pvc <name>`) once you have what you need from it.
- **`exec format error`** — the image was built for arm64. Rebuild with `--platform linux/amd64`.

## Key Files

- [helm/kubernetes-job/templates/job.yaml](helm/kubernetes-job/templates/job.yaml): Job template
- [helm/kubernetes-job/templates/pvc.yaml](helm/kubernetes-job/templates/pvc.yaml): PVC template
- [helm/kubernetes-job/templates/\_helpers.tpl](helm/kubernetes-job/templates/_helpers.tpl): Helpers
- [terraform/organizzolini/main.tf](terraform/organizzolini/main.tf): Backend, providers, and the provider wiring from the cluster's kubeconfig
- [terraform/organizzolini/cluster.tf](terraform/organizzolini/cluster.tf): LKE cluster and its readiness wait
- [terraform/organizzolini/cloudflare.tf](terraform/organizzolini/cloudflare.tf): Zone import and tunnel
- [terraform/organizzolini/argocd.tf](terraform/organizzolini/argocd.tf): Argo CD core and the root Application
- [terraform/organizzolini/secrets.tf](terraform/organizzolini/secrets.tf): Platform secrets
- [terraform/organizzolini/caelundas.tf](terraform/organizzolini/caelundas.tf): Caelundas namespace, database password, and secrets
- [terraform/organizzolini/github.tf](terraform/organizzolini/github.tf), [linode.tf](terraform/organizzolini/linode.tf), [openrouter.tf](terraform/organizzolini/openrouter.tf): Repository settings and Actions secrets, Object Storage, and OpenRouter
