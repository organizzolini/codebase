<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses, regenerated with this project's `coinagerie-check:write` Nx target.

- **archiver**: PostgreSQL component that ships WAL segments to the backup store; the `isWALArchiver` plugin flag selects it.
- **argo**: Argo CD, whose Helm repository and chart the bootstrap root installs.
- **argocd**: GitOps controller that syncs the cluster from this repository and runs the hook Jobs.
- **argoproj**: API group of Argo CD resources; the hook annotations carry it.
- **autoscaling**: Node pool scaling that adds or removes nodes between the pool's `min` and `max`, set by the cluster's autoscaler.
- **availability**: Control plane setting: `high_availability` runs more copies of it, and the kubernetes root keeps it off.
- **backup**: Copy of the database kept in object storage, taken by the scheduled backup and used for restores.
- **barman**: Backup and recovery tool that the Barman Cloud plugin runs against the object store.
- **ca**: Certificate authority; the bootstrap root decodes the cluster's CA from the kubeconfig to trust the API server.
- **cainjector**: cert-manager component that injects the certificate authority into webhook configurations and CRDs; it gets its own memory limits.
- **capability**: Linux privilege a container can hold; the cloudflared pods drop all of them.
- **certificate**: Certificate that a TLS client trusts; the kubeconfig carries the cluster's certificate authority data.
- **cloudflare**: DNS and edge provider that serves the public host and runs the tunnel.
- **cloudflared**: Cloudflare Tunnel connector that dials out from the cluster, so it needs no Service.
- **cm**: Short for ConfigMap, as in the Argo CD `configs.cm` values that hold the Application health check.
- **cname**: DNS record that aliases one name to another; the caelundas record points at the tunnel's `cfargotunnel.com` name.
- **conn**: Short for connection, as in the PgBouncer `max_client_conn` limit on client connections.
- **dex**: Argo CD's single sign-on component, disabled in the core profile.
- **escalation**: Privilege gain after a process starts; `allowPrivilegeEscalation: false` blocks it.
- **heal**: Argo CD's self-healing, which reverts a live object that drifts from the repository; the `selfHeal` sync policy enables it.
- **ingress**: Tunnel rule list that maps a hostname and path to a service; the last rule answers 404.
- **liveness**: Probe that restarts a container when its health endpoint stops answering.
- **organizzolini**: GitHub organization and the `organizzolini.net` domain that this project's resources live under.
- **pgbouncer**: Connection pooler that sits in front of PostgreSQL and multiplexes client connections.
- **plane**: Control plane of the Kubernetes cluster: the API server and controllers that Linode runs.
- **pooler**: PgBouncer deployment that the apps connect through, rather than the database directly.
- **preemption**: the scheduler evicting a lower-priority pod to fit a higher one; `batch-low` sets `preemptionPolicy: Never` to opt out.
- **profile**: Named security policy applied to a container, such as the `RuntimeDefault` seccomp profile.
- **proxied**: DNS record that Cloudflare answers for itself, hiding the origin; the caelundas record is proxied.
- **redi**: Headword of Redis, the cache Argo CD runs, whose memory limit the core profile sets.
- **seccomp**: Linux kernel filter that limits which system calls a container may make.
- **sidecar**: Helper container that runs beside the Postgres container in the same pod; the Barman plugin ships WAL and backups from one.
- **startupapicheck**: cert-manager hook Job that waits for the webhook to answer before the install finishes.
- **tftest**: Terraform test file, written in HCL and read by `terraform test` against mock providers, so it needs no credentials.
- **tunnel**: Cloudflare Tunnel: an outbound connection from the cluster to Cloudflare that carries the public traffic in.
- **visibility**: Repository setting that makes the GitHub repository public, set to public in the github root.
- **wal**: Write-ahead log, the sequence of changes that backups archive for point-in-time recovery.
- **webhook**: Admission endpoint that the Kubernetes API server calls to validate or change an object; cert-manager and CloudNativePG each run one.
- **yamldecode**: Terraform function that parses a YAML string; the bootstrap root uses it on the kubeconfig and on rendered chart values.
- **yamlencode**: Terraform function that renders a value as YAML; the bootstrap root uses it for the root Application values.

<!-- coinagerie:end -->
