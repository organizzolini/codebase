terraform {
  required_version = ">= 1.6"

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
    github = {
      source  = "integrations/github"
      version = "~> 6.0"
    }
    linode = {
      source  = "linode/linode"
      version = "~> 4.8"
    }
    openrouter = {
      source  = "OpenRouterTeam/openrouter"
      version = "~> 0.3"
    }
  }
}

# The token needs Object Storage read and write: with no access key given, the
# provider mints a temporary one to read and manage the buckets.
provider "linode" {
  token = var.linode_token
}

# GITHUB_TOKEN cannot write Actions variables or secrets, so this needs a
# fine-grained token or GitHub App token with Variables and Secrets write on
# the repository.
provider "github" {
  owner = var.owner
  token = var.github_token
}

# The Management key administers OpenRouter and cannot spend credits. It is
# created by hand; everything in openrouter.tf is managed from it.
provider "openrouter" {
  api_key = var.openrouter_management_key
}
