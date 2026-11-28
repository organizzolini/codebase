output "name" {
  description = "Name of the namespace the Caelundas workloads run in."
  value       = kubernetes_namespace_v1.caelundas.metadata[0].name
}
