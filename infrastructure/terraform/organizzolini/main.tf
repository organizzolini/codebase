terraform {
  required_version = ">= 1.7"

  # Same Linode Object Storage backend settings as the linode root; see its main.tf.
  backend "s3" {
    key    = "organizzolini.tfstate"
    region = "us-east-1"

    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    skip_s3_checksum            = true
  }

  required_providers {
    linode = {
      source  = "linode/linode"
      version = "~> 4.8"
    }
    # Pinned exactly: a v5 minor can rename attributes, and the tunnel config depends on them.
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "5.28.1"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "3.5.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "3.3.0"
    }
    github = {
      source  = "integrations/github"
      version = "~> 6.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

provider "linode" {
  token = var.linode_token
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# GITHUB_TOKEN cannot write Actions secrets, so this needs a fine-grained token or
# GitHub App token with Secrets write on the repository.
provider "github" {
  owner = var.owner
  token = var.github_token
}

# The kubernetes and helm providers are configured from the cluster this root creates.
# That is accepted for one cluster and one maintainer, with two known caveats: the
# configuration is unknown at plan time until the cluster exists, so the first plan can
# only show the cluster and its dependents, and replacing or destroying the cluster needs
# the Kubernetes and Helm resources removed from state or destroyed first.
locals {
  kubeconfig = base64decode(linode_lke_cluster.organizzolini_codebase.kubeconfig)
  cluster    = yamldecode(local.kubeconfig)
  server     = local.cluster.clusters[0].cluster.server
  token      = local.cluster.users[0].user.token
  ca         = base64decode(local.cluster.clusters[0].cluster["certificate-authority-data"])
}

provider "kubernetes" {
  host                   = local.server
  token                  = local.token
  cluster_ca_certificate = local.ca
}

provider "helm" {
  kubernetes = {
    host                   = local.server
    token                  = local.token
    cluster_ca_certificate = local.ca
  }
}

# The linode root's outputs: the Postgres backups bucket key. Every read is wrapped in
# `try`, since a pull request can plan before the linode root has applied its new outputs.
data "terraform_remote_state" "linode" {
  backend = "s3"

  config = {
    bucket = var.state_bucket
    key    = "linode.tfstate"
    region = "us-east-1"

    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    skip_s3_checksum            = true
  }
}
