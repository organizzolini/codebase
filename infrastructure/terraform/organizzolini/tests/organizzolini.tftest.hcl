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

# A plan never runs provisioners, and an overridden ID keeps the record's content known in a plan.
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

run "the_tunnel_sends_graphql_to_the_api_and_everything_else_to_the_web" {
  command = plan

  assert {
    condition     = cloudflare_zero_trust_tunnel_cloudflared_config.organizzolini.config.ingress[0].hostname == "caelundas.organizzolini.net" && cloudflare_zero_trust_tunnel_cloudflared_config.organizzolini.config.ingress[0].path == "^/graphql" && cloudflare_zero_trust_tunnel_cloudflared_config.organizzolini.config.ingress[0].service == "http://caelundas-api.caelundas.svc.cluster.local:80"
    error_message = "The first ingress rule must send /graphql on the public host to the API on port 80."
  }

  assert {
    condition     = cloudflare_zero_trust_tunnel_cloudflared_config.organizzolini.config.ingress[1].hostname == "caelundas.organizzolini.net" && cloudflare_zero_trust_tunnel_cloudflared_config.organizzolini.config.ingress[1].service == "http://caelundas-web.caelundas.svc.cluster.local:80"
    error_message = "The second ingress rule must send the public host's other paths to the web on port 80."
  }

  assert {
    condition     = cloudflare_zero_trust_tunnel_cloudflared_config.organizzolini.config.ingress[2].service == "http_status:404"
    error_message = "The last ingress rule must answer 404 for anything else."
  }
}

run "the_caelundas_record_is_a_proxied_cname_to_the_tunnel" {
  command = plan

  assert {
    condition     = cloudflare_dns_record.organizzolini_caelundas.type == "CNAME"
    error_message = "The caelundas record must be a CNAME."
  }

  assert {
    condition     = cloudflare_dns_record.organizzolini_caelundas.proxied == true
    error_message = "The caelundas record must be proxied."
  }

  assert {
    condition     = endswith(cloudflare_dns_record.organizzolini_caelundas.content, ".cfargotunnel.com")
    error_message = "The caelundas record must point at the tunnel's cfargotunnel.com name."
  }
}

run "nothing_outside_organizzolini_net_is_named" {
  command = plan

  # The Lexico guard: every hostname the config names must sit under organizzolini.net.
  assert {
    condition     = endswith(cloudflare_zero_trust_tunnel_cloudflared_config.organizzolini.config.ingress[0].hostname, ".organizzolini.net") && endswith(cloudflare_zero_trust_tunnel_cloudflared_config.organizzolini.config.ingress[1].hostname, ".organizzolini.net")
    error_message = "Every ingress hostname must end with organizzolini.net."
  }

  assert {
    condition     = "${cloudflare_dns_record.organizzolini_caelundas.name}.organizzolini.net" == "caelundas.organizzolini.net"
    error_message = "The DNS record must name a host under organizzolini.net."
  }

  assert {
    condition     = cloudflare_zone.organizzolini_net.name == "organizzolini.net"
    error_message = "The imported zone must be organizzolini.net."
  }
}

run "the_caelundas_modules_create_the_namespace_and_serve_the_role" {
  command = plan

  assert {
    condition     = module.caelundas_namespace.name == "caelundas"
    error_message = "The caelundas-api module must create the caelundas namespace."
  }

  assert {
    condition     = module.caelundas_database.role == "caelundas_username"
    error_message = "The caelundas-db module must serve the caelundas_username role."
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
