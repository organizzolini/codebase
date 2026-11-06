output "nx_cache_bucket" {
  description = "Value for NX_CACHE_BUCKET: the bucket the shared Nx cache stores task outputs in."
  value       = linode_object_storage_bucket.nx_cache.label
}

output "nx_cache_endpoint" {
  description = "Value for NX_CACHE_ENDPOINT: the bucket's S3 endpoint."
  value       = "https://${linode_object_storage_bucket.nx_cache.s3_endpoint}"
}

output "nx_cache_read_only_access_key" {
  description = "Access key of the key that can only read the bucket, for pull request runs."
  value       = linode_object_storage_key.nx_cache_read_only.access_key
  sensitive   = true
}

output "nx_cache_read_only_secret_key" {
  description = "Secret key of the key that can only read the bucket, for pull request runs."
  value       = linode_object_storage_key.nx_cache_read_only.secret_key
  sensitive   = true
}

output "nx_cache_read_write_access_key" {
  description = "Access key of the key that can write the bucket, for trusted runs on main."
  value       = linode_object_storage_key.nx_cache_read_write.access_key
  sensitive   = true
}

output "nx_cache_read_write_secret_key" {
  description = "Secret key of the key that can write the bucket, for trusted runs on main."
  value       = linode_object_storage_key.nx_cache_read_write.secret_key
  sensitive   = true
}

output "terraform_state_bucket" {
  description = "Value for TERRAFORM_STATE_BUCKET once the state has moved."
  value       = linode_object_storage_bucket.terraform_state.label
}

output "terraform_state_endpoint" {
  description = "Value for TERRAFORM_STATE_ENDPOINT once the state has moved."
  value       = "https://${linode_object_storage_bucket.terraform_state.s3_endpoint}"
}

output "terraform_state_access_key" {
  description = "Value for TERRAFORM_STATE_ACCESS_KEY_ID once the state has moved."
  value       = linode_object_storage_key.terraform_state.access_key
  sensitive   = true
}

output "terraform_state_secret_key" {
  description = "Value for TERRAFORM_STATE_SECRET_ACCESS_KEY once the state has moved."
  value       = linode_object_storage_key.terraform_state.secret_key
  sensitive   = true
}
