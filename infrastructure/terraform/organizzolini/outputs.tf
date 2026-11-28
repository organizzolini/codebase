output "kubeconfig" {
  description = "The cluster's decoded kubeconfig, for operators: terraform output -raw kubeconfig."
  value       = local.kubeconfig
  sensitive   = true
}
