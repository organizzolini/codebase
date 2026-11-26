// 🏷️ Types

/** One Helm release, as Argo CD or a workflow installs it. */
export interface HelmRelease {
  /** The chart's folder under `infrastructure/helm`. */
  chart: string;
  /** The Kubernetes namespace the release installs into. */
  namespace: string;
  /** The release name `helm template` is given. */
  release: string;
  /** Values set as `key=value` strings, such as the image tag. */
  strings?: readonly string[];
  /** Values files, relative to the chart, layered in order. */
  values: readonly string[];
}
