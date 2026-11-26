# The original bucket that held the state, imported as it is configured.
# Destroying it would delete that state, so Terraform refuses to.
import {
  to = linode_object_storage_bucket.state
  id = "${var.object_storage_region}:${var.bucket_label}"
}

resource "linode_object_storage_bucket" "state" {
  label         = var.bucket_label
  region        = var.object_storage_region
  endpoint_type = "E3"
  acl           = "private"

  lifecycle {
    prevent_destroy = true
  }
}

# The access key the backend authenticated with before the move, imported by its
# numeric ID from `linode-cli object-storage keys-list`. Terraform cannot read
# its secret key, so the key stays in the TERRAFORM_STATE_* secrets as it is.
# Destroying it would lock the backend out of its state until it is retired by hand.
import {
  to = linode_object_storage_key.state
  id = "7042178"
}

resource "linode_object_storage_key" "state" {
  label = var.bucket_label

  bucket_access {
    bucket_name = linode_object_storage_bucket.state.label
    region      = var.object_storage_region
    permissions = "read_write"
  }

  lifecycle {
    prevent_destroy = true
  }
}

# The bucket the state lives in. Linode cannot rename a bucket, so the original `state`
# bucket stays in place until it is retired by hand. Destroying this one deletes the state.
resource "linode_object_storage_bucket" "terraform_state" {
  label         = var.terraform_state_bucket_label
  region        = var.object_storage_region
  endpoint_type = "E3"
  acl           = "private"

  lifecycle {
    prevent_destroy = true
  }
}

# The access key the backend authenticates with, and CI's TERRAFORM_STATE_* secrets hold.
# Its secret is readable through `terraform output` in this root only, and goes
# into the TERRAFORM_STATE_* secrets by hand at the cutover.
resource "linode_object_storage_key" "terraform_state" {
  label = var.terraform_state_bucket_label

  bucket_access {
    bucket_name = linode_object_storage_bucket.terraform_state.label
    region      = var.object_storage_region
    permissions = "read_write"
  }

  lifecycle {
    prevent_destroy = true
  }
}

# The key Terraform uses for the cache bucket. It cannot be scoped to that bucket, since
# a scoped key needs the bucket to exist. It reaches every bucket in the account, so it
# stays out of the outputs and is never handed to CI.
resource "linode_object_storage_key" "nx_cache_provisioner" {
  label = "${var.nx_cache_bucket_label}-provisioner"
}

# The bucket behind the shared Nx cache: one object per task hash, under `nx/`.
# Entries are only a speed-up, so a lifecycle rule lets anything unused for
# thirty days go, and the bucket can be destroyed and refilled without loss.
resource "linode_object_storage_bucket" "nx_cache" {
  label         = var.nx_cache_bucket_label
  region        = var.object_storage_region
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
    region      = var.object_storage_region
    permissions = "read_only"
  }
}

# A read-only key for the developer machine that runs the local cache server,
# created by hand with `linode-cli object-storage keys-create` and imported by
# its numeric ID. Terraform cannot read its secret key, which lives only in
# ~/.config/codebase/nx-shared-cache-remote.env.
import {
  to = linode_object_storage_key.nx_cache_local_read_only
  id = "7248243"
}

resource "linode_object_storage_key" "nx_cache_local_read_only" {
  label = "${var.nx_cache_bucket_label}-local-read-only"

  bucket_access {
    bucket_name = linode_object_storage_bucket.nx_cache.label
    region      = var.object_storage_region
    permissions = "read_only"
  }
}

resource "linode_object_storage_key" "nx_cache_read_write" {
  label = "${var.nx_cache_bucket_label}-read-write"

  bucket_access {
    bucket_name = linode_object_storage_bucket.nx_cache.label
    region      = var.object_storage_region
    permissions = "read_write"
  }
}

# The bucket CloudNativePG archives Postgres WAL and base backups to. Barman
# runs the retention, so there is no lifecycle rule: one would expire backups
# Barman still needs. Destroying it deletes every backup, so Terraform refuses to.
resource "linode_object_storage_bucket" "organizzolini_postgres_backups" {
  label         = var.postgres_backups_bucket_label
  region        = var.object_storage_region
  endpoint_type = "E3"
  acl           = "private"

  lifecycle {
    prevent_destroy = true
  }
}

# The key CloudNativePG authenticates with. It reaches only the backups bucket,
# and a rotated key loses no backups, so it has no prevent_destroy.
resource "linode_object_storage_key" "organizzolini_postgres_backups" {
  label = var.postgres_backups_bucket_label

  bucket_access {
    bucket_name = linode_object_storage_bucket.organizzolini_postgres_backups.label
    region      = var.object_storage_region
    permissions = "read_write"
  }
}
