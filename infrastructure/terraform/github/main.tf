terraform {
  required_version = ">= 1.6"

  # Same Linode Object Storage bucket and backend settings as the openrouter
  # root; see its main.tf. Only the state key differs.
  backend "s3" {
    key    = "codebase/github.tfstate"
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
  }
}

# GITHUB_TOKEN cannot write Actions variables or secrets, so this needs a
# fine-grained token or GitHub App token with Variables and Secrets write on
# the repository.
provider "github" {
  owner = var.owner
  token = var.github_token
}

# The openrouter root's outputs. It must be applied first, which the apply
# order in the Continuous Deployment workflow guarantees. The bucket comes
# from TF_VAR_state_bucket, the endpoint and credentials from the same
# environment variables as the backend above.
data "terraform_remote_state" "openrouter" {
  backend = "s3"

  config = {
    bucket = var.state_bucket
    key    = "codebase/terraform.tfstate"
    region = "us-east-1"

    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    skip_s3_checksum            = true
  }
}

# The model the Refresh Documentation workflow calls: the OpenRouter preset,
# so its ranked fallback list is changed in Terraform and not in the workflow.
resource "github_actions_variable" "openwiki_model_id" {
  repository    = var.repository
  variable_name = "OPENWIKI_MODEL_ID"
  value         = data.terraform_remote_state.openrouter.outputs.refresh_documentation_model
}
