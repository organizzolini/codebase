# End-to-End Tests

Two targets, two meanings:

| Target              | Files                  | Runs                                                                         |
| ------------------- | ---------------------- | ---------------------------------------------------------------------------- |
| `vitest:end-to-end` | `*.end-to-end.test.ts` | The whole command line or server, from source                                |
| `end-to-end`        | `*.packed.test.ts`     | The packed tarball, installed into an isolated sandbox like a consumer would |

## From Source

`runSourceCommand({ entry, args, directory, environment, timeout })` from `@codebase/testing/end-to-end` runs a TypeScript entry the way the command line runs it and resolves `{ exitCode, stdout, stderr }`; a failing run is a result, never a throw. Run it from a directory inside the workspace, because `@swc-node/register` resolves from the working directory: give `createFileTree` a `parent` inside the workspace for a spawned root.

## Packed

A project opts in by declaring an empty `end-to-end` target. Run its `pack` target first, so `dist/tarballs` holds the tarballs.

- **Command lines**: `createTarballSandboxRunner({ packages, workspaceRoot })` installs the tarballs into a sandbox and runs the real executable there.
- **Nx plugins**: `startVerdaccioPluginRunner({ localScopes })` publishes them to a throwaway Verdaccio registry and creates a consumer workspace. Name every scope you publish in `localScopes`: the registry proxies npmjs and refuses a version npmjs already holds.

CI runs packed tests in the `End to End IC Suite` leg. To rehearse a publish by hand rather than in a test, follow [publish-release](../../publish-release/SKILL.md).
