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
    ├── linode/              # Object Storage buckets: the state and the shared Nx cache
    └── openrouter/          # OpenRouter workspace, key, guardrail, preset
```

### kubernetes-deployment Chart

**Purpose**: Deploy long-running services as a Deployment and Service, with an optional PreSync hook Job (migrations run before each rollout).

- `image.tag: ""` (default) renders nothing, so Argo CD reports the app Synced/Healthy before the first release. The release commit sets the tag.
- `hook.image.tag` has no fallback. With `image.tag` set and the hook enabled, an empty `hook.image.tag` fails the render (`required`), so a release never skips migrations or pulls the CLI at the API's tag.
- The Deployment exposes `containerPort` as `http`, and a `probes` port when liveness probes use another port (Lightship uses 9000).
- The Deployment pods and the Service selector both carry `app.kubernetes.io/component: server`. Hook pods carry `app.kubernetes.io/component: hook` instead, so the Service selector does not match them. The Service selects on subset match, so the extra label alone would not exclude a hook pod.

`values/caelundas-api.yaml` and `values/caelundas-web.yaml` layer over `values/base.yaml`.

### kubernetes-job Chart

**Purpose**: Deploy batch jobs with optional PVC storage.

**Use cases**:

- Data migrations
- Report generation

Use a Job for work that runs to completion and leaves output behind (caelundas writes iCalendar files to a PVC); use a Deployment for anything that serves requests continuously.

**Values added for Indexed and ephemeral runs** (defaults keep today's rendering unchanged):

- `job.completionMode`: `NonIndexed` (default) or `Indexed`. Rendered only when `Indexed`.
- `job.backoffLimitPerIndex`: integer retries per index. Rendered only when `Indexed`, and in that case `backoffLimit` is omitted because Kubernetes rejects both together.
- `priorityClassName`: PriorityClass name for the pod; empty (default) omits the field.
- `persistence.type`: `persistentVolumeClaim` (default) or `emptyDir`. With `emptyDir`, `pvc.yaml` renders nothing and the output path mounts an `emptyDir`.
- `extraEnv`: list appended after `env`, for per-run values passed with `--set-json` (the ingestion workflow uses it).

`values/caelundas-cli.yaml` layers over `values/base.yaml` for the caelundas-cli ingestion Job: an Indexed job on `emptyDir` scratch space, `batch-low` priority, and the staging Postgres environment.

**Chart tests**: `tests/*_test.yaml` holds helm-unittest suites, run by `nx run infrastructure:helm-test` over every chart that has a `tests/` folder.

### cloudflared Chart

**Purpose**: Run the remotely managed Cloudflare Tunnel connector in the `codebase` namespace. The connector dials out, so the chart has no Service and no ingress rules: routing lives in Cloudflare.

- The token comes from the `cloudflared-token` Secret (key `token`) through `TUNNEL_TOKEN`. The bootstrap root creates that Secret.
- `image.tag` is pinned to an exact release, never `latest`. Bump it deliberately.
- `metricsPort` (2000) serves `/ready` for both probes. It binds `0.0.0.0` so the kubelet can reach it.
- Pods run as uid 65532 with a read-only root filesystem, no privilege escalation, all capabilities dropped, and the `RuntimeDefault` seccomp profile.

`tests/cloudflared_test.yaml` asserts on rendered YAML only, so it needs no cluster or tunnel.

### postgres Chart

**Purpose**: The shared PostgreSQL cluster in the `codebase` namespace, as CloudNativePG resources: a `Cluster` (`postgres`, PostgreSQL 18 pinned to an exact minor), a managed role and `Database` per project database, a `Pooler` (`postgres-pooler-rw`, PgBouncer in transaction mode), and Barman Cloud backups (`ObjectStore` `postgres-backups` with 30-day retention, and a daily `ScheduledBackup` at 03:00 UTC).

- `projects` lists each project with its `databases`. Each project gets role `<name>_username` (password from the `<name>-postgres` Secret) and each database a `Database` resource whose PostgreSQL name is `<name>_<database>`, owned by that role, with schema `<name>`. Adding a project is adding a list entry, as with `POSTGRES_PROJECTS` in the local Compose file.
- The direct service is `postgres-rw`; the app and jobs address the pooler, `postgres-pooler-rw`.
- The volume uses the `linode-block-storage-retain` storage class, so deleting the `Cluster` keeps its data.
- The chart needs the CloudNativePG operator and the Barman Cloud plugin CRDs, and the `postgres-backups` and `<name>-postgres` Secrets from the bootstrap root.

`tests/postgres_test.yaml` asserts on rendered YAML only, since the CRDs are not installed locally.

### postgres Runbooks

**Connect to the database**: forward the direct service and read the password from the `caelundas-postgres` Secret:

```bash
kubectl port-forward -n codebase svc/postgres-rw 5433:5432
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
- Repository entries (`path`) take `valueFiles` relative to the chart path. `codebase` and `caelundas` come from Terraform, so their apps do not set `CreateNamespace`.
- Every Application auto-syncs with `prune` and `selfHeal`, retries with backoff, and sets `SkipDryRunOnMissingResource=true`.
- The root `Application` created by the bootstrap root points at this chart's path.

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

See [README.md](README.md) for the Helm deploy commands and the `nx run infrastructure:*` targets. `helm-lint`, `helm-test`, and `compose-config` run in CI as part of `lint-code`, in the Lint leg of [continuous-integration.yml](../../.github/workflows/continuous-integration.yml).

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
- [terraform/main.tf](terraform/main.tf): Cluster definition
- [terraform/openrouter/main.tf](terraform/openrouter/main.tf): OpenRouter resources and the S3-compatible state backend
