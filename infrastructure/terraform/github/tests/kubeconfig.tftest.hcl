mock_provider "github" {}

# No root has applied in a test, so every remote state is overridden. The kubeconfig is a
# placeholder YAML string, since nothing in the plan parses it.
override_data {
  target = data.terraform_remote_state.kubernetes
  values = {
    outputs = {
      kubeconfig = "clusters:\n  - cluster:\n      server: https://cluster.example.com\nusers:\n  - user:\n      token: mock-token\n"
    }
  }
}

override_data {
  target = data.terraform_remote_state.openrouter
  values = {
    outputs = {
      refresh_documentation_model = "@preset/mock"
    }
  }
}

override_data {
  target = data.terraform_remote_state.linode
  values = {
    outputs = {
      nx_cache_bucket                = "mock-bucket"
      nx_cache_endpoint              = "mock-endpoint"
      nx_cache_read_only_access_key  = "mock-read-only-access-key"
      nx_cache_read_only_secret_key  = "mock-read-only-secret-key"
      nx_cache_read_write_access_key = "mock-read-write-access-key"
      nx_cache_read_write_secret_key = "mock-read-write-secret-key"
    }
  }
}

# The repository, ruleset and security settings are imported, and a mock provider cannot
# import. Overriding them lets the plan read them as if they already existed.
override_resource {
  target = github_repository.codebase
}

override_resource {
  target = github_repository_dependabot_security_updates.codebase
}

override_resource {
  target = github_repository_vulnerability_alerts.codebase
}

override_resource {
  target = github_repository_ruleset.main
}

# The ruleset patch shells out to gh, which a plan never runs.
override_resource {
  target = terraform_data.main_ruleset_unsupported_rules
}

variables {
  github_token = "mock-token"
  state_bucket = "mock-state-bucket"
}

run "publishes_the_cluster_kubeconfig_as_KUBECONFIG" {
  command = plan

  assert {
    condition     = github_actions_secret.kubeconfig.secret_name == "KUBECONFIG"
    error_message = "The cluster kubeconfig must be published as the KUBECONFIG Actions secret."
  }

  assert {
    condition     = github_actions_secret.kubeconfig.plaintext_value == "clusters:\n  - cluster:\n      server: https://cluster.example.com\nusers:\n  - user:\n      token: mock-token\n"
    error_message = "The KUBECONFIG secret must hold the kubernetes root's kubeconfig output."
  }
}
