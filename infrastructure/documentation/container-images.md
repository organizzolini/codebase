# Container images

What the vendors' own documentation says about building the `caelundas-api`,
`caelundas-cli` and `caelundas-web` images, and what this repository does with
it. Every claim names the page that owns it. Read on 2026-11-26.

## Sources

- [Docker build guide](https://docs.docker.com/build/building/best-practices/)
- [Docker build cache optimization](https://docs.docker.com/build/cache/optimize/)
- [Dockerfile reference](https://docs.docker.com/reference/dockerfile/)
- [Docker build attestations](https://docs.docker.com/build/metadata/attestations/)
- [`nodejs/docker-node` guide](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
- [`pnpm deploy`](https://pnpm.io/cli/deploy)
- [NestJS deployment](https://docs.nestjs.com/deployment) and [serverless](https://docs.nestjs.com/faq/serverless)
- [TanStack Start hosting](https://tanstack.com/start/latest/docs/framework/react/guide/hosting) and [SPA mode](https://tanstack.com/start/latest/docs/framework/react/guide/spa-mode)
- [`nginx/docker-nginx-unprivileged`](https://github.com/nginx/docker-nginx-unprivileged)
- [Distroless](https://github.com/GoogleContainerTools/distroless)
- [Kubernetes probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
- [Trivy misconfiguration scanning](https://trivy.dev/latest/docs/scanner/misconfiguration/)
- rolldown 1.2.18's own type declarations (`DecoratorOptions`), read from the installed package.

## Findings

- **Multi-stage.** Docker: split stages "so the output contains only what the
  application needs to run". docker-node: install and build first, then copy
  only `node_modules` and `dist` for a "smaller and hardened final image".
- **Production dependencies.** NestJS: set `NODE_ENV=production`, run
  `node dist/main.js`, and "install only production dependencies". `pnpm deploy
--prod` skips `devDependencies`, but installs every dependency of a workspace
  package, which are `file:` dependencies in the deploy lockfile.
- **Bundle, compile or ship source.** NestJS documents `nest build` (tsc) for a
  server and a webpack bundle with `externals: []` only for serverless, where
  cold start matters; it keeps class names with `keep_classnames` because
  validators read them. It says nothing about decorators or which packages stay
  external. rolldown's `DecoratorOptions` supports `legacy` and
  `emitDecoratorMetadata`, which NestJS, GraphQL code-first and TypeORM need.
- **PID 1.** docker-node: Node "isn't built to run as PID 1", so use `--init` or
  Tini. Docker: use exec-form `CMD`; a shell form is not PID 1 and gets no signal.
- **Non-root.** Docker: `USER` with an explicit UID. docker-node: run unprivileged.
  Trivy flags a final `USER root`.
- **`.dockerignore`.** Docker: keep `node_modules`, build output and logs out of
  the context for less data and fewer cache invalidations.
- **Layers and caches.** Docker: expensive, rarely changed steps first; cache
  mounts keep a package manager's downloads between builds; remove apt lists in
  the `RUN` that created them.
- **Base image.** Docker: a minimal trusted base, pinned to a digest, with
  Dependabot to update it. Distroless has no shell or package manager, so a
  shell script entry point needs a debug image. docker-node shows the native
  module toolchain in a builder stage only.
- **Probes.** Kubernetes runs the probes in the Pod spec. Its probe page does
  not mention Dockerfile `HEALTHCHECK`; that instruction is a Docker feature.
- **Attestations.** BuildKit adds minimal provenance by default; SBOMs need
  `--sbom=true`; the classic image store cannot keep either on `--load`.
- **TanStack Start.** SPA mode renders the root route ahead of time to a shell
  (`/_shell.html` unless `prerender.outputPath` changes it); "a CDN that serves
  static files is enough": serve files, then rewrite every other 404 to the
  shell. The web image does that, with the shell at `/index.html`.
- **nginx-unprivileged.** Listens on 8080 and keeps its pid file and temp paths
  in `/tmp`, so a replaced `conf.d/default.conf` needs nothing else.

## Decisions

- **One shared Dockerfile.** `infrastructure/docker/application.Dockerfile` has
  an `install` and a `build` stage every image shares, then a `node` target for
  the applications and a `static` target for the web app. Each project's
  `infrastructure/image.env` supplies the arguments, and
  `infrastructure/docker/docker-image.sh` turns them into one
  `docker buildx build`: `--load` for `docker:build`, `--push` for `docker:push`.
  Rejected: a Dockerfile per project, which repeated the install, non-root, label
  and tini lines three times, and a per-project Dockerfile that `FROM`s a shared
  base image, which needs a second build before the first.
- **Compile every module to a file; install the rest as production packages.**
  rolldown writes one JavaScript file per module at its source path (decorator
  metadata on, `keepNames` for class names) and builds the migrations as entry
  points of their own, so a glob built from `import.meta.dirname` finds the
  same files in source and in an image. Third-party packages stay external:
  the bundle plugin copies exactly the packages the output imports, and their
  dependencies, out of the pnpm install into `dist/bundle/node_modules`.
  Rejected: one bundle per entry, which leaves no migration files to glob.
- **Rejected: `pnpm deploy --prod`.** `@codebase/observability` lists `vitest`
  and `@codebase/testing`, and `@codebase/persistence` lists `typescript`,
  `@testcontainers/postgresql` and `@nestjs/testing`, as dependencies. Deploy
  would install them all. Fixing those manifests is a template change.
- **Rejected: swc or tsc emit per file.** The sources import each other without
  file extensions (`moduleResolution: bundler`), which Node's ESM loader cannot
  run, and workspace packages export `.ts` paths.
- **Rejected: bundle every dependency.** The NestJS recipe is for serverless.
  Here TypeORM loads `pg`, pino loads `pino-pretty` and Nest loads
  `@nestjs/platform-express` by name, so they stay installed regardless.
- **Dependencies by need.** A package is followed through its dependencies,
  optional dependencies and non-optional peers only. Optional peers that pnpm
  linked because the workspace installs them (`typescript` for cosmiconfig,
  `better-sqlite3` for TypeORM) are left out. What remains of tooling is a
  production dependency of a runtime library: `prettier` through `nest-commander`,
  which `@codebase/persistence` imports.
- **Migrations run at start.** `PostgresqlModule` applies the pending migrations
  it is given before the application serves, under a Postgres advisory lock
  (`pg_advisory_lock`), so replicas starting together migrate one at a time.
  The migration hook and its chart, image tag and variable are gone.
- **Ports.** Each image listens on the port `project-ports` derived from its
  name, read from `configuration/.env.default` or `vite.config.mts` when the
  image is built, so the Dockerfile and `image.env` hold no number. The chart
  values and the tunnel rule hold the same number, since YAML and HCL cannot
  read it; their tests assert it.
- **Tini.** The `node` target runs under `tini` as `ENTRYPOINT`, for signals and
  zombie reaping, per docker-node. A Kubernetes `command` replaces the entry
  point, so the ingestion Job names `tini` itself.
- **`HEALTHCHECK NONE` on Node images.** Kubernetes ignores `HEALTHCHECK` and
  probes Lightship on 9000, which answers only inside Kubernetes, so there is
  nothing cleaner to check outside it.
- **Kept: `node:...-trixie-slim`, not distroless or alpine.** `sweph` is a native
  addon built against glibc, and slim keeps debugging simple. The tag stays
  unpinned by digest: Dependabot has no `docker` entry for these Dockerfiles, so
  a digest would freeze security fixes. Adding the ecosystem is a separate change.
- **Not added: SBOM or provenance flags.** They fail on the classic image
  store; BuildKit adds minimal provenance by default.
- **Web image.** Moved onto the shared Dockerfile with a shared nginx server
  block. nginx-unprivileged as UID 101, the shell at `index.html` with a
  `try_files` fallback, and hashed assets cached as immutable match the
  SPA-mode guidance.
- **Open item.** A read-only root filesystem needs the API schema written
  elsewhere (`autoSchemaFile` writes beside its module, so that one directory is
  writable) and the CLI logs under `output/`. The charts leave it off.
