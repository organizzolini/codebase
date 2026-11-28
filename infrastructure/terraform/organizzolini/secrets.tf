# Platform secrets: what the shared Postgres cluster and the tunnel connector need.
module "postgres_backups_secret" {
  source = "../../../projects/common/persistence/infrastructure/terraform/postgres-backups-secret"

  namespace  = kubernetes_namespace_v1.organizzolini.metadata[0].name
  access_key = try(data.terraform_remote_state.linode.outputs.organizzolini_postgres_backups_access_key, "")
  secret_key = try(data.terraform_remote_state.linode.outputs.organizzolini_postgres_backups_secret_key, "")
}

# The Secret was a resource of this root before moving into the module.
moved {
  from = kubernetes_secret_v1.postgres_backups
  to   = module.postgres_backups_secret.kubernetes_secret_v1.backups
}

resource "kubernetes_secret_v1" "cloudflared_token" {
  metadata {
    name      = "cloudflared-token"
    namespace = kubernetes_namespace_v1.organizzolini.metadata[0].name
  }

  data = {
    token = data.cloudflare_zero_trust_tunnel_cloudflared_token.organizzolini.token
  }
}
