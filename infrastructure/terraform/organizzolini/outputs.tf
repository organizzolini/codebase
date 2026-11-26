output "cluster_id" {
  description = "ID of the LKE cluster."
  value       = linode_lke_cluster.organizzolini_codebase.id
}

output "tunnel_id" {
  description = "ID of the Cloudflare tunnel."
  value       = cloudflare_zero_trust_tunnel_cloudflared.organizzolini_codebase.id
}
