#!/bin/sh
# Build or push one project's image from the shared application Dockerfile.
# Usage: DOCKER_OUTPUT=--load|--push docker-image.sh <project directory>
# Run from the workspace root. The project's infrastructure/image.env names what it needs.
# IMAGE_TAG (default local) tags the image; IMAGE_CA_BUNDLE is a PEM file that
# lets the build trust a TLS-inspecting proxy.
set -eu

project_directory=$1
. "$project_directory/infrastructure/image.env"

# The port is the one project-ports keeps in step with the project's name.
port=$(sed -n 's/^[A-Z_]*_API_PORT=\([0-9][0-9]*\)$/\1/p' "$project_directory/configuration/.env.default" 2>/dev/null | head -n 1)
if [ -z "$port" ]; then
  port=$(sed -n 's/.*[^A-Za-z_]port: *\([0-9][0-9]*\).*/\1/p' "$project_directory/configuration/vite.config.mts" 2>/dev/null | head -n 1)
fi

# The pnpm release the workspace pins in its root package.json.
pnpm_version=$(sed -n 's/.*"packageManager": *"pnpm@\([^"+]*\).*/\1/p' package.json | head -n 1)
: "${pnpm_version:?package.json has no pnpm packageManager}"

set -- --platform linux/amd64 "${DOCKER_OUTPUT:?set DOCKER_OUTPUT to --load or --push}" \
  --file infrastructure/docker/application/Dockerfile --target "$TARGET" \
  --tag "ghcr.io/organizzolini/$PROJECT:${IMAGE_TAG:-local}" \
  --build-arg "PROJECT=$PROJECT" --build-arg "PNPM_VERSION=$pnpm_version" --build-arg "PROJECT_DIRECTORY=$project_directory" \
  --build-arg "PORT=$port" --build-arg "EXPOSED_PORTS=$port ${EXTRA_PORTS:-}" \
  --build-arg "ENTRY=${ENTRY:-}" --build-arg "PORT_VARIABLE=${PORT_VARIABLE:-}"

for name in REBUILT_PACKAGES BUILD_COMMAND BUILD_ENVIRONMENT OUTPUT_PATH \
  PREPARE_COMMAND RUNTIME_PATHS RUNTIME_NODE_OPTIONS TEMPORARY_PATHS; do
  eval "value=\${$name:-}"
  if [ -n "$value" ]; then
    set -- "$@" --build-arg "$name=$value"
  fi
done

if [ -n "${IMAGE_CA_BUNDLE:-}" ]; then
  set -- "$@" --secret "id=ca-bundle,src=$IMAGE_CA_BUNDLE"
fi

exec docker buildx build "$@" .
