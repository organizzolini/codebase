// 🏷️ Types

/** One Helm release, as Argo CD or a workflow installs it. */
export interface HelmRelease {
  /** The chart's name, which is its folder's name. */
  chart: string;
  /** The chart's folder, relative to the workspace root. */
  directory: string;
  /** The Kubernetes namespace the release installs into. */
  namespace: string;
  /** The release name `helm template` is given. */
  release: string;
  /** Extra `--set-string` arguments, by key. */
  strings: Readonly<Record<string, string>>;
  /** Values files, relative to the chart, layered in order. */
  values: readonly string[];
}

/** What the release of a project's values file is worked out from. */
export interface ProjectContext {
  /** Each chart's folder, relative to the workspace root, by chart name. */
  directories: ReadonlyMap<string, string>;
  /** Namespaces by the chart and values files an Application installs. */
  namespaces: ReadonlyMap<string, string>;
  /** The workspace root. */
  root: string;
}
