# The existing workspace, read for its current name and slug so that importing
# it plans no change, then imported on the first apply rather than created.
data "openrouter_workspace" "codebase" {
  id = var.workspace_id
}

import {
  to = openrouter_workspace.codebase
  id = var.workspace_id
}

resource "openrouter_workspace" "codebase" {
  name = data.openrouter_workspace.codebase.name
  slug = data.openrouter_workspace.codebase.slug
}

# Backstop for the preset: whatever the ranked list says, the key can only call
# these models and can only spend up to the cap.
resource "openrouter_guardrail" "refresh_documentation" {
  name           = "refresh-documentation"
  workspace_id   = openrouter_workspace.codebase.id
  allowed_models = var.models
  limit_usd      = var.refresh_documentation_limit_usd
  reset_interval = "monthly"
}

# The key the refresh-documentation job already uses, imported by name rather than created,
# so its value stays as it is in the `OPENROUTER_API_KEY` secret. `limit` and `limit_reset`
# are left out on purpose: an undeclared setting keeps the value the key already has.
data "openrouter_api_keys" "workspace" {
  workspace_id = var.workspace_id
}

locals {
  refresh_documentation_key = one([
    for key in data.openrouter_api_keys.workspace.data : key
    if key.name == var.refresh_documentation_key_name
  ])
}

import {
  to = openrouter_api_key.refresh_documentation
  id = local.refresh_documentation_key.hash
}

resource "openrouter_api_key" "refresh_documentation" {
  name         = local.refresh_documentation_key.name
  workspace_id = openrouter_workspace.codebase.id
}

resource "openrouter_guardrail_key_assignment" "refresh_documentation" {
  guardrail_id = openrouter_guardrail.refresh_documentation.id
  key_hash     = openrouter_api_key.refresh_documentation.hash
}

# The provider has no preset resource, so the preset is written through
# OpenRouter's preset endpoint, which accepts only a management key. OpenRouter
# tries `models` in order, falling down the list on rate limits, downtime,
# context-length errors and moderation flags. A new version is saved whenever
# the list changes.
resource "terraform_data" "refresh_documentation_preset" {
  triggers_replace = [var.models, var.preset_slug]

  provisioner "local-exec" {
    command = <<-EOT
      curl --fail-with-body --silent --show-error \
        --request POST "https://openrouter.ai/api/v1/presets/$PRESET_SLUG/chat/completions" \
        --header "Authorization: Bearer $OPENROUTER_MANAGEMENT_KEY" \
        --header "Content-Type: application/json" \
        --data "$PRESET_BODY"
    EOT

    environment = {
      PRESET_SLUG               = var.preset_slug
      OPENROUTER_MANAGEMENT_KEY = var.openrouter_management_key
      PRESET_BODY = jsonencode({
        model        = var.models[0]
        models       = var.models
        workspace_id = openrouter_workspace.codebase.id
      })
    }
  }
}
