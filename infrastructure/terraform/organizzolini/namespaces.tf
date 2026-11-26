# The Argo CD applications do not set CreateNamespace for the platform namespace, so this
# root creates it. Each app's own namespace lives in that app's file.
resource "kubernetes_namespace_v1" "organizzolini" {
  metadata {
    name = "organizzolini"
  }

  depends_on = [terraform_data.cluster_ready]
}
