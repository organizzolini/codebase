// ♟️ Constants

import type { HelmRelease } from "./helm-releases.types";

/** Where the charts live, relative to the workspace root. */
export const HELM_ROOT = "infrastructure/helm";

/** Stands in for the image tag, so the chart renders. */
const PLACEHOLDER_IMAGE_TAG = ["image.tag=0.0.0"];

/** The charts Argo CD or the ingestion workflow installs. */
export const HELM_RELEASES: readonly HelmRelease[] = [
  {
    chart: "argocd-applications",
    namespace: "argocd",
    release: "argocd-applications",
    values: ["values/base.yaml"],
  },
  {
    chart: "postgres",
    namespace: "organizzolini",
    release: "postgres",
    values: ["values/base.yaml"],
  },
  {
    chart: "cloudflared",
    namespace: "organizzolini",
    release: "cloudflared",
    values: ["values/base.yaml"],
  },
  {
    chart: "kubernetes-deployment",
    namespace: "caelundas",
    release: "caelundas-api",
    strings: PLACEHOLDER_IMAGE_TAG,
    values: ["values/base.yaml", "values/caelundas-api.yaml"],
  },
  {
    chart: "kubernetes-deployment",
    namespace: "caelundas",
    release: "caelundas-web",
    strings: PLACEHOLDER_IMAGE_TAG,
    values: ["values/base.yaml", "values/caelundas-web.yaml"],
  },
  {
    chart: "kubernetes-job",
    namespace: "caelundas",
    release: "caelundas-cli",
    strings: PLACEHOLDER_IMAGE_TAG,
    values: ["values/base.yaml", "values/caelundas-cli.yaml"],
  },
];

/** Tells how to call the command. */
export const USAGE = "usage: helm-releases lint | render <directory>";
