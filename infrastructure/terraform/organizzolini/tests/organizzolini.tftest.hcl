mock_provider "linode" {}

mock_provider "cloudflare" {}

mock_provider "kubernetes" {}

mock_provider "helm" {}

mock_provider "github" {}

mock_provider "random" {}

# The Kubernetes and Helm providers are configured from the cluster's kubeconfig, so the
# mocked cluster carries a valid one: base64 of a minimal YAML kubeconfig.
override_resource {
  target          = linode_lke_cluster.organizzolini
  override_during = plan
  values = {
    kubeconfig = "Y2x1c3RlcnM6CiAgLSBjbHVzdGVyOgogICAgICBzZXJ2ZXI6IGh0dHBzOi8vY2x1c3Rlci5leGFtcGxlLmNvbQogICAgICBjZXJ0aWZpY2F0ZS1hdXRob3JpdHktZGF0YTogYlc5amF5MWpZUT09CnVzZXJzOgogIC0gdXNlcjoKICAgICAgdG9rZW46IG1vY2stdG9rZW4K"
  }
}

# The readiness wait is a provisioner, which plans never run.
override_resource {
  target = terraform_data.cluster_ready
}

# An overridden ID keeps the tunnel ID known in a plan, where mocks would leave it unknown.
override_resource {
  target          = cloudflare_zero_trust_tunnel_cloudflared.organizzolini
  override_during = plan
  values = {
    id = "0123456789abcdef0123456789abcdef"
  }
}

# The zone is imported, and a mock provider cannot import.
override_resource {
  target = cloudflare_zone.organizzolini_net
}

# The linode root has not applied in a test, so its remote state is overridden.
override_data {
  target = data.terraform_remote_state.linode
  values = {
    outputs = {
      organizzolini_postgres_backups_access_key = "mock-access-key"
      organizzolini_postgres_backups_secret_key = "mock-secret-key"
    }
  }
}

variables {
  linode_token          = "mock-token"
  cloudflare_api_token  = "mock-token"
  cloudflare_account_id = "0123456789abcdef0123456789abcdef"
  cloudflare_zone_id    = "fedcba9876543210fedcba9876543210"
  github_token          = "mock-token"
  state_bucket          = "mock-state-bucket"
}

run "the_tunnel_answers_404_until_an_application_adds_rules" {
  command = plan

  assert {
    condition     = length(cloudflare_zero_trust_tunnel_cloudflared_config.organizzolini.config.ingress) == 1 && cloudflare_zero_trust_tunnel_cloudflared_config.organizzolini.config.ingress[0].service == "http_status:404"
    error_message = "The tunnel must carry only the catch-all 404 rule: no public hostname exists before an application adds one."
  }
}

run "the_caelundas_module_creates_the_namespace_and_serves_the_role" {
  command = plan

  assert {
    condition     = module.caelundas_database.namespace == "caelundas"
    error_message = "The caelundas module must create the caelundas namespace."
  }

  assert {
    condition     = module.caelundas_database.role == "caelundas_username"
    error_message = "The caelundas module must serve the caelundas_username role."
  }
}

run "the_backups_secret_is_built_by_the_backups_module" {
  command = plan

  assert {
    condition     = module.postgres_backups_secret.name == "postgres-backups"
    error_message = "postgres-backups must be built from the backups key the linode root outputs."
  }
}

# The token is a data source that reads the tunnel this plan creates, so Terraform defers it
# to apply, and applying mock providers fails. Only the secret's address is checkable here.
run "the_connector_secret_sits_where_the_chart_reads_it" {
  command = plan

  assert {
    condition     = kubernetes_secret_v1.cloudflared_token.metadata[0].name == "cloudflared-token" && kubernetes_secret_v1.cloudflared_token.metadata[0].namespace == "organizzolini"
    error_message = "cloudflared-token must live in the organizzolini namespace, where the chart reads it."
  }
}

run "argo_cd_waits_on_child_health" {
  command = plan

  assert {
    condition     = can(yamldecode(helm_release.argocd.values[0]).configs.cm["resource.customizations.health.argoproj.io_Application"])
    error_message = "The Application health customization must be present: the sync waves rely on it."
  }
}

run "the_root_app_follows_the_applications_chart_on_main" {
  command = plan

  assert {
    condition     = yamldecode(helm_release.root_application.values[0]).applications.root.source.path == "infrastructure/helm/argocd" && yamldecode(helm_release.root_application.values[0]).applications.root.source.targetRevision == "main"
    error_message = "The root app must read the argocd chart on main."
  }

  assert {
    condition     = contains(yamldecode(helm_release.root_application.values[0]).applications.root.source.helm.valueFiles, "values/base.yaml")
    error_message = "The chart has no values.yaml, so the root app must load values/base.yaml."
  }
}

run "publishes_the_cluster_kubeconfig_as_KUBECONFIG_and_as_the_output" {
  command = plan

  assert {
    condition     = github_actions_secret.kubeconfig.secret_name == "KUBECONFIG" && yamldecode(github_actions_secret.kubeconfig.plaintext_value).clusters[0].cluster.server == "https://cluster.example.com"
    error_message = "The KUBECONFIG Actions secret must hold the cluster's decoded kubeconfig."
  }

  assert {
    condition     = output.kubeconfig == github_actions_secret.kubeconfig.plaintext_value
    error_message = "The kubeconfig output must be the same decoded kubeconfig."
  }
}
