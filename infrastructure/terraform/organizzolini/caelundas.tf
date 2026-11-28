# Each Caelundas project owns its Terraform: the api the namespace, the database
# the role's password and Secrets. This file only instantiates them, in order,
# after the cluster.
module "caelundas_namespace" {
  source = "../../../projects/caelundas/caelundas-api/infrastructure/terraform/namespace"

  depends_on = [terraform_data.cluster_ready]
}

module "caelundas_database" {
  source = "../../../projects/caelundas/caelundas-db/infrastructure/terraform/database"

  namespace          = module.caelundas_namespace.name
  platform_namespace = kubernetes_namespace_v1.organizzolini.metadata[0].name
}
