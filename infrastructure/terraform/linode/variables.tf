variable "linode_token" {
  description = "A Linode API token with Object Storage read and write."
  type        = string
  sensitive   = true
}

variable "bucket_label" {
  description = "Label of the original Object Storage bucket that holds Terraform state until the move to terraform_state_bucket_label is finished."
  type        = string
  default     = "organizzolini"
}

variable "region" {
  description = "Region of that bucket, as the Linode API names it: us-iad-2, whose S3 endpoint is us-iad-18."
  type        = string
  default     = "us-iad-2"
}

variable "nx_cache_bucket_label" {
  description = "Label of the Object Storage bucket the shared Nx cache stores task outputs in."
  type        = string
  default     = "organizzolini-codebase-nx-cache"
}

variable "terraform_state_bucket_label" {
  description = "Label of the Object Storage bucket the Terraform state moves to."
  type        = string
  default     = "organizzolini-codebase-terraform-state"
}
