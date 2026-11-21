variable "openrouter_management_key" {
  description = "An OpenRouter Management API key (sk-or-mgmt-...)."
  type        = string
  sensitive   = true
}

variable "openrouter_api_key" {
  description = "The refresh-documentation key's value, used only to write the preset. Terraform cannot read the value of a key it imported."
  type        = string
  sensitive   = true
}

variable "refresh_documentation_key_name" {
  description = "Name of the existing OpenRouter key to import for the refresh-documentation job."
  type        = string
  default     = "Default key"
}

variable "workspace_id" {
  description = "ID of the existing OpenRouter workspace to import."
  type        = string
  default     = "a55a93d8-c818-5cf7-9119-f46e67835043"
}

variable "models" {
  description = "Models OpenRouter may route to, ranked: the first is tried first and each later one is a fallback when it is rate-limited, down or rejects the request. Only :free models are allowed, to keep requests free. Each needs tool calling and 16,384 output tokens, which the documentation refresh asks for, and the fallbacks come from other providers than the first."
  type        = list(string)
  default = [
    "nvidia/nemotron-3-ultra-550b-a55b:free",
    "google/gemma-4-31b-it:free",
    "inclusionai/ling-3.2-flash:free",
  ]

  validation {
    condition     = length(var.models) > 0
    error_message = "List at least one model."
  }

  validation {
    condition     = alltrue([for model in var.models : endswith(model, ":free")])
    error_message = "List only :free models, so requests stay free."
  }
}

variable "refresh_documentation_limit_usd" {
  description = "Monthly spend cap in USD for the refresh-documentation guardrail."
  type        = number
  default     = 5
}

variable "preset_slug" {
  description = "Slug of the preset the workflow calls as @preset/<slug>."
  type        = string
  default     = "refresh-documentation"
}
