---
name: write-tests
description: "Write tests the way this codebase does: test kinds and names, the Nx commands, the @codebase/testing helpers, and the mocking standard. Use when adding or changing a test, mocking a dependency, testing a component, route, or packed package, or migrating an older suite."
license: MIT
---

# Write Tests

What a test looks like here. The **process** — red, green, refactor — is the [test-driven-development skill](../test-driven-development/SKILL.md); read its `npm test` as `nx run <project>:vitest:<kind>`. The **gates** a change must clear — coverage, type coverage, compiled size — are in [validate-code](../validate-code/SKILL.md#quality-gates).

## Test Kinds

| Kind        | File name                  | Tests                                                                                           |
| ----------- | -------------------------- | ----------------------------------------------------------------------------------------------- |
| Unit        | `*.unit.test.ts(x)`        | One class, function, component, or hook, with its collaborators mocked                          |
| Integration | `*.integration.test.ts(x)` | Real I/O: a temporary directory, a Postgres container, a route rendered through the real router |
| End-to-end  | `*.end-to-end.test.ts`     | A whole command line or server, run from source                                                 |
| Packed      | `*.packed.test.ts`         | The published tarball, installed the way a consumer installs it                                 |

Put the test beside the file it tests. A conformetry generator scaffolds the first test in the right shape, so start new code with [conformetry-generate](../conformetry-generate/SKILL.md).

## Run Tests

```bash
nx run <project>:vitest:unit
nx run <project>:vitest:integration
nx run <project>:vitest:end-to-end
nx run <project>:end-to-end                   # packed tests
nx affected --target=vitest --base=main
```

There is no `test` target. `vitest:end-to-end` runs end-to-end tests against source; the separate `end-to-end` target runs packed tests, as [end-to-end.md](references/end-to-end.md) describes.

## Reach for a Helper First

`@codebase/testing` holds the shared plumbing, and any project may depend on it. Its [README](../../../projects/common/testing/README.md) is the reference for every helper, with an example per subpath and a **Recipes by test kind** table; read that rather than writing setup by hand.

| Job                                                | Helper                                                                                                                      |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Build a Nest class with its dependencies mocked    | `buildTestingModule` (`/nestjs`) — see [nestjs.md](references/nestjs.md)                                                    |
| Assert a module's wiring                           | `expectModuleProvides`, `expectModuleExports`, `expectModuleImports`, `bootModule`                                          |
| Assert a logger context                            | `expectLoggerContext` (`@codebase/observability/testing`)                                                                   |
| Real files                                         | `createTemporaryDirectory`, `useTemporaryDirectory`, `createFileTree`, `useWorkingDirectory`                                |
| Output, exit codes, environment, clock, fixtures   | `captureOutput`, `captureExitCode`, `mockProcessExit`, `overrideEnvironment`, `mockDates`, `loadFixture`                    |
| Child processes, `fetch`, prompts, partial modules | `mockChildProcess`, `mockExecFile`, `stubFetch`, `answerPrompts`, `mockPartially` — see [mocking.md](references/mocking.md) |
| Routes and browser APIs                            | `renderRoute`, `createServerFunctionStandIn`, `matchMediaStandIn` (`/react`) — see [react.md](references/react.md)          |
| Packed packages                                    | `createTarballSandboxRunner`, `startVerdaccioPluginRunner` (`/end-to-end`)                                                  |
| GraphQL and Postgres                               | `@codebase/interface/testing`, `@codebase/persistence/testing`                                                              |

List each package a test imports as a development dependency. Domain fixture builders stay in the suite's own `testing/` folder; only generic helpers belong in the shared package.

## The Mocking Standard

- **Real over mocked.** Write to a directory from `createTemporaryDirectory` and assert what is on disk; render through the real router; boot the real module when wiring is the question. Mock the file system only for a case a real directory cannot produce, such as a permission error, and then through `mockFileSystem`.
- **Mock collaborators, not the subject.** `buildTestingModule`'s `mocks` gives every named class a typed deep mock. Never hand-write a stub object.
- **One factory per module.** `vi.mock` is hoisted and cannot be wrapped, so its factory returns a shared helper's result — `mockChildProcess(await importOriginal())`, `mockPartially(...)` — rather than a module written out per file.
- **Assert behavior.** Check what the code returned, wrote, printed, or called with, not that a mock exists. A dependency nothing provides already fails `buildTestingModule`, so do not add an "is defined" test.

## Writing the Test

- `describe` the class or function itself (`describe(UserCard, …)`), and name each `it` for the behavior it proves.
- Start async tests with `expect.hasAssertions()`.
- Prefer `toStrictEqual` for values, and type-guard a mock's call arguments rather than casting them ([mocking.md](references/mocking.md#asserting-call-arguments)).
- Keep fixtures minimal and specific to the assertion.
- Fix clocks and random sources for time- or math-heavy logic so a branch test stays stable.

## References

- [nestjs.md](references/nestjs.md) — `buildTestingModule`, repositories, module wiring
- [mocking.md](references/mocking.md) — `vi.mock` factories, the file system, child processes, call arguments
- [react.md](references/react.md) — components, hooks, and routes
- [end-to-end.md](references/end-to-end.md) — source and packed end-to-end tests
- [legacy-tests.md](references/legacy-tests.md) — moving an older suite onto the shared helpers
