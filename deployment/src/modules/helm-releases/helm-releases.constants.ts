// ♟️ Constants

import type { HelmRelease } from "./helm-releases.types";

/** Where the charts live, relative to the workspace root. */
export const HELM_ROOT = "infrastructure/helm";

/** The charts Argo CD's Applications install from this repository. */
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
];

/** Tells how to call the command. */
export const USAGE = "usage: helm-releases lint | render <directory>";
