# Everything Terraform owns for Caelundas: its namespace and its database role's password.
# The Argo CD applications do not set CreateNamespace, so this root creates the namespace.
resource "kubernetes_namespace_v1" "caelundas" {
  metadata {
    name = "caelundas"
  }

  depends_on = [terraform_data.cluster_ready]
}

resource "random_password" "caelundas_postgres" {
  length  = 32
  special = false
}

# The cluster reads the role's password from organizzolini; the apps read the same one from caelundas.
resource "kubernetes_secret_v1" "caelundas_postgres_organizzolini" {
  metadata {
    name      = "caelundas-postgres"
    namespace = kubernetes_namespace_v1.organizzolini.metadata[0].name
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
