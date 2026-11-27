resource "linode_lke_cluster" "organizzolini" {
  label  = "organizzolini"
  region = var.region
  # Bump deliberately, with the Kubernetes version kubeconform and pluto check against
  # (the `kubeconform` and `pluto` targets of the infrastructure project).
  k8s_version = "1.35"

  control_plane {
    high_availability = false
  }

  pool {
    type  = var.node_type
    count = 1

    autoscaler {
      min = 1
      max = 2
    }
  }
}

# Writes the kubeconfig to a 0600 temp file and waits for the API. Every Kubernetes and
# Helm resource depends on it, so none reaches an API that is still starting.
resource "terraform_data" "cluster_ready" {
  triggers_replace = linode_lke_cluster.organizzolini.id

  # The kubeconfig goes through the environment, which keeps it out of the logged command.
  provisioner "local-exec" {
    environment = {
      KUBECONFIG_B64 = linode_lke_cluster.organizzolini.kubeconfig
    }

    command = <<-EOT
      set -eu
      # mktemp creates the file with mode 0600.
      kubeconfig="$(mktemp)"
      trap 'rm -f "$kubeconfig"' EXIT
      printf '%s' "$KUBECONFIG_B64" | base64 -d > "$kubeconfig"
      deadline=$(( $(date +%s) + 600 ))
      until KUBECONFIG="$kubeconfig" kubectl get --raw=/readyz >/dev/null 2>&1; do
        if [ "$(date +%s)" -ge "$deadline" ]; then
          echo "The cluster API did not answer within 10 minutes." >&2
          exit 1
        fi
        sleep 10
      done
    EOT
  }
}
