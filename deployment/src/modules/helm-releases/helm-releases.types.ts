// 🏷️ Types

/** One Helm release, as Argo CD or a workflow installs it. */
export interface HelmRelease {
  /** The chart's folder under `infrastructure/helm`. */
  chart: string;
  /** The Kubernetes namespace the release installs into. */
  namespace: string;
  /** The release name `helm template` is given. */
  release: string;
  /** Extra `--set-string` arguments, by key. */
  strings: Readonly<Record<string, string>>;
  /** Values files, relative to the chart, layered in order. */
  values: readonly string[];
}

/** Where a project's values file is found and which namespaces Applications give. */
export interface ProjectContext {
  /** Namespaces by the chart and values files an Application installs. */
  namespaces: ReadonlyMap<string, string>;
  /** The charts folder. */
  root: string;
  /** The workspace root, which the project's path is relative to. */
  workspace: string;
}
