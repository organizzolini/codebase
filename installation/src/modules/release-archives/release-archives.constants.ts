// ♟️ Constants

import type { ReleaseArchiveTool } from "./release-archives.types";

/**
 * The tools Linux installs from their release archives, with no Homebrew.
 *
 * Every version matches the pin the cloud devcontainer holds for the same
 * tool, in its features or in `remoteEnv`, and a test fails when one drifts.
 * Helm lints the charts in the pre-commit hook, kubectl and Terraform drive
 * the cluster, gitleaks and Trivy are the security gate's scanners, and uv runs
 * every Python-backed check.
 */
export const RELEASE_ARCHIVE_TOOLS: readonly ReleaseArchiveTool[] = [
  {
    architectures: { arm64: "arm64", x64: "amd64" },
    archiveName: "helm-v{version}-linux-{architecture}.tar.gz",
    checksumUrl:
      "https://get.helm.sh/helm-v{version}-linux-{architecture}.tar.gz.sha256sum",
    downloadUrl:
      "https://get.helm.sh/helm-v{version}-linux-{architecture}.tar.gz",
    format: "tar.gz",
    members: ["linux-{architecture}/helm"],
    name: "helm",
    version: "4.1.1",
  },
  {
    architectures: { arm64: "arm64", x64: "amd64" },
    archiveName: "kubectl",
    checksumUrl:
      "https://dl.k8s.io/release/v{version}/bin/linux/{architecture}/kubectl.sha256",
    downloadUrl:
      "https://dl.k8s.io/release/v{version}/bin/linux/{architecture}/kubectl",
    format: "binary",
    members: ["kubectl"],
    name: "kubectl",
    version: "1.35.1",
  },
  {
    architectures: { arm64: "arm64", x64: "amd64" },
    archiveName: "terraform_{version}_linux_{architecture}.zip",
    checksumUrl:
      "https://releases.hashicorp.com/terraform/{version}/terraform_{version}_SHA256SUMS",
    downloadUrl:
      "https://releases.hashicorp.com/terraform/{version}/terraform_{version}_linux_{architecture}.zip",
    format: "zip",
    members: ["terraform"],
    name: "terraform",
    version: "1.14.5",
  },
  {
    architectures: { arm64: "arm64", x64: "x64" },
    archiveName: "gitleaks_{version}_linux_{architecture}.tar.gz",
    checksumUrl:
      "https://github.com/gitleaks/gitleaks/releases/download/v{version}/gitleaks_{version}_checksums.txt",
    downloadUrl:
      "https://github.com/gitleaks/gitleaks/releases/download/v{version}/gitleaks_{version}_linux_{architecture}.tar.gz",
    format: "tar.gz",
    members: ["gitleaks"],
    name: "gitleaks",
    version: "8.30.1",
  },
  {
    architectures: { arm64: "ARM64", x64: "64bit" },
    archiveName: "trivy_{version}_Linux-{architecture}.tar.gz",
    checksumUrl:
      "https://github.com/aquasecurity/trivy/releases/download/v{version}/trivy_{version}_checksums.txt",
    downloadUrl:
      "https://github.com/aquasecurity/trivy/releases/download/v{version}/trivy_{version}_Linux-{architecture}.tar.gz",
    format: "tar.gz",
    members: ["trivy"],
    name: "trivy",
    version: "0.74.0",
  },
  {
    architectures: { arm64: "aarch64", x64: "x86_64" },
    archiveName: "uv-{architecture}-unknown-linux-gnu.tar.gz",
    checksumUrl:
      "https://github.com/astral-sh/uv/releases/download/{version}/uv-{architecture}-unknown-linux-gnu.tar.gz.sha256",
    downloadUrl:
      "https://github.com/astral-sh/uv/releases/download/{version}/uv-{architecture}-unknown-linux-gnu.tar.gz",
    format: "tar.gz",
    members: [
      "uv-{architecture}-unknown-linux-gnu/uv",
      "uv-{architecture}-unknown-linux-gnu/uvx",
    ],
    name: "uv",
    version: "0.12.3",
  },
];
