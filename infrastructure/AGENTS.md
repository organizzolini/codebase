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
│   ├── argocd-applications/ # Argo CD app-of-apps tree and the batch-low PriorityClass
│   ├── cloudflared/         # Cloudflare Tunnel connector, routing held in Cloudflare
│   ├── kubernetes-deployment/  # Reusable chart for long-running services
│   ├── kubernetes-job/      # Reusable chart for K8s Jobs
│   └── postgres/            # Shared PostgreSQL as CloudNativePG resources
└── terraform/               # Cluster provisioning
    ├── github/              # Repository settings, ruleset, Actions variables
    ├── linode/              # Object Storage buckets: the state, the shared Nx cache, and Postgres backups
    ├── openrouter/          # OpenRouter workspace, key, guardrail, preset
    └── organizzolini/       # LKE cluster, Cloudflare tunnel, namespaces, secrets, Argo CD, KUBECONFIG secret
```

### kubernetes-deployment Chart

**Purpose**: Deploy long-running services as a Deployment and Service. The application migrates its own database at startup, under a Postgres advisory lock, so replicas starting together migrate one at a time and the chart has no hook.

- `image.tag: ""` (default) renders nothing, so Argo CD reports the app Synced/Healthy before the first release. The release commit sets the tag.
- The Deployment exposes `containerPort` as `http`, and a `probes` port when liveness probes use another port (Lightship uses 9000).
- The Deployment pods and the Service selector both carry `app.kubernetes.io/component: server`.

`values/caelundas-api.yaml` and `values/caelundas-web.yaml` layer over `values/base.yaml`.

### kubernetes-job Chart

**Purpose**: Deploy batch jobs with optional PVC storage.

**Use cases**:

- Data migrations
- Report generation

Use a Job for work that runs to completion and leaves output behind (caelundas ingests events into Postgres); use a Deployment for anything that serves requests continuously.

**Values added for Indexed and ephemeral runs** (defaults keep today's rendering unchanged):

- `job.completionMode`: `NonIndexed` (default) or `Indexed`. Rendered only when `Indexed`.
- `job.backoffLimitPerIndex`: integer retries per index. Rendered only when `Indexed`, and in that case `backoffLimit` is omitted because Kubernetes rejects both together.
- `priorityClassName`: PriorityClass name for the pod; empty (default) omits the field.
- `persistence.type`: `persistentVolumeClaim` (default) or `emptyDir`. With `emptyDir`, `pvc.yaml` renders nothing and the output path mounts an `emptyDir`.
- `extraEnv`: list appended after `env`, for per-run values passed with `--set-json` (the ingestion workflow uses it).

`values/caelundas-cli.yaml` layers over `values/base.yaml` for the caelundas-cli ingestion Job: an Indexed job with `persistence.enabled: false` (it writes only to Postgres, so no volume or PVC), `batch-low` priority, and the staging Postgres environment.

**Chart tests**: `tests/*_test.yaml` holds helm-unittest suites, run by `nx run infrastructure:helm-test` over every chart that has a `tests/` folder.

**Organizzolini root**: `terraform/organizzolini` is the one root for everything the cluster needs, in one state (`organizzolini.tfstate`): the LKE cluster and its readiness wait (`cluster.tf`), the Cloudflare zone import, tunnel, routing and DNS record (`cloudflare.tf`), the `organizzolini` namespace (`namespaces.tf`), the platform secrets `postgres-backups` and `cloudflared-token` (`secrets.tf`), Argo CD core and a `root` Application on `main` (`argocd.tf`), the `KUBECONFIG` Actions secret (`github.tf`), and everything Terraform owns for Caelundas: its namespace and the `caelundas-postgres` secret in both namespaces (`caelundas.tf`). Adding another app means adding another file like `caelundas.tf`. The apps do not set `CreateNamespace`, so Terraform creates their namespaces. `k8s_version` is optional and pins the cluster's Kubernetes version; unset, it takes the newest from `linode_lke_versions`. `state_bucket` (`TF_VAR_state_bucket`) locates the `linode` state it reads for the backups key, through `try`, so a pull request plans before that output exists. `github_token` (`TF_VAR_github_token`) writes the Actions secret. The kubernetes and helm providers are configured from the cluster resource's own kubeconfig, so every Kubernetes and Helm resource depends on `terraform_data.cluster_ready`; the known caveats are in the README. The `argo-cd` chart has no ApplicationSet switch, so `argocd-values.yaml` sets `applicationSet.replicas: 0`. The namespaces and secrets use the `kubernetes_namespace_v1` and `kubernetes_secret_v1` resources, since the unsuffixed ones are deprecated in provider 3.x. New cloud-visible resources carry the `organizzolini_codebase_` address prefix and the `organizzolini-codebase-` label prefix.

**Terraform tests**: `tests/` holds the `terraform test` suites written in HCL, which run against `mock_provider` blocks, so they need no credentials. `nx run infrastructure:terraform-test` initializes each root with `-backend=false` and runs its tests, for every root that has a `tests/` folder.

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

**Purpose**: The Argo CD app-of-apps tree. Each `applications` entry renders one `Application` in the `argocd` namespace, ordered by `argocd.argoproj.io/sync-wave` (0 cert-manager, 1 cloudnative-pg, 2 plugin-barman-cloud, 3 postgres, 4 cloudflared, 5 the two caelundas apps). The chart also renders the `batch-low` PriorityClass (value -10, `preemptionPolicy: Never`, not global), which the ingestion Job uses.

- Upstream entries (`chart`) pin an exact `version`, never a range. `cert-manager` installs its CRDs through a Helm parameter and uses `ServerSideApply=true`; the two operator namespaces set `CreateNamespace=true`.
- Repository entries (`path`) take `valueFiles` relative to the chart path. `organizzolini` and `caelundas` come from Terraform, so their apps do not set `CreateNamespace`.
- Every Application auto-syncs with `prune` and `selfHeal`, retries with backoff, and sets `SkipDryRunOnMissingResource=true`.
- The root `Application` created by the `organizzolini` Terraform root points at this chart's path.

`tests/applications_test.yaml` asserts on rendered YAML: the wave order, exact upstream pins, automated sync, dry-run skipping, the caelundas values, and the PriorityClass.

**Read drift** between the repository and the cluster:

```bash
kubectl get applications -n argocd            # Sync and Health per app
argocd app diff --core <name>                 # the live-versus-desired diff, read from the cluster without an Argo CD server
```

## Helm Chart References

- Chart metadata: [helm/kubernetes-deployment/Chart.yaml](helm/kubernetes-deployment/Chart.yaml)
- Base values: [helm/kubernetes-deployment/values/base.yaml](helm/kubernetes-deployment/values/base.yaml)
- Templates: [helm/kubernetes-deployment/templates/](helm/kubernetes-deployment/templates/)
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

See [README.md](README.md) for the Helm deploy commands and the `nx run infrastructure:*` targets. `helm-lint`, `helm-test`, `terraform-test`, and `compose-config` run in CI as part of `lint-code`, in the Lint leg of [continuous-integration.yml](../../.github/workflows/continuous-integration.yml).

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

## Caelundas Ingestion

**Start a run**: Actions, then **caelundas-cli**, then **Run workflow**. Inputs are `start_year` and `end_year`, and `environment`, one `NAME=value` per line of extra container environment (`LATITUDE=39.9`, `LONGITUDE=-75.2`): the CLI validates every value itself, so a new option needs no workflow change. The workflow checks only that the years are integers with `start_year <= end_year` and that each line is `NAME=value`, then renders the Job with `helm template` (it fails with `no caelundas-cli release yet` while the image tag in `helm/kubernetes-job/values/caelundas-cli.yaml` is empty) and runs `helm install caelundas-ingestion-<start>-<end>-<run_id>` into the `caelundas` namespace: one Indexed Job index per calendar year, `START_YEAR` set, each index computing its own dates, writing to `caelundas_staging`. It authenticates with the `KUBECONFIG` repository secret through `azure/k8s-set-context`, does not wait for the Job, and appends the chart's `NOTES.txt` to the run summary. The Actions form takes one line, so send several lines from the CLI: `gh workflow run caelundas-ingestion.yml -f start_year=1900 -f end_year=1902 -f environment=$'LATITUDE=39.9\nLONGITUDE=-75.2'`. For parallel years, install by hand with `--set job.parallelism=<n>`.

**Follow it**: the run summary prints these with the release name filled in.

```bash
kubectl get jobs -n caelundas
kubectl get pods -n caelundas -l job-name=<release-name>
kubectl logs -n caelundas -l job-name=<release-name> --prefix --tail=50   # every index
```

**Clean up**: Argo CD never tracks the release, so it neither prunes nor reports it. The Job's `ttlSecondsAfterFinished` (86400) removes it a day after it finishes; `helm uninstall <release-name> -n caelundas` tidies the release record.

**Duration**: one year takes about 45 minutes on 1 CPU at about 800 MiB peak (limit 1.5 GiB). With the default `job.parallelism: 1` a century is about 75 hours, and a failed index retries up to twice more (`backoffLimitPerIndex: 2`). The Job requests 1 GiB, so a second concurrent year does not fit beside the platform on the one 4 GB node: a `job.parallelism` of 2 or more makes the autoscaler add the second node (about $24 a month while it lasts, at most 2 nodes).

**Night sky, one-off**: the `stars`, `constellations` and `constellation_edges` tables come from `nx run caelundas-cli:start:night-sky` run locally against three hand-downloaded files (see the caelundas-cli README). Restore just those tables into `caelundas_staging` (or production) with the `pg_dump`/`pg_restore` pair from the postgres runbook, adding `--table stars --table constellations --table constellation_edges` to both. A Job route is not provided: the image carries no night-sky input files.

## Troubleshooting

- **Job stuck in `Pending`** — inspect with `kubectl describe job <name>`, then the pod and PVC. Usual causes are an image pull failure against GHCR, insufficient cluster CPU/memory, or an unbound PVC.
- **PVCs outliving their Job** — PVCs are never deleted automatically when a Job or pod goes away. Remove them explicitly (`kubectl delete pvc <name>`) once you have what you need from it.
- **`exec format error`** — the image was built for arm64. Rebuild with `--platform linux/amd64`.

## Key Files

- [../.github/workflows/caelundas-ingestion.yml](../.github/workflows/caelundas-ingestion.yml): On-demand ingestion workflow
- [helm/kubernetes-job/templates/job.yaml](helm/kubernetes-job/templates/job.yaml): Job template
- [helm/kubernetes-job/templates/pvc.yaml](helm/kubernetes-job/templates/pvc.yaml): PVC template
- [helm/kubernetes-job/templates/\_helpers.tpl](helm/kubernetes-job/templates/_helpers.tpl): Helpers
- [terraform/organizzolini/main.tf](terraform/organizzolini/main.tf): Backend, remote state, and the provider wiring from the cluster's kubeconfig
- [terraform/organizzolini/cluster.tf](terraform/organizzolini/cluster.tf): LKE cluster and its readiness wait
- [terraform/organizzolini/cloudflare.tf](terraform/organizzolini/cloudflare.tf): Zone import, tunnel, routing, and DNS record
- [terraform/organizzolini/argocd.tf](terraform/organizzolini/argocd.tf): Argo CD core and the root Application
- [terraform/organizzolini/secrets.tf](terraform/organizzolini/secrets.tf): Platform secrets
- [terraform/organizzolini/caelundas.tf](terraform/organizzolini/caelundas.tf): Caelundas namespace, database password, and secrets
- [terraform/openrouter/main.tf](terraform/openrouter/main.tf): OpenRouter resources and the S3-compatible state backend
