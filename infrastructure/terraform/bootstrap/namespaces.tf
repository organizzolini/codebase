# The Argo CD applications do not set CreateNamespace for these two, so this root creates them.
resource "kubernetes_namespace_v1" "codebase" {
  metadata {
    name = "codebase"
  }
}

resource "kubernetes_namespace_v1" "caelundas" {
  metadata {
    name = "caelundas"
  }
}
