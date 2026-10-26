output "refresh_documentation_api_key" {
  description = "Value for the OPENROUTER_API_KEY repository secret."
  value       = openrouter_api_key.refresh_documentation.key
  sensitive   = true
}

output "refresh_documentation_model" {
  description = "Value for OPENWIKI_MODEL_ID in the Refresh Documentation workflow."
  value       = "@preset/${var.preset_slug}"
}
