# syntax=docker/dockerfile:1

# One Dockerfile for every Node application image (`--target node`) and every static site image
# (`--target static`). `docker-image.sh` builds it from the workspace root, passing the build
# arguments below from the project's own `infrastructure/image.env`.
ARG NODE_IMAGE=node:26.13.1-trixie-slim
ARG NGINX_IMAGE=nginxinc/nginx-unprivileged:1.30.6-alpine3.24

# The workspace install, shared by every image: the pnpm closure of one project, with its dev dependencies.
FROM ${NODE_IMAGE} AS install
ARG PROJECT
# Packages the install compiles with, such as a native addon's toolchain; they stay in this stage.
ARG BUILD_PACKAGES=""
# Native dependencies to rebuild after the install, which skips scripts.
ARG REBUILT_PACKAGES=""
ENV npm_config_store_dir=/pnpm/store
RUN if [ -n "$BUILD_PACKAGES" ]; then \
      apt-get update && \
      apt-get install --yes --no-install-recommends $BUILD_PACKAGES && \
      rm -rf /var/lib/apt/lists/*; \
    fi
WORKDIR /workspace
COPY . .
# An optional CA bundle (`--secret id=ca-bundle`) lets the install trust a TLS-inspecting proxy; it is never baked in.
RUN --mount=type=secret,id=ca-bundle,required=false \
    --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    if [ -f /run/secrets/ca-bundle ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/ca-bundle; fi; \
    npm install --global pnpm@12.21.0 && \
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
WORKDIR /workspace/${PROJECT_DIRECTORY}
RUN env ${BUILD_ENVIRONMENT} sh -c "${BUILD_COMMAND}"
RUN --mount=type=secret,id=ca-bundle,required=false \
    if [ -f /run/secrets/ca-bundle ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/ca-bundle; fi; \
    if [ -n "$PREPARE_COMMAND" ]; then sh -c "$PREPARE_COMMAND"; fi
RUN mkdir /out && \
    cp -a "${OUTPUT_PATH}/." /out/ && \
    for path in ${RUNTIME_PATHS}; do cp -a "$path" /out/; done

# A Node application: the build output and its production node_modules, no dev dependencies.
FROM ${NODE_IMAGE} AS node
LABEL org.opencontainers.image.source="https://github.com/organizzolini/codebase"
# The entry file, run with node from /app.
ARG ENTRY
# The port the application listens on, and the variable it reads that from; the image sets it unless the environment does.
ARG PORT=""
ARG PORT_VARIABLE=""
ARG EXPOSED_PORTS=""
ARG RUNTIME_NODE_OPTIONS=""
# Directories under /app the application writes to, owned by the runtime user; the rest stays root-owned.
ARG WRITABLE_PATHS=""
ENV NODE_ENV=production \
    NODE_OPTIONS=${RUNTIME_NODE_OPTIONS} \
    APPLICATION_ENTRY=${ENTRY} \
    APPLICATION_PORT=${PORT} \
    APPLICATION_PORT_VARIABLE=${PORT_VARIABLE}
# tini is PID 1, so signals reach Node and orphaned children are reaped.
RUN apt-get update && \
    apt-get install --yes --no-install-recommends tini && \
    rm -rf /var/lib/apt/lists/* && \
    mkdir /app && \
    chown 10001:10001 /app
WORKDIR /app
COPY --from=build /out ./
RUN for path in ${WRITABLE_PATHS}; do chown 10001:10001 "$path"; done
USER 10001:10001
EXPOSE ${EXPOSED_PORTS}
# Kubernetes ignores HEALTHCHECK and probes the application itself, so the image declares none.
HEALTHCHECK NONE
ENTRYPOINT ["tini", "--"]
CMD ["sh", "-c", "if [ -n \"$APPLICATION_PORT_VARIABLE\" ] && [ -z \"$(printenv \"$APPLICATION_PORT_VARIABLE\")\" ]; then export \"$APPLICATION_PORT_VARIABLE=$APPLICATION_PORT\"; fi; exec node $APPLICATION_ENTRY"]

# The nginx server block for a static site, with its port filled in.
FROM install AS static-configuration
ARG PORT
RUN sed "s/__PORT__/${PORT}/g" infrastructure/docker/nginx/default.conf.template > /default.conf

# A static site: unprivileged nginx serves the build output as UID 101, the image's own user.
FROM ${NGINX_IMAGE} AS static
LABEL org.opencontainers.image.source="https://github.com/organizzolini/codebase"
ARG PORT
ENV APPLICATION_PORT=${PORT}
COPY --from=build /out /usr/share/nginx/html
COPY --from=static-configuration /default.conf /etc/nginx/conf.d/default.conf
EXPOSE ${PORT}
USER 101
HEALTHCHECK CMD wget -q -O /dev/null "http://127.0.0.1:${APPLICATION_PORT}/" || exit 1
