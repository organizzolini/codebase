variable "namespace" {
  description = "Namespace of the Postgres cluster, where the Secret must exist."
  type        = string
}

variable "access_key" {
  description = "Access key of the backups bucket's key."
  type        = string
  sensitive   = true
}

variable "secret_key" {
  description = "Secret key of the backups bucket's key."
  type        = string
  sensitive   = true
}
