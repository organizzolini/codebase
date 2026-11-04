# Infrastructure

**Kubernetes deployment tools and cloud infrastructure configuration for the codebase.**

> For detailed architecture, deployment patterns, Helm chart configuration, and troubleshooting, see [AGENTS.md](AGENTS.md).

## Contents

| Directory                                    | Purpose                                                           |
| -------------------------------------------- | ----------------------------------------------------------------- |
| [helm/kubernetes-job](helm/kubernetes-job)   | Reusable Helm chart for batch job deployments with PVC storage    |
| [terraform/](terraform)                      | Linode LKE (Kubernetes) cluster provisioning                      |
| [terraform/openrouter](terraform/openrouter) | OpenRouter workspace, API key, guardrail, and ranked-model preset |
| [terraform/github](terraform/github)         | GitHub repository settings, `main` ruleset, and Actions variables |
| [terraform/linode](terraform/linode)         | The Object Storage bucket that holds Terraform state              |

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

The `terraform/openrouter` root keeps its state in a Linode Object Storage bucket. Export `TF_STATE_BUCKET`, `AWS_ENDPOINT_URL_S3`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `TF_VAR_openrouter_management_key`, and `TF_VAR_openrouter_api_key`, then:

```bash
nx run infrastructure:terraform-format    # fmt -check, part of lint-code
nx run infrastructure:terraform-validate  # no backend or credentials needed, part of lint-code
nx run infrastructure:terraform-plan:openrouter      # writes plan.tfplan; use :github for the GitHub root
nx run infrastructure:terraform-apply:openrouter     # applies; CI does this on main, openrouter then github
```

Continuous Integration plans a pull request that changes the root and comments the creates, updates, replaces, and deletes on it. Continuous Deployment applies a push to `main` that changes it. Both read the `TERRAFORM_STATE_BUCKET`, `TERRAFORM_STATE_ENDPOINT`, `TERRAFORM_STATE_ACCESS_KEY_ID`, `TERRAFORM_STATE_SECRET_ACCESS_KEY`, `OPENROUTER_MANAGEMENT_KEY`, and `OPENROUTER_API_KEY` repository secrets. The last is the existing key the Terraform imports, whose value it writes the preset with.

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

The script stops at the first object that already exists, so name only the
projects the volume lacks. Never use `infrastructure:postgres:recreate` for this:
it deletes the volume and every row in it. See
[ADR 0022](../../documentation/adr/0022-give-every-database-project-its-own-database-schema-and-role.md)
for meanderaw's one exception.

### Provision Kubernetes Cluster

```bash
cd infrastructure/terraform
terraform init
terraform plan -var="linode_token=$LINODE_API_TOKEN"
terraform apply -var="linode_token=$LINODE_API_TOKEN"
```

## Nx Targets

| Target           | Does                                                                   |
| ---------------- | ---------------------------------------------------------------------- |
| `postgres`       | `up`, `down`, `recreate` (removes the volume) for the local PostgreSQL |
| `searxng`        | `up`, `down`, `open` for the SearxNG metasearch service                |
| `open-webui`     | `up`, `down`, `open` for the Open WebUI service                        |
| `terraform`      | `plan` (default) or `import` against the cluster                       |
| `trivy-config`   | Trivy misconfiguration scan of the Terraform code                      |
| `helm-lint`      | Lint the `kubernetes-job` chart against its base values                |
| `compose-config` | Validate the Docker Compose file                                       |

`helm-lint` and `compose-config` also run in CI: `lint-code` depends on both, so the Lint leg of [continuous-integration.yml](../../.github/workflows/continuous-integration.yml) runs them. They need `helm` and `docker compose`; `compose-config` creates a missing root `.env` from `.env.default` and never overwrites an existing one.

## Documentation

- **[AGENTS.md](AGENTS.md)**: Complete infrastructure architecture, Helm chart config, Terraform setup, troubleshooting
- **[caelundas AGENTS.md](../caelundas/caelundas-cli/AGENTS.md)**: Application deployment example
- **[Main AGENTS.md](../../AGENTS.md)**: Codebase architecture and Nx workflows

