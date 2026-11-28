output "bucket" {
  description = "Label of the backups bucket."
  value       = linode_object_storage_bucket.backups.label
}

output "access_key" {
  description = "Access key of the key that can read and write the backups bucket only."
  value       = linode_object_storage_key.backups.access_key
  sensitive   = true
}

output "secret_key" {
  description = "Secret key of the key that can read and write the backups bucket only."
  value       = linode_object_storage_key.backups.secret_key
  sensitive   = true
}
