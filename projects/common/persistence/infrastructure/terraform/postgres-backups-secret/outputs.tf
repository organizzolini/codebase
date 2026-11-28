output "name" {
  description = "Name of the Secret, which the chart's ObjectStore refers to."
  value       = kubernetes_secret_v1.backups.metadata[0].name
}
