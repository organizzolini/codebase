mock_provider "linode" {}

# The root imports these three resources, and a mock provider cannot import.
# Overriding them lets the plan read them as if they already existed.
override_resource {
  target = linode_object_storage_bucket.state
}

override_resource {
  target = linode_object_storage_key.state
}

override_resource {
  target = linode_object_storage_key.nx_cache_local_read_only
}

variables {
  linode_token = "mock-token"
}

run "the_backups_bucket_is_private_E3_in_the_state_buckets_region" {
  command = plan

  assert {
    condition     = linode_object_storage_bucket.organizzolini_postgres_backups.label == "organizzolini-postgres-backups"
    error_message = "The backups bucket must carry the postgres_backups_bucket_label default."
  }

  assert {
    condition     = linode_object_storage_bucket.organizzolini_postgres_backups.acl == "private"
    error_message = "The backups bucket must be private."
  }

  assert {
    condition     = linode_object_storage_bucket.organizzolini_postgres_backups.endpoint_type == "E3"
    error_message = "The backups bucket must use the E3 endpoint type."
  }

  assert {
    condition     = linode_object_storage_bucket.organizzolini_postgres_backups.region == "us-iad-2"
    error_message = "The backups bucket must sit in the state bucket's region, us-iad-2."
  }
}

run "the_backups_key_can_reach_only_the_backups_bucket" {
  command = plan

  assert {
    condition     = [for access in linode_object_storage_key.organizzolini_postgres_backups.bucket_access : access.bucket_name] == [linode_object_storage_bucket.organizzolini_postgres_backups.label]
    error_message = "The backups key must have exactly one bucket_access block, naming the backups bucket."
  }

  assert {
    condition     = [for access in linode_object_storage_key.organizzolini_postgres_backups.bucket_access : access.permissions] == ["read_write"]
    error_message = "The backups key must be read_write on the backups bucket only."
  }
}
