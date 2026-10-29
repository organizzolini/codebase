terraform {
  required_version = ">= 1.6"

  # Same Linode Object Storage bucket and backend settings as the openrouter
  # root; see its main.tf. Only the state key differs.
  backend "s3" {
    key    = "codebase/github.tfstate"
    region = "us-east-1"

    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    skip_s3_checksum            = true
  }

  required_providers {
    github = {
      source  = "integrations/github"
      version = "~> 6.0"
    }
  }
}

# GITHUB_TOKEN cannot write Actions variables or secrets, so this needs a
# fine-grained token or GitHub App token with Variables and Secrets write on
# the repository.
provider "github" {
  owner = var.owner
  token = var.github_token
}

# The openrouter root's outputs. It must be applied first, which the apply
# order in the Continuous Deployment workflow guarantees. The bucket comes
# from TF_VAR_state_bucket, the endpoint and credentials from the same
# environment variables as the backend above.
data "terraform_remote_state" "openrouter" {
  backend = "s3"

  config = {
    bucket = var.state_bucket
    key    = "codebase/terraform.tfstate"
    region = "us-east-1"

    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    skip_s3_checksum            = true
  }
}

# The model the Refresh Documentation workflow calls: the OpenRouter preset,
# so its ranked fallback list is changed in Terraform and not in the workflow.
resource "github_actions_variable" "openwiki_model_id" {
  repository    = var.repository
  variable_name = "OPENWIKI_MODEL_ID"
  value         = data.terraform_remote_state.openrouter.outputs.refresh_documentation_model
}

# The repository itself, imported as it is configured. Destroying it would
# delete the codebase, so Terraform refuses to, and archives it if it ever does.
import {
  to = github_repository.codebase
  id = var.repository
}

resource "github_repository" "codebase" {
  name               = var.repository
  description        = "organizzolini codebase"
  visibility         = "public"
  topics             = []
  archive_on_destroy = true

  has_discussions = true
  has_issues      = true
  has_projects    = true
  has_wiki        = true

  # Squash merges only, with the pull request title and body as the commit.
  allow_merge_commit          = false
  allow_rebase_merge          = false
  allow_squash_merge          = true
  squash_merge_commit_title   = "PR_TITLE"
  squash_merge_commit_message = "PR_BODY"

  # Merge commits are off; these are the values the repository holds, which the
  # provider would otherwise replace with its own defaults.
  merge_commit_title   = "PR_TITLE"
  merge_commit_message = "BLANK"

  allow_auto_merge            = true
  allow_update_branch         = true
  delete_branch_on_merge      = true
  web_commit_signoff_required = true

  security_and_analysis {
    secret_scanning {
      status = "enabled"
    }
    secret_scanning_push_protection {
      status = "enabled"
    }
  }

  lifecycle {
    prevent_destroy = true
  }
}

import {
  to = github_repository_dependabot_security_updates.codebase
  id = var.repository
}

resource "github_repository_dependabot_security_updates" "codebase" {
  repository = github_repository.codebase.name
  enabled    = true
}

import {
  to = github_repository_vulnerability_alerts.codebase
  id = var.repository
}

resource "github_repository_vulnerability_alerts" "codebase" {
  repository = github_repository.codebase.name
  enabled    = true
}

# The ruleset on the default branch, imported as it is configured.
#
# The provider cannot express two parts of it: the `code_quality` rule and
# `require_extra_approval_for_unattributed_changes` on the pull request rule.
# GitHub replaces a ruleset's rules whenever it is updated, so
# `terraform_data.main_ruleset_unsupported_rules` patches both back through the
# GitHub REST API whenever `github_repository_ruleset.main.rules` changes.
import {
  to = github_repository_ruleset.main
  id = "${var.repository}:12030459"
}