The `terraform/github` root imports the repository's settings (merge methods, features, secret scanning, Dependabot security updates) and its `main` ruleset, and sets the `OPENWIKI_MODEL_ID` Actions variable to the OpenRouter preset (`@preset/refresh-documentation`) by reading the openrouter root's state. It needs `TF_VAR_state_bucket` and `TF_VAR_github_token`; CI reads the `GH_TOKEN` repository secret, which needs Administration and Variables write on this repository, because `GITHUB_TOKEN` cannot be granted either. Because the provider cannot express the ruleset's `code_quality` rule or its unattributed-changes approval, `terraform_data.main_ruleset_unsupported_rules` patches both back through the GitHub REST API whenever the ruleset updates. Terraform cannot read the value of the imported "Default key", so `OPENROUTER_API_KEY` stays a hand-set secret.

The `terraform/linode` root imports the state bucket (`organizzolini`, region `us-iad-2`) and its access key and refuses to destroy it. It needs `TF_VAR_linode_token`; CI reads the `LINODE_TOKEN` repository secret, a Linode API token with Object Storage read and write.

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run infrastructure:coinagerie-check:write`.

- **account**: Owner, a user or organization, of the GitHub repository that the github Terraform root manages.
- **acl**: Access control setting on the Linode state bucket, kept private so the Terraform state stays hidden.
- **actor**: Entry in the main ruleset's bypass list, here OrganizationAdmin with ID zero that GitHub reports.
- **affinity**: Pod scheduling rules slot in the Job template, passed through from the Helm values unchanged.
- **alert**: Code scanning finding that the main ruleset's threshold setting decides whether to block a merge.
- **annotation**: Key-value metadata on the Job pod template, supplied through the podAnnotations value and empty by default.
- **approval**: Pull request review sign-off the main ruleset requires, currently zero, plus extra approval for unattributed changes.
- **approve**: Auto-approve flag on the apply target that skips Terraform's confirmation prompt, used on main.
- **archive**: Setting that archives instead of deleting the GitHub repository when Terraform destroys it.
- **assignment**: Terraform resource that binds the refresh-documentation guardrail to its OpenRouter API key.
- **autoscaler**: Block in the LKE node pool that scales worker nodes between a minimum of one and a maximum of three.
- **backend**: Remote state storage that each Terraform root configures as an S3 store on Linode Object Storage.
- **backoff**: Retry limit for a failed Job pod, set to three by default through the backoffLimit value.
- **bypass**: Exemption in the main ruleset letting the organization admin merge around its checks, always.
- **chart**: Reusable Helm package at helm/kubernetes-job that renders the Job, PVC, and helper templates.
- **claim**: Name of the PVC the Job pod mounts, derived from the chart's fullname helper.
- **cluster**: Linode Kubernetes Engine, the managed service that Terraform provisions for the Helm jobs.
- **completion**: Terminal state a Job reaches when its work finishes, as batch work does, rather than serving requests.
- **condition**: Terraform validation rule that rejects an empty models list before any preset is written.
- **destroy**: Terraform removal of a resource; prevent_destroy blocks it for the state bucket and the repository.
- **dismiss**: Ruleset setting that drops earlier reviews when new commits are pushed to a pull request.
- **dockerignore**: Docker build exclusion list in docker/.dockerignore keeping virtual environments out of the image context.
- **down**: Compose or Nx action that stops a local service container, the counterpart of up.
- **driver**: Log backend setting, json-file, applied to each Compose service in the local docker setup.
- **dynamic**: Terraform block that generates repeated nested blocks, such as one required_check per status check.
- **enforcement**: Ruleset state set to active so the main branch rules apply and cannot be turned off silently.
- **fullname**: Helm helper that builds the release name, truncated to 63 characters for Kubernetes DNS limits.
- **guardrail**: Backstop limiting what the refresh-documentation key may call, plus a monthly USD spending cap.
- **healthcheck**: Compose probe that marks a local service healthy, with interval and start_period timings.
- **history**: Commit record of main, kept straight by the ruleset's required_linear_history flag that rejects merges.
- **jsonencode**: Terraform function that serializes the preset request body into JSON for the OpenRouter call.
- **k8**: Abbreviation of Kubernetes that AGENTS.md uses for the Job chart's one-line description.
- **kubernete**: Container orchestration platform hosting the Linode LKE cluster that runs the Helm-deployed Jobs.
- **lifecycle**: Terraform meta-argument block guarding the repository, bucket, and access key with prevent_destroy.
- **linear**: Ruleset requirement named required_linear_history, which rejects any merge commit reaching the main branch.
- **lke**: Linode Kubernetes Engine, the managed service that Terraform provisions for the Helm jobs.
- **modelfile**: Ollama configuration file under docker that sets parameters like num_thread for a local coding model.
- **mount**: Path inside the container where the Job's persistent volume attaches, set by persistence.mountPath.
- **parallelism**: Number of Job pods allowed to run at once, set to one in base values and emitted only when above one.
- **period**: Compose healthcheck grace time, start_period, before a failing probe counts against the service.
- **persistence**: Helm values block that toggles a PVC and sets its mount path for the Job's output.
- **persistent**: Storage that outlives the pod, as the PVC does for Job output; PVCs are never deleted automatically.
- **plaintext**: Unencrypted value given to a github Terraform resource, used for the Nx Cloud read and write tokens.
- **pod**: Smallest deployable unit, here the Job's container instance that the chart schedules onto a node.
- **policy**: Image pull rule, pullPolicy, set to IfNotPresent in base values so cached images are reused.
- **pool**: Node pool block in the LKE cluster, sized with an autoscaler between one and three nodes.
- **preset**: OpenRouter ranked-model profile named by slug, which the refresh-documentation workflow calls as preset/slug.
- **prevent**: Terraform lifecycle argument, prevent_destroy, that blocks deleting the repository, state bucket, and key.
- **protection**: Guard set on main through the ruleset plus secret scanning push checks, blocking unreviewed merges.
- **provisioner**: Terraform local-exec step that runs the ruleset REST patch and the preset write after apply.
- **pvc**: PersistentVolumeClaim, the storage request template the chart renders to hold Job output across runs.
- **queue**: Ruleset block that serializes merges through GitHub's merge queue, retesting each pull request.
- **rebase**: Merge method left disabled, allow_rebase_merge false, so only squash merges reach main.
- **recreate**: Postgres target action that removes the volume and rebuilds the container, so it loses every row.
- **region**: Linode datacenter the LKE cluster and state bucket live in, set by linode_region and region variables.
- **replica**: Pod count per Helm release, replicaCount, left at one even though the chart runs Jobs.
- **restart**: Container restart policy; Compose services use unless-stopped, while the Job pod template uses Never.
- **review**: Code owner review the main ruleset requires on each pull request, though approving review count is zero.
- **ruleset**: GitHub branch policy object on main, declared by the github Terraform root as main_ruleset.
- **scan**: Trivy misconfiguration check run over the Terraform code, identical to the Secure Code workflow.
- **selector**: Label pair, name and instance, that matches pods to their Helm release for the Job.
- **sensitive**: Terraform flag hiding a variable or output value from plan and state display, set on every token and key.
- **signoff**: Repository setting requiring web-created commits to carry a Signed-off-by line, set true here.
- **slug**: URL-safe name of the OpenRouter workspace read at import, and the preset name in its @preset address.
- **spec**: Helm template portion describing the Job's desired state, such as its containers and volumes.
- **squash**: Only merge method allowed on main, with the pull request title and body as the single commit.
- **stale**: Outdated review left on earlier commit, which the ruleset dismisses once new commits are pushed.
- **thread**: Review conversation on a pull request diff that the ruleset requires to be resolved before merge.
- **threshold**: Security scan level that sets when code scanning alerts block a merge, errors or high severity.
- **toleration**: Helm list letting a Job schedule onto tainted nodes, empty in the base values by default.
- **topic**: Discovery label on the GitHub repository, declared as an empty list in the github Terraform root.
- **ttl**: Helm value ttlSecondsAfterFinished set to 86400 so a finished Job object is cleaned up after a day.
- **unsupported**: Ruleset rules the Terraform provider cannot model, patched back through the REST API after each update.
- **usd**: Currency unit, US dollars, for the monthly spend cap on the refresh-documentation guardrail.
- **visibility**: Repository setting that makes the GitHub repository public, set to public in the github root.
- **vulnerability**: Dependency alert from GitHub's vulnerability alerts, enabled for the repository in Terraform.
- **websocket**: Realtime connection mode for Open WebUI, disabled in Compose by ENABLE_WEBSOCKET_SUPPORT false.
- **webui**: Browser chat front end for the local models, served by the open-webui Compose service.
- **wiki**: GitHub documentation area for the repository, enabled by has_wiki, separate from the OpenWiki pages.

<!-- coinagerie:end -->
