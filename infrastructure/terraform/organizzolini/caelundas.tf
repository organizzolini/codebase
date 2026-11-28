# Everything Terraform owns for Caelundas, the namespace and its database role's
# password and secrets, lives in the caelundas-db project. This file only
# instantiates that module and orders it after the cluster.
module "caelundas_database" {
  source = "../../../projects/caelundas/caelundas-db/infrastructure/terraform/database"

  platform_namespace = kubernetes_namespace_v1.organizzolini.metadata[0].name

  depends_on = [terraform_data.cluster_ready]
}
