<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses, regenerated with this project's `coinagerie-check:write` Nx target.

- **archiver**: PostgreSQL component that ships WAL segments to the backup store; the `isWALArchiver` plugin flag selects it.
- **argocd**: GitOps controller that syncs the cluster from this repository and runs the hook Jobs.
- **argoproj**: API group of Argo CD resources; the hook annotations carry it.
- **backup**: Copy of the database kept in object storage, taken by the scheduled backup and used for restores.
- **barman**: Backup and recovery tool that the Barman Cloud plugin runs against the object store.
- **capability**: Linux privilege a container can hold; the cloudflared pods drop all of them.
- **cloudflared**: Cloudflare Tunnel connector that dials out from the cluster, so it needs no Service.
- **conn**: Short for connection, as in the PgBouncer `max_client_conn` limit on client connections.
- **escalation**: Privilege gain after a process starts; `allowPrivilegeEscalation: false` blocks it.
- **heal**: Argo CD's self-healing, which reverts a live object that drifts from the repository; the `selfHeal` sync policy enables it.
- **liveness**: Probe that restarts a container when its health endpoint stops answering.
- **pgbouncer**: Connection pooler that sits in front of PostgreSQL and multiplexes client connections.
- **pooler**: PgBouncer deployment that the apps connect through, rather than the database directly.
- **preemption**: the scheduler evicting a lower-priority pod to fit a higher one; `batch-low` sets `preemptionPolicy: Never` to opt out.
- **profile**: Named security policy applied to a container, such as the `RuntimeDefault` seccomp profile.
- **seccomp**: Linux kernel filter that limits which system calls a container may make.
- **tftest**: Terraform test file, written in HCL and read by `terraform test` against mock providers, so it needs no credentials.
- **visibility**: Repository setting that makes the GitHub repository public, set to public in the github root.
- **wal**: Write-ahead log, the sequence of changes that backups archive for point-in-time recovery.

<!-- coinagerie:end -->
