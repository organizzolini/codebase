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

- **One shared Dockerfile.** `infrastructure/docker/application/Dockerfile` has
  an `install` and a `build` stage every image shares, then a `node` target for
  the applications and a `static` target for the web app.
  Each application owns its build in `<project>/infrastructure/docker-compose.yml`,
  a standard Compose file with one service: its context, Dockerfile, arguments,
  label, platform and optional CA-bundle secret. The shared `docker` target in
  `nx.json` applies to every project tagged `container:image`: `docker:build`
  runs `docker compose build` (loaded into the daemon) and `docker:push` runs
  `docker compose build --push`, one step. A new image is a Compose file and the
  tag; `nx run-many --target=docker --configuration=push` then picks it up.
  Rejected: a Dockerfile per project, which repeated the install, non-root, label
  and tini lines three times, and a per-project Dockerfile that `FROM`s a shared
  base image, which needs a second build before the first.
- **Compile every module to a file; install the rest as production packages.**
  rolldown writes one JavaScript file per module at its source path (decorator
  metadata on, `keepNames` for class names) and builds the migrations as entry
  points of their own, so a glob built from `import.meta.dirname` finds the
  same files in source and in an image. Third-party packages stay external:
  the bundle plugin copies exactly the packages the output imports, and their
  dependencies, out of the pnpm install into `dist/<project>/node_modules`.
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
  `better-sqlite3` for TypeORM) are left out, as are `@types/*` packages and
  `@fig/complete-commander`: `nest-commander` requires it (and with it
  `prettier`, 9 MB) only to write a shell completion spec, which no application
  here enables. `@golevelup/nestjs-discovery` stays: `nest-commander` builds its
  command registry on it at start.
- **Only runtime files ship.** The copy keeps a file only if it is code or data
  a run loads (`.js .mjs .cjs .json .node .wasm .proto .graphql .gql .sql`) or a
  license, so source maps, `.d.ts`, Markdown, TypeScript sources, `tsbuildinfo`
  and a native build's intermediate objects and sources never reach the image.
  An extension allow-list needs no upkeep when a package adds a new tooling
  file; the bundle tests assert none ships.
- **Migrations run at start.** `PostgresqlModule` applies the pending migrations
  it is given before the application serves, in one transaction that first takes
  `pg_advisory_xact_lock`, so replicas starting together migrate one at a time.
  The lock is transaction-scoped on purpose: the API reaches Postgres through a
  transaction-mode PgBouncer, where a session-level lock could land on a
  different backend than the migration and never release. TypeORM's
  `MigrationExecutor` given that runner joins its open transaction, so the lock
  and the migrations share a backend. A failed migration closes the connection
  and is not retried (`toRetry`), so the pod exits instead of leaking pools.
  The migration hook and its chart, image tag and variable are gone.
- **Ports.** In production every application listens on 8080, and Lightship on
  9000. The chart sets the API's port in its container environment
  (`CAELUNDAS_API_PORT: "8080"`), and nginx listens on 8080; the hash-derived
  ports from `project-ports` are a local-development concern only. The Service
  maps 80 to 8080 and the tunnel reaches each Service on port 80, so no Terraform
  or Service value repeats a port. The API's own default stays 3000, because the
  generator template pins that literal and `conformetry-validate` rejects another.
- **Tini and one start command.** The `node` target is `ENTRYPOINT ["tini", "--",
  "node"]` with `CMD ["main.js"]`, for signals and zombie reaping, per
  docker-node. The build stage renames each project's entry file to `main.js`
  (`ENTRY`, a build argument only), so no image has a start script or a shell. A
  Job passes `args`, such as the CLI's `main.js caelundas`; a Kubernetes `command`
  would replace the entry point, so none sets one.
- **`HEALTHCHECK NONE` on Node images.** Kubernetes ignores `HEALTHCHECK` and
  probes Lightship on 9000, which answers only inside Kubernetes, so there is
  nothing cleaner to check outside it.
- **Base: `gcr.io/distroless/nodejs26-debian13`.** Node 26.13.1 on glibc, 243 MB
  against 353 MB for `node:26.13.1-trixie-slim`, with no package manager or
  coreutils. It has no `tini`, so a stage copies in `tini` and a `node` link on
  `PATH`; nothing at start needs a shell. The build runs on `node:26.13.1-trixie`, the same Debian
  release and glibc as the base, with the toolchain `sweph` compiles with, so
  its binding runs unchanged and no stage calls `apt-get install` on a
  variable package list (`tini` is the one pinned package). The tag
  tracks Node 26 by minor; Dependabot has no `docker` entry for these
  Dockerfiles, so a digest would freeze security fixes.
