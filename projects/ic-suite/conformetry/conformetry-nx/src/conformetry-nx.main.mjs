#!/usr/bin/env node
// The `conformetry-nx-bootstrap-generators` command, wired into a consumer's
// postinstall.

// Named for the project, like every other root file, because a `src/` root
// only admits entry-point names. It runs `conformetry-nx.main.ts`, which the build
// also emits as the published package's `bin`; this file is the workspace's
// way in.

// The one entry point that runs TypeScript sources through a loader, since `postinstall` runs before any build.
// A `bin` pointing into `dist/` would make `pnpm install` fail on a fresh clone.

// The SWC hooks are registered before the TypeScript sources are imported, and
// the import is dynamic so that ordering holds. @swc-node is used rather than
// Node's own type stripping because stripping erases the decorator metadata
// this package's NestJS constructor injection reads, leaving every injected
// dependency `undefined` at runtime.
import { register } from "node:module";

register("@swc-node/register/esm", import.meta.url);

await import("./conformetry-nx.main.ts");
