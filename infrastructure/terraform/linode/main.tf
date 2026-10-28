terraform {
  required_version = ">= 1.6"

  # Same Linode Object Storage bucket and backend settings as the openrouter
  # root; see its main.tf. This root manages that bucket, which is safe because
  # the bucket is only imported and never destroyed.
  backend "s3" {
    key    = "codebase/linode.tfstate"
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
  }
}

# The token needs Object Storage read and write: with no access key given, the
# provider mints a temporary one to read and manage the bucket.
provider "linode" {
  token = var.linode_token
}

# The bucket that holds every root's state, imported as it is configured.
# Destroying it would delete that state, so Terraform refuses to.
import {
  to = linode_object_storage_bucket.state
  id = "${var.s3_endpoint_name}:${var.bucket_label}"
}

resource "linode_object_storage_bucket" "state" {
  label         = var.bucket_label
  region        = var.region
  endpoint_type = "E3"
  s3_endpoint   = "${var.s3_endpoint_name}.linodeobjects.com"
  acl           = "private"

  lifecycle {
    prevent_destroy = true
  }
}
