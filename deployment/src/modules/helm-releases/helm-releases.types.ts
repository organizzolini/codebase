// 🏷️ Types

/** One Helm release, as Argo CD or a workflow installs it. */
export interface HelmRelease {
  /** The chart's folder under `infrastructure/helm`. */
  chart: string;
  /** The Kubernetes namespace the release installs into. */
  namespace: string;
  /** The release name `helm template` is given. */
  release: string;
  /** Values files, relative to the chart, layered in order. */
  values: readonly string[];
}
