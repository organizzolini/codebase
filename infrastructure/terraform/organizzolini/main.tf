terraform {
  required_version = ">= 1.7"

  # State lives in a Linode Object Storage bucket, which speaks the S3 API. The bucket,
  # endpoint, and credentials come from `-backend-config` and AWS_* environment variables.
  # Linode lacks the AWS account, region, and checksum calls.
  # No state lock: CI serializes applies with a workflow concurrency group.
  # This root manages the bucket it stores its state in, which is safe because
  # the bucket is only imported or created and never destroyed.
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
    openrouter = {
      source  = "OpenRouterTeam/openrouter"
      version = "~> 0.3"
    }
  }
}

# The token needs Object Storage and Kubernetes read and write: with no access key given,
# the provider mints a temporary one to read and manage the buckets.
provider "linode" {
  token = var.linode_token
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# GITHUB_TOKEN cannot write Actions variables or secrets, so this needs a fine-grained
# token or GitHub App token with Administration, Variables and Secrets write on the
# repository.
provider "github" {
  owner = var.owner
  token = var.github_token
}

# The kubernetes and helm providers are configured from the cluster this root
# creates, so the first plan shows only the cluster, and replacing it needs the
# Kubernetes and Helm resources gone from state first (see the README).
locals {
  kubeconfig = base64decode(linode_lke_cluster.organizzolini.kubeconfig)
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

# The Management key administers OpenRouter and cannot spend credits. It is
# created by hand; everything in openrouter.tf is managed from it.
provider "openrouter" {
  api_key = var.openrouter_management_key
}
