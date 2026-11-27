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
- The Deployment exposes `containerPort` (8080 for every application) as `http`, and a `probes` port when liveness probes use another port (Lightship uses 9000).
- The Deployment pods and the Service selector both carry `app.kubernetes.io/component: server`.

Each application owns its values: `projects/caelundas/caelundas-api/infrastructure/helm-values.yaml` and `projects/caelundas/caelundas-web/infrastructure/helm-values.yaml` layer over this chart's `values/base.yaml`, next to the application's `docker-compose.yml`.

### kubernetes-job Chart

**Purpose**: Run one container image to completion as a Job: today only the caelundas-cli ingestion, which writes to Postgres and leaves nothing on disk. Use a Deployment for anything that serves requests continuously.

The chart is the smallest correct Job: the image (`image.tag` is required, so an empty tag fails the render with `image.tag is required (no release of <repository> yet)` instead of pulling `repository:`), `args`, `env`, `resources`, `backoffLimit`, `ttlSecondsAfterFinished`, and an optional `priorityClassName`. The pod runs as uid 10001 under the `RuntimeDefault` seccomp profile with a read-only root filesystem, no privilege escalation and all capabilities dropped, with an `emptyDir` at `/tmp`. `envFile` and `envFileMountPath` hold the text of a dotenv file (`--set-file envFile=my.env`) and where it appears: `configmap.yaml` renders the ConfigMap `<fullname>-env`, and the Job mounts it read-only at the path through `subPath`. A ConfigMap is not private, so it is never for secrets: a password stays a Secret reference in `env`. `envFile` without a mount path fails the render.

`projects/caelundas/caelundas-cli/infrastructure/helm-values.yaml` layers over `values/base.yaml` for the ingestion Job: `batch-low` priority, `args: [main.js, caelundas]` (the image runs `node`), the staging Postgres environment, and `envFileMountPath: /app/configuration/.env`, the file the CLI's `ConfigModule` reads relative to its working directory.

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

### argocd-applications Chart

**Purpose**: The Argo CD app-of-apps tree. Each `applications` entry renders one `Application` in the `argocd` namespace, ordered by `argocd.argoproj.io/sync-wave` (0 cert-manager, 1 cloudnative-pg, 2 plugin-barman-cloud, 3 postgres, 4 cloudflared, 5 the two caelundas apps). The chart also renders the `batch-low` PriorityClass (value -10, `preemptionPolicy: Never`, not global), which the ingestion Job uses.

