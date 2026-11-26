#!/usr/bin/env bash
# Install the linters lint-code calls: kubeconform, kube-linter, pluto, and
# actionlint, built from pinned tags the Go checksum database verifies, and hadolint,
# the pinned release binary checked against its sha256. Needs no Docker daemon.

# tflint and zizmor come from setup-tflint, the devcontainer feature, and the uv
# lockfile. Installs into $LINTERS_BIN, default ~/.local/bin; the Go toolchain
# fetches whatever newer Go a tool's go.mod asks for.
set -euo pipefail

actionlint_version="1.7.12"
hadolint_version="2.14.0"
hadolint_sha256_x86_64="6bf226944684f56c84dd014e8b979d27425c0148f61b3bd99bcc6f39e9dc5a47"
hadolint_sha256_arm64="331f1d3511b84a4f1e3d18d52fec284723e4019552f4f47b19322a53ce9a40ed"
kubeconform_version="0.8.0"
kube_linter_version="0.8.3"
pluto_version="5.24.5"

export GOBIN="${LINTERS_BIN:-${HOME}/.local/bin}"
export GOTOOLCHAIN=auto
mkdir -p "${GOBIN}"

go install "github.com/yannh/kubeconform/cmd/kubeconform@v${kubeconform_version}"
go install "golang.stackrox.io/kube-linter/cmd/kube-linter@v${kube_linter_version}"
go install "github.com/fairwindsops/pluto/v5/cmd/pluto@v${pluto_version}"
go install "github.com/rhysd/actionlint/cmd/actionlint@v${actionlint_version}"

case "$(uname -m)" in
  x86_64 | amd64)
    hadolint_arch="x86_64"
    hadolint_sha256="${hadolint_sha256_x86_64}"
    ;;
  aarch64 | arm64)
    hadolint_arch="arm64"
    hadolint_sha256="${hadolint_sha256_arm64}"
    ;;
  *)
    echo "hadolint has no Linux build for $(uname -m)" >&2
    exit 1
    ;;
esac
hadolint_tmp="$(mktemp)"
trap 'rm -f "${hadolint_tmp}"' EXIT
curl -sSfL -o "${hadolint_tmp}" \
  "https://github.com/hadolint/hadolint/releases/download/v${hadolint_version}/hadolint-linux-${hadolint_arch}"
echo "${hadolint_sha256}  ${hadolint_tmp}" | sha256sum --check --quiet
install -m 0755 "${hadolint_tmp}" "${GOBIN}/hadolint"
