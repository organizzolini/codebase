mock_provider "kubernetes" {}

mock_provider "random" {}

# A random password is only known after apply, so a fixed result lets the secrets be asserted in a plan.
override_resource {
  target          = random_password.caelundas_postgres
  override_during = plan
  values = {
    result = "mock-password"
  }
}

variables {
  platform_namespace = "organizzolini"
}

run "the_namespace_is_named_caelundas" {
  command = plan

  assert {
    condition     = kubernetes_namespace_v1.caelundas.metadata[0].name == "caelundas" && output.namespace == "caelundas"
    error_message = "The Argo CD applications deploy into caelundas, so the namespace must carry that name."
  }
}

run "both_secrets_carry_the_one_generated_password" {
  command = plan

  assert {
    condition     = kubernetes_secret_v1.platform.data["password"] == random_password.caelundas_postgres.result && kubernetes_secret_v1.caelundas.data["password"] == random_password.caelundas_postgres.result
    error_message = "Both caelundas-postgres secrets must carry the generated password."
  }

  assert {
    condition     = kubernetes_secret_v1.platform.data["username"] == "caelundas_username" && kubernetes_secret_v1.caelundas.data["username"] == "caelundas_username" && output.role == "caelundas_username"
    error_message = "The role is caelundas_username in both secrets."
  }

  assert {
    condition     = kubernetes_secret_v1.platform.metadata[0].namespace == "organizzolini" && kubernetes_secret_v1.caelundas.metadata[0].namespace == "caelundas"
    error_message = "Each secret must live in its namespace: the platform one as given, the other in caelundas."
  }
}
