terraform {
  required_version = ">= 1.7"

  # Same Linode Object Storage backend settings as the linode root; see its main.tf.
  backend "s3" {
    key    = "bootstrap.tfstate"
    region = "us-east-1"

    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    skip_s3_checksum            = true
  }

  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "3.5.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "3.3.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

# The kubernetes root's outputs: the cluster's kubeconfig and the tunnel token. It must be
# applied first, which the apply order in the Continuous Deployment workflow guarantees.
data "terraform_remote_state" "kubernetes" {
  backend = "s3"

  config = {
    bucket = var.state_bucket
    key    = "kubernetes.tfstate"
    region = "us-east-1"

    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    skip_s3_checksum            = true
  }
}

# The linode root's outputs: the Postgres backups bucket key.
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

locals {
  cluster = yamldecode(data.terraform_remote_state.kubernetes.outputs.kubeconfig)
  server  = local.cluster.clusters[0].cluster.server
  token   = local.cluster.users[0].user.token
  ca      = base64decode(local.cluster.clusters[0].cluster["certificate-authority-data"])
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
