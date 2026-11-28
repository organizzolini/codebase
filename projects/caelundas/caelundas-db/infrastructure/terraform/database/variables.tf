variable "namespace" {
  description = "Namespace of the Caelundas workloads, which read the role's password."
  type        = string
}

variable "platform_namespace" {
  description = "Namespace of the shared Postgres cluster, which reads the role's password."
  type        = string
}
