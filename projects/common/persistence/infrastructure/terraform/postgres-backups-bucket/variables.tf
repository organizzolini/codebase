variable "label" {
  description = "Label of the Object Storage bucket CloudNativePG archives Postgres backups to, and of the key that reaches it."
  type        = string
}

variable "region" {
  description = "Region of the bucket, as the Linode API names it, such as us-iad-2."
  type        = string
}
