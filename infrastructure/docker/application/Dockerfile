# syntax=docker/dockerfile:1

# One Dockerfile for every Node application image (`--target node`) and every static site image
# (`--target static`). The base image tags are literal so Dependabot reads them. `docker-image.sh` builds it from the workspace root, passing the build
# arguments below from the project's own `infrastructure/image.env`.
# The workspace install, shared by every image: the pnpm closure of one project, with its dev dependencies. The full
# (not slim) Node image carries the toolchain a native addon compiles with (g++, make, python3), and this stage never ships.
FROM node:26.13.1-trixie AS install
ARG PROJECT
# The pnpm release the root package.json `packageManager` names; docker-image.sh fills it.
ARG PNPM_VERSION
# Native dependencies to rebuild after the install, which skips scripts.
ARG REBUILT_PACKAGES=""
ENV npm_config_store_dir=/pnpm/store
WORKDIR /workspace
COPY . .
# An optional CA bundle (`--secret id=ca-bundle`) lets the install trust a TLS-inspecting proxy; it is never baked in.
RUN --mount=type=secret,id=ca-bundle,required=false \
    --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    if [ -f /run/secrets/ca-bundle ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/ca-bundle; fi; \
    npm install --global "pnpm@${PNPM_VERSION}" && \
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
# A step after the build that needs the network, such as fetching data the image bakes in.
ARG PREPARE_COMMAND=""
# Project paths copied beside the build output.
ARG RUNTIME_PATHS=""
# Files under /app the application writes at startup: each links to the same name in /tmp, the one place a read-only root filesystem leaves writable.
ARG TEMPORARY_PATHS=""
WORKDIR /workspace/${PROJECT_DIRECTORY}
RUN env ${BUILD_ENVIRONMENT} sh -c "${BUILD_COMMAND}"
RUN --mount=type=secret,id=ca-bundle,required=false \
    if [ -f /run/secrets/ca-bundle ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/ca-bundle; fi; \
    if [ -n "$PREPARE_COMMAND" ]; then sh -c "$PREPARE_COMMAND"; fi
RUN mkdir /out && \
    cp -a "${OUTPUT_PATH}/." /out/ && \
    for path in ${RUNTIME_PATHS}; do cp -a "$path" /out/; done && \
    for path in ${TEMPORARY_PATHS}; do ln -s "/tmp/$(basename "$path")" "/out/$path"; done

# What the Node runtime keeps from Debian: `tini`, and `dash` as `sh` for the start command (`/bin` links to `/usr/bin`). The `app` directory is
# owned by the runtime user, and `node` is reachable on PATH, as a Kubernetes `command` names it.
# The tini version is Debian trixie's; Dependabot does not track it, so a base image bump that moves trixie past it needs the new version here.
FROM node:26.13.1-trixie-slim AS runtime-tools
RUN apt-get update && \
    apt-get install --yes --no-install-recommends tini=0.19.0-3+b8 && \
    rm -rf /var/lib/apt/lists/* && \
    mkdir -p /tools/app /tools/usr/bin /tools/usr/local/bin && \
    chown 10001:10001 /tools/app && \
    cp /usr/bin/tini /tools/usr/bin/tini && \
    cp /bin/dash /tools/usr/bin/sh && \
    ln -s /nodejs/bin/node /tools/usr/local/bin/node

# A Node application: the build output and its production node_modules, no dev dependencies, on a distroless base
# (glibc and Node only: no package manager, no coreutils, so the start command uses only shell builtins).
FROM gcr.io/distroless/nodejs26-debian13:nonroot AS node
LABEL org.opencontainers.image.source="https://github.com/organizzolini/codebase"
# The entry file, run with node from /app.
ARG ENTRY
# The port the application listens on, and the variable it reads that from; the image sets it unless the environment does.
ARG PORT=""
ARG PORT_VARIABLE=""
ARG EXPOSED_PORTS=""
ARG RUNTIME_NODE_OPTIONS=""
ENV NODE_ENV=production \
    NODE_OPTIONS=${RUNTIME_NODE_OPTIONS} \
    APPLICATION_ENTRY=${ENTRY} \
    APPLICATION_PORT=${PORT} \
    APPLICATION_PORT_VARIABLE=${PORT_VARIABLE}
# tini is PID 1, so signals reach Node and orphaned children are reaped.
COPY --from=runtime-tools /tools/ /
# Sets the application's port variable unless the environment does, then runs the entry file with node.
COPY infrastructure/docker/application/start.sh /usr/local/bin/start
WORKDIR /app
COPY --from=build /out ./
USER 10001:10001
EXPOSE ${EXPOSED_PORTS}
# Kubernetes ignores HEALTHCHECK and probes the application itself, so the image declares none.
HEALTHCHECK NONE
ENTRYPOINT ["tini", "--"]
CMD ["start"]

# The nginx server block for a static site, with its port filled in.
FROM install AS static-configuration
ARG PORT
RUN sed "s/__PORT__/${PORT}/g" infrastructure/docker/nginx/default.conf.template > /default.conf

# A static site: unprivileged nginx serves the build output as UID 101, the image's own user.
FROM nginxinc/nginx-unprivileged:1.30.6-alpine3.24 AS static
LABEL org.opencontainers.image.source="https://github.com/organizzolini/codebase"
ARG PORT
ENV APPLICATION_PORT=${PORT}
COPY --from=build /out /usr/share/nginx/html
COPY --from=static-configuration /default.conf /etc/nginx/conf.d/default.conf
EXPOSE ${PORT}
USER 101
HEALTHCHECK CMD wget -q -O /dev/null "http://127.0.0.1:${APPLICATION_PORT}/" || exit 1
