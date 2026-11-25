output "kubeconfig" {
  description = "Decoded kubeconfig of the cluster, once its API answers."
  value       = base64decode(linode_lke_cluster.cluster.kubeconfig)
  sensitive   = true
  depends_on  = [terraform_data.cluster_ready]
}

output "cluster_id" {
  description = "ID of the LKE cluster."
  value       = linode_lke_cluster.cluster.id
}

output "tunnel_id" {
  description = "ID of the Cloudflare tunnel."
  value       = cloudflare_zero_trust_tunnel_cloudflared.cluster.id
}

output "tunnel_token" {
  description = "Token the cloudflared connector runs with."
  value       = data.cloudflare_zero_trust_tunnel_cloudflared_token.cluster.token
  sensitive   = true
}
