# syntax=docker/dockerfile:1

# Build from the workspace root: the install needs every workspace package the API imports.
FROM node:26.13.1-trixie-slim AS install
ENV npm_config_store_dir=/pnpm/store
WORKDIR /workspace
COPY . .
# An optional CA bundle (`--secret id=ca-bundle`) lets the install trust a TLS-inspecting proxy; it is never baked in.
RUN --mount=type=secret,id=ca-bundle,required=false \
    --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    if [ -f /run/secrets/ca-bundle ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/ca-bundle; fi; \
    npm install --global pnpm@12.21.0 && \
    pnpm install --frozen-lockfile --ignore-scripts --filter caelundas-api...

FROM node:26.13.1-trixie-slim AS runtime
LABEL org.opencontainers.image.source="https://github.com/organizzolini/codebase"
ENV NODE_ENV=production
WORKDIR /workspace
# The API runs TypeScript source through @swc-node/register, a devDependency of this project, so the
# image keeps the dev dependencies of the API's closure rather than pruning to production ones.
# Workspace packages ship at their own paths (pnpm links them), outside node_modules, where swc transpiles them.
COPY --from=install /workspace/node_modules ./node_modules
COPY --from=install /workspace/configuration ./configuration
COPY --from=install /workspace/projects/caelundas/caelundas-api ./projects/caelundas/caelundas-api
COPY --from=install /workspace/projects/caelundas/caelundas-db ./projects/caelundas/caelundas-db
COPY --from=install /workspace/projects/common/observability ./projects/common/observability
COPY --from=install /workspace/projects/common/persistence ./projects/common/persistence
COPY --from=install /workspace/projects/common/testing ./projects/common/testing
# The GraphQL schema is written beside the root module at startup.
RUN chown -R 10001:10001 projects/caelundas/caelundas-api/src
WORKDIR /workspace/projects/caelundas/caelundas-api
ENV SWC_NODE_PROJECT=configuration/tsconfig.json
USER 10001:10001
EXPOSE 3000 9000
# Lightship answers only inside Kubernetes, so the check asks the GraphQL port itself.
HEALTHCHECK CMD node -e "fetch('http://127.0.0.1:3000/graphql', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{\"query\":\"{ __typename }\"}' }).then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"
CMD ["node", "--import", "@swc-node/register/esm-register", "src/caelundas-api.ts"]
