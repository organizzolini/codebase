output "cluster_id" {
  description = "ID of the LKE cluster."
  value       = linode_lke_cluster.organizzolini.id
}

output "tunnel_id" {
  description = "ID of the Cloudflare tunnel."
  value       = cloudflare_zero_trust_tunnel_cloudflared.organizzolini.id
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
