terraform {
  required_version = ">= 1.7"

  required_providers {
    linode = {
      source  = "linode/linode"
      version = "~> 4.8"
    }
  }
}

# The bucket CloudNativePG archives Postgres WAL and base backups to. Barman
# runs the retention, so there is no lifecycle rule: one would expire backups
# Barman still needs. Destroying it deletes every backup, so Terraform refuses to.
resource "linode_object_storage_bucket" "backups" {
  label         = var.label
  region        = var.region
  endpoint_type = "E3"
  acl           = "private"

  lifecycle {
    prevent_destroy = true
  }
}

# The key CloudNativePG authenticates with. It reaches only the backups bucket,
# and a rotated key loses no backups, so it has no prevent_destroy.
resource "linode_object_storage_key" "backups" {
  label = var.label

  bucket_access {
    bucket_name = linode_object_storage_bucket.backups.label
    region      = var.region
    permissions = "read_write"
  }
}