- **Not added: SBOM or provenance flags.** They fail on the classic image
  store; BuildKit adds minimal provenance by default.
- **Web image.** Moved onto the shared Dockerfile with a shared nginx server
  block. nginx-unprivileged as UID 101, the shell at `index.html` with a
  `try_files` fallback, and hashed assets cached as immutable match the
  SPA-mode guidance.
- **Read-only root filesystem.** The charts turn it on, with `/tmp` writable.
  The API's `autoSchemaFile` writes `schema.gql` beside its module on every
  start, and the generator template pins that literal, so the image links the
  file to `/tmp` (`TEMPORARY_PATHS`) at build time. Run the API image with a
  read-only root and only `/tmp` writable to check it.

## Image size

Measured 2026-11-26 with `docker image inspect` (`Size`, disk use of the
unpacked layers; the compressed push is 68 MB for each Node image).

| Part                         | api before | api after | cli before | cli after |
| ---------------------------- | ---------: | --------: | ---------: | --------: |
| Base                         |     353 MB |    243 MB |     353 MB |    243 MB |
| `tini`                       |       1 MB |    0.2 MB |       1 MB |    0.2 MB |
| Application and node_modules |     189 MB |     88 MB |     133 MB |     59 MB |
| Files in node_modules        |     24,000 |    11,650 |     17,000 |     7,950 |
| Image                        |     563 MB |    339 MB |     506 MB |    310 MB |

Before, the 189 MB of the API was 24 MB source maps, 14 MB declarations, 5 MB
TypeScript sources, 4 MB Markdown and 10 MB `prettier`. The CLI's `sweph` was
8 MB for a 0.9 MB binding: two copies of it, a static archive, objects, C
sources and a Node compile cache. The Node binary is 150 MB of the base.

| Option (measured, api / cli)                              | Size             | Risk   | Verdict                   |
| --------------------------------------------------------- | ---------------- | ------ | ------------------------- |
| Prune to runtime files and drop type and tooling packages | 450 / 421 MB     | low    | done                      |
| Distroless base alone                                     | 452 / 395 MB     | low    | done                      |
| Both                                                      | 339 / 310 MB     | low    | done                      |
| `node:26-alpine` with the pruned tree                     | 347 / 318 MB     | medium | no: musl, larger          |
| `cgr.dev` Node image                                      | base 256 MB      | medium | no: only `latest` is free |
| Bundle third-party code (no `preserveModules`)            | about 270 MB api | high   | not done                  |

- **Alpine** is 8 MB larger than distroless here and changes the C library: `sweph`
  would have to be compiled and checked on musl, and Node publishes musl builds
  as experimental. The sandbox could not reach the Alpine package mirror, so
  the musl `sweph` build was not tried; the size alone rules it out.
- **The `cgr.dev` Node image** serves only the `latest` tag without a subscription, so the
  Node version cannot be pinned.
- **Bundling third-party code** shrinks the application directory to 26 MB with
  `pg` and `pino-pretty` kept installed (the whole app, vendor chunks included),
  so about 270 MB for the API. It boots and serves, but breaks two layout
  assumptions: with `preserveModules` the CommonJS packages' lazy initializers
  form cycles across files and fail at start (`init_logger_service is not a
function` in `@nestjs/common`), and without it `import.meta.dirname` becomes
  the bundle's directory, so the migrations glob finds nothing and the schema
  file moves. It also pulls `typescript`, `prettier` and `babel` into the
  bundle through optional `require` calls unless each is listed as external.
  It needs a change to the database module's glob and a list of optional peers
  to keep external, which this repository's templates pin, so it is a
  recommendation: moving the glob to a configured path would unlock about 70 MB.
- **Left as is:** a single custom Node build without full ICU, a single
  executable application (it needs one bundled file, so the same blocker), and
  UPX-style packers, which the task excluded. `typeorm` (9 MB) and
  `es-toolkit` (9 MB) load files by name or ship dual builds, so they stay whole.
