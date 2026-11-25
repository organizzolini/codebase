terraform {
  required_version = ">= 1.7"

  # Same Linode Object Storage backend settings as the linode root; see its main.tf.
  backend "s3" {
    key    = "kubernetes.tfstate"
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
