#!/usr/bin/env bash
# Lint or render every Helm release this repository ships, from one table, so each
# tool judges exactly what Argo CD or a workflow installs.
#   helm-releases.sh lint            helm lint --strict every release
#   helm-releases.sh render <dir>    helm template every release into <dir>/<release>.yaml
set -euo pipefail

mode="${1:?usage: helm-releases.sh lint|render [directory]}"
helm_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../helm" && pwd)"

# release chart namespace values-files (comma-separated, relative to the chart).
# The rows are the charts Argo CD's Applications install from this repository.
releases=(
  "argocd-applications argocd-applications argocd values/base.yaml"
  "postgres postgres organizzolini values/base.yaml"
  "cloudflared cloudflared organizzolini values/base.yaml"
)

for entry in "${releases[@]}"; do
  read -r release chart namespace files <<<"${entry}"
  arguments=("${helm_root}/${chart}" --namespace "${namespace}")
  IFS=',' read -ra values <<<"${files}"
  for file in "${values[@]}"; do
    arguments+=(--values "${helm_root}/${chart}/${file}")
  done
  case "${mode}" in
    lint) helm lint --strict "${arguments[@]}" ;;
    render)
      mkdir -p "${2:?render needs an output directory}"
      helm template "${release}" "${arguments[@]}" >"${2}/${release}.yaml"
      ;;
    *)
      echo "unknown mode: ${mode}" >&2
      exit 2
      ;;
  esac
done
