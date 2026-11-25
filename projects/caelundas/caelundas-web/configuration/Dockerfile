# syntax=docker/dockerfile:1

# Build from the workspace root: the install needs every workspace package the web app imports.
FROM node:26.13.1-trixie-slim AS install
ENV npm_config_store_dir=/pnpm/store
WORKDIR /workspace
COPY . .
# An optional CA bundle (`--secret id=ca-bundle`) lets the install trust a TLS-inspecting proxy; it is never baked in.
RUN --mount=type=secret,id=ca-bundle,required=false \
    --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    if [ -f /run/secrets/ca-bundle ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/ca-bundle; fi; \
    npm install --global pnpm@12.21.0 && \
    pnpm install --frozen-lockfile --ignore-scripts --filter caelundas-web...

FROM install AS build
# Vite reads VITE_ variables when it builds, so the API address is baked into the JavaScript.
ARG VITE_CAELUNDAS_API_URL=https://caelundas.organizzolini.net/graphql
WORKDIR /workspace/projects/caelundas/caelundas-web
RUN pnpm exec vite build --config configuration/vite.config.mts

# Unprivileged nginx serves the prerendered single-page app on 8080 as UID 101, the image's own user.
FROM nginxinc/nginx-unprivileged:1.30.6-alpine3.24 AS runtime
LABEL org.opencontainers.image.source="https://github.com/organizzolini/codebase"
# Only the client output: the server bundle the same build writes is never served.
COPY --from=build /workspace/projects/caelundas/caelundas-web/dist/client /usr/share/nginx/html
COPY projects/caelundas/caelundas-web/configuration/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
USER 101
HEALTHCHECK CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1
