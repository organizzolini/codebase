variable "openrouter_management_key" {
  description = "An OpenRouter Management API key (sk-or-mgmt-...)."
  type        = string
  sensitive   = true
}

variable "workspace_slug" {
  description = "Slug of the existing OpenRouter workspace to import."
  type        = string
}

variable "workspace_name" {
  description = "Name of the existing OpenRouter workspace, so the import plans no rename."
  type        = string
}

variable "models" {
  description = "Models OpenRouter may route to, ranked: the first is tried first and each later one is a fallback. List only :free models to keep requests free."
  type        = list(string)

  validation {
    condition     = length(var.models) > 0
    error_message = "List at least one model."
  }
}

variable "refresh_documentation_limit_usd" {
  description = "Monthly spend cap in USD for the key and its guardrail."
  type        = number
  default     = 5
}

variable "preset_slug" {
  description = "Slug of the preset the workflow calls as @preset/<slug>."
  type        = string
  default     = "docs-refresh"
}
