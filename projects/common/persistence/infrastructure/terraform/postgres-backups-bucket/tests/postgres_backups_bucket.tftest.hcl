mock_provider "linode" {}

variables {
  label  = "organizzolini-postgres-backups"
  region = "us-iad-2"
}

run "the_backups_bucket_is_private_E3_in_the_given_region" {
  command = plan

  assert {
    condition     = linode_object_storage_bucket.backups.label == "organizzolini-postgres-backups"
    error_message = "The backups bucket must carry the label it is given."
  }

  assert {
    condition     = linode_object_storage_bucket.backups.acl == "private"
    error_message = "The backups bucket must be private."
  }

  assert {
    condition     = linode_object_storage_bucket.backups.endpoint_type == "E3"
    error_message = "The backups bucket must use the E3 endpoint type."
  }

  assert {
    condition     = linode_object_storage_bucket.backups.region == "us-iad-2"
    error_message = "The backups bucket must sit in the region it is given."
  }

  assert {
    condition     = output.bucket == "organizzolini-postgres-backups"
    error_message = "The bucket output must be the bucket's label."
  }
}

run "the_backups_key_can_reach_only_the_backups_bucket" {
  command = plan

  assert {
    condition     = [for access in linode_object_storage_key.backups.bucket_access : access.bucket_name] == [linode_object_storage_bucket.backups.label]
    error_message = "The backups key must have exactly one bucket_access block, naming the backups bucket."
  }

  assert {
    condition     = [for access in linode_object_storage_key.backups.bucket_access : access.permissions] == ["read_write"]
    error_message = "The backups key must be read_write on the backups bucket only."
  }
}
