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
  id = "${var.region}:${var.bucket_label}"
}

resource "linode_object_storage_bucket" "state" {
  label         = var.bucket_label
  region        = var.region
  endpoint_type = "E3"
  acl           = "private"

  lifecycle {
    prevent_destroy = true
  }
}

# The access key the other roots' backends authenticate with, imported by its
# numeric ID from `linode-cli object-storage keys-list`. Terraform cannot read
# its secret key, so the key stays in the TERRAFORM_STATE_* secrets as it is.
# Destroying it would lock every root out of its state.
import {
  to = linode_object_storage_key.state
  id = "7042178"
}

resource "linode_object_storage_key" "state" {
  label = var.bucket_label

  bucket_access {
    bucket_name = linode_object_storage_bucket.state.label
    region      = var.region
    permissions = "read_write"
  }

  lifecycle {
    prevent_destroy = true
  }
}

# The bucket the state is moving to, named for what it holds. Linode cannot
# rename a bucket, so the original `state` bucket above stays in place and
# keeps serving every root until the cutover in infrastructure/AGENTS.md
# is done by hand. Destroying this one would delete the state it holds.
resource "linode_object_storage_bucket" "terraform_state" {
  label         = var.terraform_state_bucket_label
  region        = var.region
  endpoint_type = "E3"
  acl           = "private"

  lifecycle {
    prevent_destroy = true
  }
}

# The access key the other roots' backends authenticate with once they move.
# Its secret is readable through `terraform output` in this root only, and goes
# into the TERRAFORM_STATE_* secrets by hand at the cutover.
resource "linode_object_storage_key" "terraform_state" {
  label = var.terraform_state_bucket_label

  bucket_access {
    bucket_name = linode_object_storage_bucket.terraform_state.label
    region      = var.region
    permissions = "read_write"
  }

  lifecycle {
    prevent_destroy = true
  }
}

# The key Terraform uses to configure the cache bucket. It cannot be scoped to
# that bucket: a key's `bucket_access` needs the bucket to exist, and the bucket
# needs a key to exist first. It reaches every bucket in the account, so it is
# kept out of the outputs and never handed to CI.
resource "linode_object_storage_key" "nx_cache_provisioner" {
  label = "${var.nx_cache_bucket_label}-provisioner"
}

# The bucket behind the shared Nx cache: one object per task hash, under `nx/`.
# Entries are only a speed-up, so a lifecycle rule lets anything unused for
# thirty days go, and the bucket can be destroyed and refilled without loss.
resource "linode_object_storage_bucket" "nx_cache" {
  label         = var.nx_cache_bucket_label
  region        = var.region
  endpoint_type = "E3"
  acl           = "private"

  # The provider sets a lifecycle rule through the bucket's own S3 API, so it
  # needs credentials the bucket cannot supply for itself.
  access_key = linode_object_storage_key.nx_cache_provisioner.access_key
  secret_key = linode_object_storage_key.nx_cache_provisioner.secret_key

  lifecycle_rule {
    id      = "expire-unused-cache-entries"
    enabled = true

    expiration {
      days = 30
    }
  }
}

# Two keys on that bucket, and the permission is what keeps a pull request out
# of what `main` reads: the cache server's own read-only flag can be edited by
# the pull request, but a read-only key cannot write whatever runs with it.
resource "linode_object_storage_key" "nx_cache_read_only" {
  label = "${var.nx_cache_bucket_label}-read-only"

  bucket_access {
    bucket_name = linode_object_storage_bucket.nx_cache.label
    region      = var.region
    permissions = "read_only"
  }
}

resource "linode_object_storage_key" "nx_cache_read_write" {
  label = "${var.nx_cache_bucket_label}-read-write"

  bucket_access {
    bucket_name = linode_object_storage_bucket.nx_cache.label
    region      = var.region
    permissions = "read_write"
  }
}
