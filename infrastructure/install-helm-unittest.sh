#!/usr/bin/env bash
# Installs the pinned helm-unittest plugin unless helm already lists it.
# The tarball must match its sha256, and the plugin's install hook is dropped
# since it would download the tarball again. Linux amd64 and arm64 only.

set -euo pipefail

version="1.2.1"

if helm plugin list | awk 'NR > 1 { print $1 }' | grep -qx unittest; then
  exit 0
fi

case "$(uname -s)-$(uname -m)" in
  Linux-x86_64)
    architecture="amd64"
    checksum="48e86ecc1467b009630e5954375e5d8494139f73b466df5fe8c04fa45b634939"
    ;;
  Linux-aarch64 | Linux-arm64)
    architecture="arm64"
    checksum="c66062713cd3cbb1a80d7098bd1d4a48db8438f56b43fb6377df65447f93f8de"
    ;;
  *)
    echo "unsupported platform for the helm-unittest plugin: Linux amd64 or arm64 only" >&2
    exit 1
    ;;
esac

directory="$(mktemp -d)"
trap 'rm -rf "${directory}"' EXIT

curl --proto '=https' --tlsv1.2 -fsSL -o "${directory}/helm-unittest.tgz" \
  "https://github.com/helm-unittest/helm-unittest/releases/download/v${version}/helm-unittest-linux-${architecture}-${version}.tgz"
echo "${checksum}  ${directory}/helm-unittest.tgz" | sha256sum -c -

mkdir "${directory}/plugin"
tar xzf "${directory}/helm-unittest.tgz" -C "${directory}/plugin"
sed -i '/^platformHooks:/,$d' "${directory}/plugin/plugin.yaml"

plugins="$(helm env HELM_PLUGINS)/unittest"
mkdir -p "${plugins}"
cp -R "${directory}/plugin/." "${plugins}/"
