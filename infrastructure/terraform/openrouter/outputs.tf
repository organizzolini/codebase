output "refresh_documentation_model" {
  description = "Value for OPENWIKI_MODEL_ID in the Refresh Documentation workflow."
  value       = "@preset/${var.preset_slug}"
}
