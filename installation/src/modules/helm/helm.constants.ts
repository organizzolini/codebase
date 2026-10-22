// ♟️ Constants

/**
 * The Helm release to install, matching the `helm` pin of the
 * `kubectl-helm-minikube` feature in both devcontainer configurations.
 */
export const HELM_VERSION = "v4.1.1";

/** Where Helm publishes its release archives and their checksums. */
export const HELM_DOWNLOAD_URL = "https://get.helm.sh";

/** Helm's name for each processor architecture Node reports. */
export const HELM_ARCHITECTURES: Readonly<Record<string, string>> = {
  arm64: "arm64",
  x64: "amd64",
};
