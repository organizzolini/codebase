terraform {
  required_version = ">= 1.7"

  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "3.5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

locals {
  role = "caelundas_username"
}

# The namespace every Caelundas workload runs in. The Argo CD applications do
# not set CreateNamespace, so Terraform creates it. It sits here because this
# is the one Caelundas project that is a package, as the infrastructure
# project, a package too, may depend on.
resource "kubernetes_namespace_v1" "caelundas" {
  metadata {
    name = "caelundas"
  }
}

resource "random_password" "caelundas_postgres" {
  length  = 32
  special = false
}

# The cluster reads the role's password from the platform namespace; the apps read the same one from caelundas.
resource "kubernetes_secret_v1" "platform" {
  metadata {
    name      = "caelundas-postgres"
    namespace = var.platform_namespace
  }

  type = "kubernetes.io/basic-auth"

  data = {
    username = local.role
    password = random_password.caelundas_postgres.result
  }
}

resource "kubernetes_secret_v1" "caelundas" {
  metadata {
    name      = "caelundas-postgres"
    namespace = kubernetes_namespace_v1.caelundas.metadata[0].name
  }

  type = "kubernetes.io/basic-auth"

  data = {
    username = local.role
    password = random_password.caelundas_postgres.result
  }
}
