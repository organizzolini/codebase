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
  description = "Region of that bucket."
  type        = string
  default     = "us-iad"
}

variable "s3_endpoint_name" {
  description = "Name of the bucket's S3 endpoint, the first label of its hostname."
  type        = string
  default     = "us-iad-18"
}
