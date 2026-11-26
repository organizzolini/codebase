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
│   └── kubernetes-job/      # Reusable chart for K8s Jobs
└── terraform/
    └── organizzolini/       # The one root, one state (organizzolini.tfstate)
        ├── github.tf        # Repository settings, ruleset, Actions variables and secrets
        ├── linode.tf        # Object Storage buckets: the state and the shared Nx cache
        └── openrouter.tf    # OpenRouter workspace, key, guardrail, preset
```

### kubernetes-job Chart

**Purpose**: Deploy batch jobs with optional PVC storage.

**Use cases**:

- Data migrations
- Report generation

Use a Job for work that runs to completion and leaves output behind (caelundas writes iCalendar files to a PVC); use a Deployment for anything that serves requests continuously.

## Helm Chart References

- Chart metadata: [helm/kubernetes-job/Chart.yaml](helm/kubernetes-job/Chart.yaml)
- Base values: [helm/kubernetes-job/values/base.yaml](helm/kubernetes-job/values/base.yaml)
- Templates: [helm/kubernetes-job/templates/](helm/kubernetes-job/templates/)

## Kubernetes Deployment

See [README.md](README.md) for the Helm deploy commands and the `nx run infrastructure:*` targets. `helm-lint` and `compose-config` run in CI as part of `lint-code`, in the Lint leg of [continuous-integration.yml](../../.github/workflows/continuous-integration.yml).

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
3. **Merge**: `terraform state mv -state=<root>.tfstate -state-out=organizzolini.tfstate <address> <address>` for every managed resource in `openrouter.tfstate`, `github.tfstate`, and `linode.tfstate`, from `terraform state list`. Skip data sources: they refresh. Addresses do not change, since the root has no modules.
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
- [terraform/organizzolini/versions.tf](terraform/organizzolini/versions.tf): The S3-compatible state backend and the three providers
- [terraform/organizzolini/github.tf](terraform/organizzolini/github.tf), [linode.tf](terraform/organizzolini/linode.tf), [openrouter.tf](terraform/organizzolini/openrouter.tf): The resources, one file per provider
