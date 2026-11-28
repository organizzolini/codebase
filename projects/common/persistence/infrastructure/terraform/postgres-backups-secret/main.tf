terraform {
  required_version = ">= 1.7"

  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "3.5.0"
    }
  }
}

# The Secret the postgres chart's Barman ObjectStore reads its credentials from.
resource "kubernetes_secret_v1" "backups" {
  metadata {
    name      = "postgres-backups"
    namespace = var.namespace
  }

  data = {
    ACCESS_KEY_ID     = var.access_key
    ACCESS_SECRET_KEY = var.secret_key
  }
}
