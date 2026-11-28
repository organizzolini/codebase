# The cluster's kubeconfig, for the workflows that reach the cluster. A GitHub secret write
# never touches the cluster API, so it does not wait for the readiness check.
resource "github_actions_secret" "kubeconfig" {
  repository      = var.repository
  secret_name     = "KUBECONFIG"
  plaintext_value = local.kubeconfig
}
