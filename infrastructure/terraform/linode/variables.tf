variable "linode_token" {
  description = "A Linode API token with Object Storage read and write."
  type        = string
  sensitive   = true
}

variable "bucket_label" {
  description = "Label of the Object Storage bucket that holds Terraform state."
  type        = string
  default     = "organizzolini"
}

variable "region" {
  description = "Region of that bucket, as the Linode API names it: us-iad-2, whose S3 endpoint is us-iad-18."
  type        = string
  default     = "us-iad-2"
}
