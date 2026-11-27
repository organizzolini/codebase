variable "linode_token" {
  description = "A Linode API token that can create LKE clusters."
  type        = string
  sensitive   = true
}

variable "cloudflare_api_token" {
  description = "A Cloudflare API token scoped as the README's Terraform section describes."
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare account that owns the tunnel."
  type        = string
}

variable "cloudflare_zone_id" {
  description = "ID of the existing organizzolini.net zone, imported rather than created."
  type        = string
}

variable "region" {
  description = "Linode region of the cluster."
  type        = string
  default     = "us-iad"
}

variable "node_type" {
  description = "Linode plan of each node in the cluster pool."
  type        = string
  default     = "g6-standard-2"
}

variable "hostname" {
  description = "Public host the tunnel serves."
  type        = string
  default     = "caelundas.organizzolini.net"
}

variable "github_token" {
  description = "A token that can write Actions secrets on the repository."
  type        = string
  sensitive   = true
}

variable "owner" {
  description = "Account or organization that owns the repository."
  type        = string
  default     = "organizzolini"
}

variable "repository" {
  description = "Repository that receives the KUBECONFIG Actions secret."
  type        = string
  default     = "codebase"
}

variable "state_bucket" {
  description = "Bucket that holds the linode root's state, read for its outputs."
  type        = string
}
