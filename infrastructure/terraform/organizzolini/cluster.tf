data "linode_lke_versions" "available" {}

resource "linode_lke_cluster" "organizzolini_codebase" {
  label  = "organizzolini-codebase"
  region = var.region
  # A conditional evaluates only the branch it takes, so a pinned version never reads the data source.
  k8s_version = var.k8s_version != null ? var.k8s_version : reverse(sort([for v in data.linode_lke_versions.available.versions : v.id]))[0]

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
  triggers_replace = linode_lke_cluster.organizzolini_codebase.id

  # The kubeconfig goes through the environment, which keeps it out of the logged command.
  provisioner "local-exec" {
    environment = {
      KUBECONFIG_B64 = linode_lke_cluster.organizzolini_codebase.kubeconfig
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
