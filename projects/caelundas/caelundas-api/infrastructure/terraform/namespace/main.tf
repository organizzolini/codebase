terraform {
  required_version = ">= 1.7"

  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "3.5.0"
    }
  }
}

# The namespace every Caelundas workload runs in: the api, web, and cli, and the
# database Secret they read. The Argo CD applications do not set CreateNamespace,
# so Terraform creates it, and the api is the deployment's primary owner.
resource "kubernetes_namespace_v1" "caelundas" {
  metadata {
    name = "caelundas"
  }
}
