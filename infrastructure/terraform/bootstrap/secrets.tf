resource "random_password" "caelundas_postgres" {
  length  = 32
  special = false
}

# The cluster reads the role's password from codebase; the apps read the same one from caelundas.
resource "kubernetes_secret_v1" "caelundas_postgres_codebase" {
  metadata {
    name      = "caelundas-postgres"
    namespace = kubernetes_namespace_v1.codebase.metadata[0].name
  }

  type = "kubernetes.io/basic-auth"

  data = {
    username = "caelundas_username"
    password = random_password.caelundas_postgres.result
  }
}

resource "kubernetes_secret_v1" "caelundas_postgres_caelundas" {
  metadata {
    name      = "caelundas-postgres"
    namespace = kubernetes_namespace_v1.caelundas.metadata[0].name
  }

  type = "kubernetes.io/basic-auth"

  data = {
    username = "caelundas_username"
    password = random_password.caelundas_postgres.result
  }
}

resource "kubernetes_secret_v1" "postgres_backups" {
  metadata {
    name      = "postgres-backups"
    namespace = kubernetes_namespace_v1.codebase.metadata[0].name
  }

  data = {
    ACCESS_KEY_ID     = data.terraform_remote_state.linode.outputs.postgres_backups_access_key
    ACCESS_SECRET_KEY = data.terraform_remote_state.linode.outputs.postgres_backups_secret_key
  }
}

resource "kubernetes_secret_v1" "cloudflared_token" {
  metadata {
    name      = "cloudflared-token"
    namespace = kubernetes_namespace_v1.codebase.metadata[0].name
  }

  data = {
    token = data.terraform_remote_state.kubernetes.outputs.tunnel_token
  }
}
