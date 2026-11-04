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

variable "nx_cloud_read_only_token" {
  description = "Nx Cloud access token that can only read the remote cache, for pull request runs."
  type        = string
  sensitive   = true
}

variable "nx_cloud_read_write_token" {
  description = "Nx Cloud access token that can write the remote cache, for trusted runs on main."
  type        = string
  sensitive   = true
}
