# syntax=docker/dockerfile:1

# Build from the workspace root: the install needs every workspace package the CLI imports.
# One image serves the ingestion Jobs (default command) and the API's pre-sync migration hook (`caelundas-migrate`).
FROM node:26.13.1-trixie-slim AS install
ENV npm_config_store_dir=/pnpm/store
WORKDIR /workspace
COPY . .
# sweph compiles its native binding on install, which needs a toolchain.
RUN apt-get update && \
    apt-get install --yes --no-install-recommends g++ make python3 && \
    rm -rf /var/lib/apt/lists/*
# An optional CA bundle (`--secret id=ca-bundle`) lets the install trust a TLS-inspecting proxy; it is never baked in.
RUN --mount=type=secret,id=ca-bundle,required=false \
    --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    if [ -f /run/secrets/ca-bundle ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/ca-bundle; fi; \
    npm install --global pnpm@12.21.0 && \
    pnpm install --frozen-lockfile --ignore-scripts --filter caelundas-cli... && \
    pnpm rebuild sweph
# The Swiss Ephemeris files are fetched here, so a run never downloads them.
WORKDIR /workspace/projects/caelundas/caelundas-cli
RUN --mount=type=secret,id=ca-bundle,required=false \
    if [ -f /run/secrets/ca-bundle ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/ca-bundle; fi; \
    NODE_USE_ENV_PROXY=1 SWC_NODE_PROJECT=configuration/tsconfig.json \
      node --import @swc-node/register/esm-register src/ephemeris-download-cli.main.ts ephemeris-download

FROM node:26.13.1-trixie-slim AS runtime
LABEL org.opencontainers.image.source="https://github.com/organizzolini/codebase"
ENV NODE_ENV=production
WORKDIR /workspace
# The CLI and the migrations run TypeScript source through @swc-node/register, a devDependency of the workspace root, so the
# image keeps the dev dependencies of the CLI's closure rather than pruning to production ones.
# Workspace packages ship at their own paths (pnpm links them), outside node_modules, where swc transpiles them.
# shortcut: ships dev dependencies, so the image is large, because the CLI and migrations run TypeScript through @swc-node/register; upgrade by moving that runtime dependency out of test tooling (template or persistence) and pruning with --prod
COPY --from=install /workspace/node_modules ./node_modules
COPY --from=install /workspace/configuration ./configuration
COPY --from=install /workspace/projects/caelundas/caelundas-cli ./projects/caelundas/caelundas-cli
COPY --from=install /workspace/projects/caelundas/caelundas-db ./projects/caelundas/caelundas-db
COPY --from=install /workspace/projects/common/observability ./projects/common/observability
COPY --from=install /workspace/projects/common/persistence ./projects/common/persistence
COPY --from=install /workspace/projects/common/testing ./projects/common/testing
COPY --chmod=755 projects/caelundas/caelundas-cli/configuration/caelundas-migrate.sh /usr/local/bin/caelundas-migrate
# The Job mounts an emptyDir here and the ingest writes its calendar files to it.
RUN mkdir -p /app/output && chown 10001:10001 /app/output
WORKDIR /workspace/projects/caelundas/caelundas-cli
# Node sizes its default heap from the container limit, about 760 MB under the Job's 1.5 GiB, which one year's
# events overrun when the calendar is written; 1 GiB leaves the rest for the native ephemeris and buffers.
ENV NODE_OPTIONS=--max-old-space-size=1024 \
    OUTPUT_DIRECTORY=/app/output \
    SWC_NODE_PROJECT=configuration/tsconfig.json
USER 10001:10001
# An ingestion Job runs to completion and serves nothing, so there is nothing to check.
HEALTHCHECK NONE
CMD ["node", "--import", "@swc-node/register/esm-register", "src/caelundas-cli.main.ts", "caelundas"]