locals {
  # GitHub Actions, the app every required check comes from.
  github_actions_integration_id = 15368

  required_checks = [
    "🧑‍🎨 Format",
    "🧑‍🎓 Typecheck",
    "🕵️ Secure",
    "💂 Guard",
    "👷 Build",
    "🧑‍⚕️ Lint",
    "🧟 Deprecate",
    "🤵 Publishable Packages",
    "🧑‍🚀 Infrastructure",
    "🧑‍🏭 Devcontainer",
    "👮 Enforce",
    "🧑‍⚖️ Comply",
    "🧑‍🔬 Test Affirmancy",
    "🧑‍🔬 Test Caelundas",
    "🧑‍🔬 Test Codebase",
    "🧑‍🔬 Test Common",
    "🧑‍🔬 Test IC Suite",
    "🧑‍🔬 Test Lexico",
    "🧑‍🔬 Test Meanderaw",
  ]
}

resource "github_repository_ruleset" "main" {
  name        = "main"
  repository  = github_repository.codebase.name
  target      = "branch"
  enforcement = "active"

  # GitHub reports no ID for this actor, which the provider reads as 0.
  bypass_actors {
    actor_id    = 0
    actor_type  = "OrganizationAdmin"
    bypass_mode = "always"
  }

  conditions {
    ref_name {
      include = ["~DEFAULT_BRANCH"]
      exclude = []
    }
  }

  rules {
    non_fast_forward        = true
    required_linear_history = true
    required_signatures     = true

    pull_request {
      allowed_merge_methods             = ["squash"]
      dismiss_stale_reviews_on_push     = true
      require_code_owner_review         = true
      require_last_push_approval        = false
      required_approving_review_count   = 0
      required_review_thread_resolution = true
    }

    required_status_checks {
      do_not_enforce_on_create             = true
      strict_required_status_checks_policy = false

      dynamic "required_check" {
        for_each = local.required_checks

        content {
          context        = required_check.value
          integration_id = local.github_actions_integration_id
        }
      }
    }

    required_code_scanning {
      required_code_scanning_tool {
        alerts_threshold          = "errors"
        security_alerts_threshold = "high_or_higher"
        tool                      = "CodeQL"
      }
    }

    merge_queue {
      check_response_timeout_minutes    = 32
      grouping_strategy                 = "ALLGREEN"
      max_entries_to_build              = 6
      max_entries_to_merge              = 6
      merge_method                      = "SQUASH"
      min_entries_to_merge              = 1
      min_entries_to_merge_wait_minutes = 6
    }
  }
}

# Re-applies the two ruleset settings `integrations/github` does not model yet
# (`code_quality` and `pull_request.require_extra_approval_for_unattributed_changes`)
# after any apply that updates `github_repository_ruleset.main`. The provider
# ignores both on read, so restoring them does not cause drift on subsequent plans.
resource "terraform_data" "main_ruleset_unsupported_rules" {
  triggers_replace = [
    github_repository_ruleset.main.rules,
  ]

  provisioner "local-exec" {
    command = <<-EOT
      gh api "repos/$OWNER/$REPOSITORY/rulesets/$RULESET_ID" \
        | jq '{
            name,
            target,
            enforcement,
            bypass_actors: [.bypass_actors[] | {actor_id, actor_type, bypass_mode}],
            conditions,
            rules: (
              [
                .rules[]
                | if .type == "pull_request" then
                    .parameters.require_extra_approval_for_unattributed_changes = true
                  else
                    .
                  end
                | select(.type != "code_quality")
              ] + [
                {
                  type: "code_quality",
                  parameters: {
                    severity: "errors"
                  }
                }
              ]
            )
          }' \
        | gh api --method PUT "repos/$OWNER/$REPOSITORY/rulesets/$RULESET_ID" --input - >/dev/null
    EOT

    environment = {
      GH_TOKEN   = var.github_token
      OWNER      = var.owner
      REPOSITORY = var.repository
      RULESET_ID = github_repository_ruleset.main.ruleset_id
    }
  }
}

