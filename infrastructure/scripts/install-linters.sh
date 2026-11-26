#!/usr/bin/env bash
# Install the linters lint-code calls: kubeconform, kube-linter, pluto, and
# actionlint, built from pinned tags the Go checksum database verifies. Needs no
# Docker daemon.

# tflint and zizmor come from setup-tflint, the devcontainer feature, and the uv
# lockfile. Installs into $LINTERS_BIN, default ~/.local/bin; the Go toolchain
# fetches whatever newer Go a tool's go.mod asks for.
set -euo pipefail

actionlint_version="1.7.12"
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
