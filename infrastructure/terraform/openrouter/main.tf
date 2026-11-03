terraform {
  required_version = ">= 1.6"

  # State lives in a Linode Object Storage bucket, which speaks the S3 API. The
  # bucket comes from `-backend-config="bucket=..."`, the endpoint from
  # AWS_ENDPOINT_URL_S3, and the credentials from AWS_ACCESS_KEY_ID and
  # AWS_SECRET_ACCESS_KEY; see the `terraform-init` target. Linode does not
  # implement the AWS account, region, or checksum calls, so those are skipped.
  # There is no state lock: CI serializes applies with a workflow concurrency
  # group instead.
  backend "s3" {
    key    = "codebase/terraform.tfstate"
    region = "us-east-1"

    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    skip_s3_checksum            = true
  }

  required_providers {
    openrouter = {
      source  = "OpenRouterTeam/openrouter"
      version = "~> 0.3"
    }
  }
}

# The Management key administers OpenRouter and cannot spend credits. It is
# created by hand; everything below is managed from it.
provider "openrouter" {
  api_key = var.openrouter_management_key
}

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

# The key the refresh-documentation job already uses, found by name in the
# workspace and imported rather than created, so its value stays as it is in the
# `OPENROUTER_API_KEY` secret. `limit` and `limit_reset` are left out on purpose:
# a setting Terraform does not declare keeps the value the key has.
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
# OpenRouter's preset endpoint. The ranked list is `models`: OpenRouter tries
# the first and falls down the list on rate limits, downtime, context-length
# errors and moderation flags. A new version is saved whenever the list changes.
resource "terraform_data" "refresh_documentation_preset" {
  triggers_replace = [var.models, var.preset_slug]

  provisioner "local-exec" {
    command = <<-EOT
      curl --fail-with-body --silent --show-error \
        --request POST "https://openrouter.ai/api/v1/presets/$PRESET_SLUG/chat/completions" \
        --header "Authorization: Bearer $OPENROUTER_API_KEY" \
        --header "Content-Type: application/json" \
        --data "$PRESET_BODY"
    EOT

    environment = {
      PRESET_SLUG        = var.preset_slug
      OPENROUTER_API_KEY = var.openrouter_api_key
      PRESET_BODY = jsonencode({
        model  = var.models[0]
        models = var.models
      })
    }
  }
}
