mock_provider "kubernetes" {}

mock_provider "helm" {}

mock_provider "random" {}

# Neither root has applied in a test, so both remote states are overridden. The
# kubeconfig is a valid YAML string, since the providers are configured from it.
override_data {
  target = data.terraform_remote_state.kubernetes
  values = {
    outputs = {
      kubeconfig   = "clusters:\n  - cluster:\n      server: https://cluster.example.com\n      certificate-authority-data: bW9jay1jYQ==\nusers:\n  - user:\n      token: mock-token\n"
      tunnel_token = "mock-tunnel-token"
    }
  }
}

override_data {
  target = data.terraform_remote_state.linode
  values = {
    outputs = {
      postgres_backups_access_key = "mock-access-key"
      postgres_backups_secret_key = "mock-secret-key"
    }
  }
}

variables {
  state_bucket = "mock-state-bucket"
}

run "creates_the_codebase_and_caelundas_namespaces" {
  command = plan

  assert {
    condition     = kubernetes_namespace_v1.codebase.metadata[0].name == "codebase"
    error_message = "The codebase namespace must be created."
  }

  assert {
    condition     = kubernetes_namespace_v1.caelundas.metadata[0].name == "caelundas"
    error_message = "The caelundas namespace must be created."
  }
}

run "the_app_namespace_gets_the_same_database_password_as_the_cluster" {
  # The password is only known after apply.
  command = apply

  assert {
    condition     = kubernetes_secret_v1.caelundas_postgres_codebase.data["password"] == random_password.caelundas_postgres.result && kubernetes_secret_v1.caelundas_postgres_caelundas.data["password"] == random_password.caelundas_postgres.result
    error_message = "Both caelundas-postgres secrets must carry the generated password."
  }

  assert {
    condition     = kubernetes_secret_v1.caelundas_postgres_codebase.type == "kubernetes.io/basic-auth" && kubernetes_secret_v1.caelundas_postgres_caelundas.type == "kubernetes.io/basic-auth"
    error_message = "Both caelundas-postgres secrets must be basic-auth secrets."
  }

  assert {
    condition     = kubernetes_secret_v1.caelundas_postgres_codebase.data["username"] == "caelundas_username" && kubernetes_secret_v1.caelundas_postgres_caelundas.metadata[0].namespace == "caelundas"
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
