mock_provider "kubernetes" {}

run "the_namespace_is_named_caelundas" {
  command = plan

  assert {
    condition     = kubernetes_namespace_v1.caelundas.metadata[0].name == "caelundas" && output.name == "caelundas"
    error_message = "The Argo CD applications deploy into caelundas, so the namespace must carry that name."
  }
}
