mock_provider "kubernetes" {}

variables {
  namespace  = "organizzolini"
  access_key = "mock-access-key"
  secret_key = "mock-secret-key"
}

run "the_secret_holds_the_key_where_the_chart_reads_it" {
  command = plan

  assert {
    condition     = kubernetes_secret_v1.backups.metadata[0].name == "postgres-backups" && kubernetes_secret_v1.backups.metadata[0].namespace == "organizzolini"
    error_message = "postgres-backups must live in the namespace it is given."
  }

  assert {
    condition     = kubernetes_secret_v1.backups.data["ACCESS_KEY_ID"] == "mock-access-key" && kubernetes_secret_v1.backups.data["ACCESS_SECRET_KEY"] == "mock-secret-key"
    error_message = "postgres-backups must carry the key it is given."
  }

  assert {
    condition     = output.name == "postgres-backups"
    error_message = "The name output must be the Secret's name."
  }
}
