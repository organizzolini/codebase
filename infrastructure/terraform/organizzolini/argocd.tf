# Argo CD core: no API server or UI, only the controller, repo server and Redis.
resource "helm_release" "argocd" {
  name             = "argocd"
  repository       = "https://argoproj.github.io/argo-helm"
  chart            = "argo-cd"
  version          = "10.17.2"
  namespace        = "argocd"
  create_namespace = true
  timeout          = 600

  values = [file("${path.module}/argocd-values.yaml")]

  depends_on = [terraform_data.cluster_ready]
}

# A chart rather than kubernetes_manifest, which cannot plan before the Application CRD exists.
resource "helm_release" "root_application" {
  name       = "root-application"
  repository = "https://argoproj.github.io/argo-helm"
  chart      = "argocd-apps"
  version    = "2.0.7"
  namespace  = "argocd"
  timeout    = 600

  values = [yamlencode({
    applications = {
      root = {
        namespace = "argocd"
        project   = "default"
        source = {
          repoURL        = "https://github.com/organizzolini/codebase.git"
          path           = "infrastructure/helm/argocd"
          targetRevision = "main"
          helm = {
            valueFiles = ["values/base.yaml"]
          }
        }
        destination = {
          server    = "https://kubernetes.default.svc"
          namespace = "argocd"
        }
        syncPolicy = {
          automated = {
            prune    = true
            selfHeal = true
          }
        }
      }
    }
  })]

  depends_on = [helm_release.argocd]
}
