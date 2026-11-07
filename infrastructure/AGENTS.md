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
│   └── kubernetes-job/      # Reusable chart for K8s Jobs
└── terraform/               # Cluster provisioning
    ├── github/              # Repository settings, ruleset, Actions variables
    ├── linode/              # Object Storage buckets: the state and the shared Nx cache
    └── openrouter/          # OpenRouter workspace, key, guardrail, preset
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

4. **Check the copy**: `aws s3 ls --recursive` on both buckets lists the same `codebase/*.tfstate` keys, and the new `linode.tfstate` matches the old one byte for byte.
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
