variable "github_token" {
  description = "A token that can write Actions variables and secrets on the repository."
  type        = string
  sensitive   = true
}

variable "state_bucket" {
  description = "Bucket that holds the openrouter root's state, read for its outputs."
  type        = string
}

variable "owner" {
  description = "Account or organization that owns the repository."
  type        = string
  default     = "Organizzolini"
}

variable "repository" {
  description = "Repository whose Actions variables this root manages."
  type        = string
  default     = "codebase"
}
