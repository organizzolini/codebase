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

run "the_backups_module_gets_the_label_default" {
  command = plan

  assert {
    condition     = module.postgres_backups.bucket == "organizzolini-postgres-backups"
    error_message = "The backups module must carry the postgres_backups_bucket_label default."
  }
}
