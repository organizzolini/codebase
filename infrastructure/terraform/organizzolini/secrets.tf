# Platform secrets: what the shared Postgres cluster and the tunnel connector need.
resource "kubernetes_secret_v1" "postgres_backups" {
  metadata {
    name      = "postgres-backups"
    namespace = kubernetes_namespace_v1.organizzolini.metadata[0].name
  }

  data = {
    ACCESS_KEY_ID     = linode_object_storage_key.organizzolini_postgres_backups.access_key
    ACCESS_SECRET_KEY = linode_object_storage_key.organizzolini_postgres_backups.secret_key
  }
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