- Upstream entries (`chart`) pin an exact `version`, never a range. `cert-manager` installs its CRDs through a Helm parameter and uses `ServerSideApply=true`; the two operator namespaces set `CreateNamespace=true`.
- Repository entries (`path`) take `valueFiles` relative to the chart path; an entry starting with `$values/` is a path in the repository (a project's own `helm-values.yaml`), which makes the Application multi-source with a `ref: values` source (Argo CD 2.6 or later; the pinned chart installs 3.x). `organizzolini` and `caelundas` come from Terraform, so their apps do not set `CreateNamespace`.
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

See [README.md](README.md) for the Helm deploy commands and the `nx run infrastructure:*` targets. `helm-lint`, `helm-test`, `kubeconform`, `kube-linter`, `pluto`, `tflint`, `hadolint`, `terraform-validate` (validate and test), and `compose-config` run in CI as part of `lint-code`, in the Lint leg of [continuous-integration.yml](../../.github/workflows/continuous-integration.yml).

## Linters

The `helm-releases` command of the `deployment` project discovers the Helm releases, so none is listed anywhere: every folder under `helm/` holding a `Chart.yaml` installs as `<chart>` with `values/base.yaml`, and every `projects/*/*/infrastructure/helm-values.yaml` installs as `<chart>-<project>`, layered over the base of the chart its top-level `chart` key names (the chart ignores the key). The namespace comes from the Argo CD Application in `helm/argocd-applications/values/base.yaml` whose `path` and `valueFiles` (a project file as `$values/<path>`) match the release, else `default`; an empty `image.tag` in the values is filled with a placeholder so the chart renders. A chart whose release the files cannot describe adds an optional `release.yaml` beside `Chart.yaml` with `namespace` and `strings` (extra `--set-string` pairs), as `argocd-applications` does for its namespace. `helm-lint` runs `helm lint --strict` over the releases, and `helm-render` templates them into `dist/infrastructure/helm-render/`, which `kubeconform`, `kube-linter`, `pluto`, and `trivy-config` read. Add a chart or a project's `helm-values.yaml` and the next run picks it up; edit no code.

- **kubeconform**: strict schemas for Kubernetes 1.35.0 plus the datreeio CRDs catalog for Argo CD, CloudNativePG, Barman Cloud, and cert-manager. A kind with no schema fails, so nothing is skipped. It reads schemas from raw.githubusercontent.com.
- **kube-linter**: runs its default checks, which include the hardening ones, with no config and no exclusions. Fix the chart, not the check.
- **pluto**: a removed API fails, a deprecated one prints and passes.
- **trivy-config**: also scans the rendered manifests at CRITICAL and HIGH. Fix the chart; never add a trivyignore entry.
- **tflint**: `terraform/.tflint.hcl` enables the bundled terraform ruleset (`preset = "all"`). The `github` root's `outputs.tf` holds only a comment, since `terraform_standard_module_structure` wants every root to declare where its outputs go.
- **hadolint**: `configuration/lint/hadolint.yaml` (the `configuration` project) ignores no rule: the Dockerfile pins `tini`, builds on the full Node image so no `apt-get` runs in the install stage, and starts with `node main.js` under `tini`, with no shell.
- **actionlint** and **zizmor** (configuration project): `.github/actionlint.yaml` and `.github/zizmor.yml` record every ignored message and changed rule with its reason.

A failure prints the tool's own message with the file and line; the rendered file name is the release, so open `dist/infrastructure/helm-render/<release>.yaml` to see what was linted.

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

**Start a run**: Actions, then **caelundas-cli**, then **Run workflow**. The one input is `environment`, the CLI's dotenv text, pre-filled with the Environment section of `projects/caelundas/caelundas-cli/configuration/.env.default` (`LATITUDE`, `LONGITUDE`, `START_DATE`, `END_DATE`; a test keeps the two equal). The workflow parses nothing: it writes the input to a file through `env:` and runs `helm install caelundas-cli-<run_id>` into the `caelundas` namespace with `--set-file envFile=<file>`, so the chart mounts the text as `/app/configuration/.env` and the CLI's own Zod schema validates every line (a bad line fails the Job's pod with the schema's message in its logs, not the workflow). A new CLI option needs no workflow change. While the image tag in `projects/caelundas/caelundas-cli/infrastructure/helm-values.yaml` is empty (no release yet), `helm install` fails with the chart's `image.tag is required (no release of ghcr.io/organizzolini/caelundas-cli yet)`. It authenticates with the `KUBECONFIG` repository secret through `azure/k8s-set-context`, does not wait for the Job, and appends the chart's `NOTES.txt` to the run summary. A green run means the Job was created, not that the ingestion finished: follow it with the commands below. The Actions form's string box is a single line, so send multi-line text from the CLI: `gh workflow run caelundas-cli.yml -f environment="$(cat my.env)"`. The Postgres settings and password come from the chart and the `caelundas-postgres` Secret, never from the input, and the ConfigMap holds no secret. One run is one Job, one range: split a long range into several runs (a year takes about 45 minutes).

**Follow it**: the run summary prints these with the release name filled in.

```bash
kubectl get jobs -n caelundas
kubectl get pods -n caelundas -l job-name=<release-name>
kubectl logs -n caelundas -l job-name=<release-name> --prefix --tail=50
```

**Clean up**: Argo CD never tracks the release, so it neither prunes nor reports it. The Job's `ttlSecondsAfterFinished` (86400) removes it a day after it finishes; `helm uninstall <release-name> -n caelundas` tidies the release record.

**Duration**: one year takes about 45 minutes on 1 CPU at about 800 MiB peak (limit 1.5 GiB), and a failed pod retries up to three more times (`backoffLimit: 3`); the CLI upserts, so a retry repeats no row. The Job requests 1 GiB, so running a second ingestion beside the first does not fit beside the platform on the one 4 GB node: the autoscaler adds the second node (about $24 a month while it lasts, at most 2 nodes).

**Night sky, one-off**: the `stars`, `constellations` and `constellation_edges` tables come from `nx run caelundas-cli:start:night-sky` run locally against three hand-downloaded files (see the caelundas-cli README). Restore just those tables into `caelundas_staging` (or production) with the `pg_dump`/`pg_restore` pair from the postgres runbook, adding `--table stars --table constellations --table constellation_edges` to both. A Job route is not provided: the image carries no night-sky input files.

## Troubleshooting

- **Job stuck in `Pending`** — inspect with `kubectl describe job <name>`, then the pod. Usual causes are an image pull failure against GHCR or insufficient cluster CPU/memory.
- **`exec format error`** — the image was built for arm64. Rebuild with `--platform linux/amd64`.

## Key Files

- [../.github/workflows/caelundas-cli.yml](../.github/workflows/caelundas-cli.yml): On-demand ingestion workflow
- [helm/kubernetes-job/templates/job.yaml](helm/kubernetes-job/templates/job.yaml): Job template
- [helm/kubernetes-job/templates/\_helpers.tpl](helm/kubernetes-job/templates/_helpers.tpl): Helpers
- [terraform/organizzolini/main.tf](terraform/organizzolini/main.tf): Backend, remote state, and the provider wiring from the cluster's kubeconfig
- [terraform/organizzolini/cluster.tf](terraform/organizzolini/cluster.tf): LKE cluster and its readiness wait
- [terraform/organizzolini/cloudflare.tf](terraform/organizzolini/cloudflare.tf): Zone import, tunnel, routing, and DNS record
- [terraform/organizzolini/argocd.tf](terraform/organizzolini/argocd.tf): Argo CD core and the root Application
- [terraform/organizzolini/secrets.tf](terraform/organizzolini/secrets.tf): Platform secrets
- [terraform/organizzolini/caelundas.tf](terraform/organizzolini/caelundas.tf): Caelundas namespace, database password, and secrets
- [terraform/openrouter/main.tf](terraform/openrouter/main.tf): OpenRouter resources and the S3-compatible state backend
