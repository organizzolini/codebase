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

# A random password is only known after apply, and applying would run the readiness wait,
# so a fixed result lets the secrets be asserted in a plan.
override_resource {
  target          = random_password.caelundas_postgres
  override_during = plan
  values = {
    result = "mock-password"
  }
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
  k8s_version           = "1.34"
  state_bucket          = "mock-state-bucket"
}

run "the_cluster_is_the_small_autoscaling_organizzolini" {
  command = plan

  assert {
    condition     = linode_lke_cluster.organizzolini.label == "organizzolini"
    error_message = "The cluster must be labelled organizzolini."
  }

  assert {
    condition     = linode_lke_cluster.organizzolini.region == "us-iad"
    error_message = "The cluster must sit in us-iad."
  }

  assert {
    condition     = linode_lke_cluster.organizzolini.pool[0].type == "g6-standard-2"
    error_message = "The pool must use the g6-standard-2 node type."
  }

  assert {
    condition     = linode_lke_cluster.organizzolini.pool[0].autoscaler[0].min == 1 && linode_lke_cluster.organizzolini.pool[0].autoscaler[0].max == 2
    error_message = "The pool autoscaler must run between 1 and 2 nodes."
  }

  assert {
    condition     = linode_lke_cluster.organizzolini.control_plane[0].high_availability == false
    error_message = "The control plane must be standard, not high availability."
  }
}

run "the_tunnel_answers_404_until_an_application_adds_rules" {
  command = plan

  assert {
    condition     = length(cloudflare_zero_trust_tunnel_cloudflared_config.organizzolini.config.ingress) == 1
    error_message = "The tunnel must carry only the catch-all rule: no public hostname exists before an application does."
  }

  assert {
    condition     = cloudflare_zero_trust_tunnel_cloudflared_config.organizzolini.config.ingress[0].service == "http_status:404"
    error_message = "The catch-all rule must answer 404."
  }
}

run "nothing_outside_organizzolini_net_is_named" {
  command = plan

  # The Lexico guard: the only zone this root touches is organizzolini.net.
  assert {
    condition     = cloudflare_zone.organizzolini_net.name == "organizzolini.net"
    error_message = "The imported zone must be organizzolini.net."
  }
}

run "creates_the_organizzolini_and_caelundas_namespaces" {
  command = plan

  assert {
    condition     = kubernetes_namespace_v1.organizzolini.metadata[0].name == "organizzolini"
    error_message = "The organizzolini namespace must be created."
  }

  assert {
    condition     = kubernetes_namespace_v1.caelundas.metadata[0].name == "caelundas"
    error_message = "The caelundas namespace must be created."
  }
}

run "the_app_namespace_gets_the_same_database_password_as_the_cluster" {
  command = plan

  assert {
    condition     = kubernetes_secret_v1.caelundas_postgres_organizzolini.data["password"] == random_password.caelundas_postgres.result && kubernetes_secret_v1.caelundas_postgres_caelundas.data["password"] == random_password.caelundas_postgres.result
    error_message = "Both caelundas-postgres secrets must carry the generated password."
  }

  assert {
    condition     = kubernetes_secret_v1.caelundas_postgres_organizzolini.type == "kubernetes.io/basic-auth" && kubernetes_secret_v1.caelundas_postgres_caelundas.type == "kubernetes.io/basic-auth"
    error_message = "Both caelundas-postgres secrets must be basic-auth secrets."
  }

  assert {
    condition     = kubernetes_secret_v1.caelundas_postgres_organizzolini.data["username"] == "caelundas_username" && kubernetes_secret_v1.caelundas_postgres_caelundas.metadata[0].namespace == "caelundas"
    error_message = "The role is caelundas_username and the second secret lives in caelundas."
  }

  assert {
    condition     = random_password.caelundas_postgres.length == 32 && random_password.caelundas_postgres.special == false
    error_message = "The password must be 32 characters without specials."
  }
}

run "argo_cd_runs_the_core_profile" {
  command = plan

  assert {
    condition     = yamldecode(helm_release.argocd.values[0]).server.enabled == false && yamldecode(helm_release.argocd.values[0]).dex.enabled == false && yamldecode(helm_release.argocd.values[0]).notifications.enabled == false && yamldecode(helm_release.argocd.values[0]).applicationSet.enabled == false
    error_message = "The server, dex, notifications and applicationSet must be disabled."
  }

  assert {
    condition     = yamldecode(helm_release.argocd.values[0]).applicationSet.replicas == 0
    error_message = "The chart has no applicationSet switch, so the controller must run zero replicas."
  }

  assert {
    condition     = can(yamldecode(helm_release.argocd.values[0]).configs.cm["resource.customizations.health.argoproj.io_Application"])
    error_message = "The Application health customization must be present."
  }
}

run "the_root_app_follows_the_applications_chart_on_main" {
  command = plan

  assert {
    condition     = yamldecode(helm_release.root_application.values[0]).applications.root.source.path == "infrastructure/helm/argocd-applications"
    error_message = "The root app must read the argocd-applications chart."
  }

  assert {
    condition     = yamldecode(helm_release.root_application.values[0]).applications.root.source.targetRevision == "main"
    error_message = "The root app must follow main."
  }
}

run "the_root_app_loads_the_base_values" {
  command = plan

  assert {
    condition     = contains(yamldecode(helm_release.root_application.values[0]).applications.root.source.helm.valueFiles, "values/base.yaml")
    error_message = "The chart has no values.yaml, so the root app must load values/base.yaml."
  }
}

run "publishes_the_cluster_kubeconfig_as_KUBECONFIG" {
  command = plan

  assert {
    condition     = github_actions_secret.kubeconfig.secret_name == "KUBECONFIG"
    error_message = "The cluster kubeconfig must be published as the KUBECONFIG Actions secret."
  }

  assert {
    condition     = yamldecode(github_actions_secret.kubeconfig.plaintext_value).clusters[0].cluster.server == "https://cluster.example.com"
    error_message = "The KUBECONFIG secret must hold the cluster's decoded kubeconfig."
  }
}
