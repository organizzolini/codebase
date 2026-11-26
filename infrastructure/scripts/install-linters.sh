#!/usr/bin/env bash
# Install the linters lint-code calls: kubeconform, kube-linter, pluto, and
# actionlint, built from pinned tags the Go checksum database verifies, and hadolint,
# a wrapper around its image pinned by digest.

# tflint and zizmor come from setup-tflint, the devcontainer feature, and the uv
# lockfile. Installs into $LINTERS_BIN, default ~/.local/bin; the Go toolchain
# fetches whatever newer Go a tool's go.mod asks for.
set -euo pipefail

actionlint_version="1.7.12"
hadolint_image="ghcr.io/hadolint/hadolint@sha256:27086352fd5e1907ea2b934eb1023f217c5ae087992eb59fde121dce9c9ff21e"
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

cat >"${GOBIN}/hadolint" <<WRAPPER
#!/usr/bin/env bash
exec docker run --rm -v "\${PWD}:\${PWD}" -w "\${PWD}" ${hadolint_image} hadolint "\$@"
WRAPPER
chmod +x "${GOBIN}/hadolint"
docker pull --quiet "${hadolint_image}" >/dev/null
