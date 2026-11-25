# Moving an Older Suite onto the Shared Helpers

Most suites already use `buildTestingModule` and the `@codebase/testing` helpers, and the conformetry test templates hold every generated test to their shape. A suite that predates them is moved in its own commit, one project at a time.

| Older pattern                                                                         | Replace with                                                                                          |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `Test.createTestingModule({ providers: [...] })` with a hand-listed mock per provider | `buildTestingModule(Target, { mocks: [...] })`; keep `providers` only for tokens such as repositories |
| A hand-written logger mock                                                            | Nothing: `buildTestingModule` provides one; assert it with `expectLoggerContext`                      |
| An `"is defined"` test                                                                | Nothing: resolving the class is the wiring check                                                      |
| Reading `@Module` metadata by hand                                                    | `expectModuleImports`, `expectModuleProvides`, `expectModuleExports`                                  |
| `vi.mock("node:fs")` with stubbed `readdirSync` results                               | A real directory from `createTemporaryDirectory` or `createFileTree`                                  |
| A `child_process` module written out in a factory                                     | `mockChildProcess(await importOriginal())`                                                            |
| A route test that mocks `__root`                                                      | `renderRoute(getRouter(), path)`                                                                      |

`Test.createTestingModule` still has a place where a test needs real providers wired together — an integration test over several real services — and `bootModule` covers a root module.

After moving a suite, run `nx run <project>:conformetry-validate` and the coverage gate in [validate-code](../../validate-code/SKILL.md#quality-gates): both must pass without lowering anything.
