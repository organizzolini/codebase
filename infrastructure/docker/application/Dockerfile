# syntax=docker/dockerfile:1

# One Dockerfile for every Node application image (`--target node`) and every static site image
# (`--target static`). The base image tags are literal so Dependabot reads them. Each application's own `infrastructure/docker-compose.yml` builds it
# from the workspace root, passing the build arguments below. A Node application listens on 8080 (Lightship on 9000) and starts with `node main.js`.
# The workspace install, shared by every image: the pnpm closure of one project, with its dev dependencies. The full
# (not slim) Node image carries the toolchain a native addon compiles with (g++, make, python3), and this stage never ships.
FROM node:26.13.1-trixie AS install
ARG PROJECT
# Native dependencies to rebuild after the install, which skips scripts.
ARG REBUILT_PACKAGES=""
ENV npm_config_store_dir=/pnpm/store
WORKDIR /workspace
COPY . .
# An optional CA bundle (the `ca-bundle` secret, empty when unset) lets the install trust a TLS-inspecting proxy; it is never baked in.
# The pnpm release is the one the root package.json `packageManager` names.
RUN --mount=type=secret,id=ca-bundle,required=false \
    --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    if [ -s /run/secrets/ca-bundle ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/ca-bundle; fi; \
    pnpm_version=$(sed -n 's/.*"packageManager": *"pnpm@\([^"+]*\).*/\1/p' package.json) && \
    npm install --global "pnpm@${pnpm_version:?package.json has no pnpm packageManager}" && \
    pnpm install --frozen-lockfile --ignore-scripts --filter "${PROJECT}..." && \
    if [ -n "$REBUILT_PACKAGES" ]; then pnpm rebuild $REBUILT_PACKAGES; fi

# Builds the project and gathers what the image ships in /out: the build output and any runtime paths.
FROM install AS build
ARG PROJECT
ARG PROJECT_DIRECTORY
ARG BUILD_COMMAND="pnpm exec rolldown --config configuration/rolldown.config.ts"
# `NAME=value` pairs for the build command's environment, such as a Vite variable baked into the app.
ARG BUILD_ENVIRONMENT=""
ARG OUTPUT_PATH=/workspace/dist/${PROJECT}
# A Node application's built entry file, which the image runs as main.js.
ARG ENTRY=""
# A step after the build that needs the network, such as fetching data the image bakes in.
ARG PREPARE_COMMAND=""
# Project paths copied beside the build output.
ARG RUNTIME_PATHS=""
# Files under /app the application writes at startup: each links to the same name in /tmp, the one place a read-only root filesystem leaves writable.
ARG TEMPORARY_PATHS=""
WORKDIR /workspace/${PROJECT_DIRECTORY}
RUN env ${BUILD_ENVIRONMENT} sh -c "${BUILD_COMMAND}"
RUN --mount=type=secret,id=ca-bundle,required=false \
    if [ -s /run/secrets/ca-bundle ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/ca-bundle; fi; \
    if [ -n "$PREPARE_COMMAND" ]; then sh -c "$PREPARE_COMMAND"; fi
RUN mkdir /out && \
    cp -a "${OUTPUT_PATH}/." /out/ && \
    if [ -n "$ENTRY" ]; then mv "/out/${ENTRY}" /out/main.js; fi && \
    for path in ${RUNTIME_PATHS}; do cp -a "$path" /out/; done && \
    for path in ${TEMPORARY_PATHS}; do ln -s "/tmp/$(basename "$path")" "/out/$path"; done

# What the Node runtime keeps from Debian: `tini`. The `app` directory is owned by the runtime user, and `node` is reachable on PATH,
# as the entrypoint and a Kubernetes `command` name it.
# The tini version is Debian trixie's; Dependabot does not track it, so a base image bump that moves trixie past it needs the new version here.
FROM node:26.13.1-trixie-slim AS runtime-tools
RUN apt-get update && \
    apt-get install --yes --no-install-recommends tini=0.19.0-3+b8 && \
    rm -rf /var/lib/apt/lists/* && \
    mkdir -p /tools/app /tools/usr/bin /tools/usr/local/bin && \
    chown 10001:10001 /tools/app && \
    cp /usr/bin/tini /tools/usr/bin/tini && \
    ln -s /nodejs/bin/node /tools/usr/local/bin/node

# A Node application: the build output and its production node_modules, no dev dependencies, on a distroless base
# (glibc and Node only: no shell, so nothing runs at start but `node main.js`).
FROM gcr.io/distroless/nodejs26-debian13:nonroot AS node
ARG RUNTIME_NODE_OPTIONS=""
ENV NODE_ENV=production \
    NODE_OPTIONS=${RUNTIME_NODE_OPTIONS}
# tini is PID 1, so signals reach Node and orphaned children are reaped.
COPY --from=runtime-tools /tools/ /
WORKDIR /app
COPY --from=build /out ./
USER 10001:10001
# The application, and Lightship's probes.
EXPOSE 8080 9000
# Kubernetes ignores HEALTHCHECK and probes the application itself, so the image declares none.
HEALTHCHECK NONE
ENTRYPOINT ["tini", "--", "node"]
CMD ["main.js"]

# A static site: unprivileged nginx serves the build output as UID 101, the image's own user, on 8080.
FROM nginxinc/nginx-unprivileged:1.30.6-alpine3.24 AS static
COPY --from=build /out /usr/share/nginx/html
COPY infrastructure/docker/nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
USER 101
HEALTHCHECK CMD wget -q -O /dev/null "http://127.0.0.1:8080/" || exit 1
