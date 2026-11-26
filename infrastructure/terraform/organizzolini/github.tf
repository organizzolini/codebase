# The cluster's kubeconfig, for the workflows that reach the cluster. It is written here,
# next to the cluster, so no other root reads this root's state.
resource "github_actions_secret" "kubeconfig" {
  repository      = var.repository
  secret_name     = "KUBECONFIG"
  plaintext_value = local.kubeconfig

  depends_on = [terraform_data.cluster_ready]
}
