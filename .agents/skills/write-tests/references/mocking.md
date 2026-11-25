# Mocking

Mock what the test cannot run for real, through the shared helper for it. The [testing README](../../../../projects/common/testing/README.md#core) documents each one.

## Module Mocks

`vi.mock` is hoisted above the imports, so its factory must load what it needs itself. Load a shared helper with `vi.importActual` and a type-only import — never a dynamic `import()`, which makes `@nx/enforce-module-boundaries` reject every static import of the package in that project.

```ts
import type * as Testing from "@codebase/testing";

vi.mock("node:child_process", async (importOriginal) => {
  const { mockChildProcess } =
    await vi.importActual<typeof Testing>("@codebase/testing");

  return mockChildProcess(await importOriginal());
});
```

| Module                        | Factory                                                                                                                      |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `node:child_process`          | `mockChildProcess(actual)` runs the real process until a test stages a result; `mockExecFile(actual, decide)` starts nothing |
| `node:fs`, `node:fs/promises` | `mockFileSystem()` (bare stubs) or `mockFileSystem(actual)` (real until staged), from `@codebase/testing/file-system`        |
| Any other module              | `mockPartially(actual, overrides)`, keeping every export you do not override real                                            |
| `fetch`                       | `stubFetch(...)` queues responses; no `vi.mock` needed                                                                       |
| `prompts`                     | Already mocked by the shared setup; queue answers with `answerPrompts`                                                       |

A value the mock must hold before imports run comes from `vi.hoisted`:

```ts
import type * as Ephemeris from "./ephemeris.utilities";

const { fetchEphemeris } = vi.hoisted(() => ({
  fetchEphemeris: vi.fn<typeof Ephemeris.fetchEphemeris>(),
}));

vi.mock("./ephemeris.utilities", async (importOriginal) => {
  const { mockPartially } =
    await vi.importActual<typeof Testing>("@codebase/testing");

  return mockPartially(await importOriginal<typeof Ephemeris>(), {
    fetchEphemeris,
  });
});
```

## The File System

Prefer a real directory: `createTemporaryDirectory` for one test, `useTemporaryDirectory` for a suite, `createFileTree` to lay out several files at once. Each is removed when its test or suite ends. Mock `node:fs` only for a case a real directory cannot produce, such as a permission error.

## Asserting Call Arguments

Read a mock's calls through a type guard rather than layered `as` casts, so a changed argument shape fails the test instead of the type checker silently trusting it:

```ts
const isValidateArgument = (
  value: unknown,
): value is { instanceFilePath: string } =>
  typeof value === "object" && value !== null && "instanceFilePath" in value;

const [firstArgument] = vi.mocked(validateInstanceFile).mock.calls[0] ?? [];

expect(isValidateArgument(firstArgument)).toBe(true);

if (isValidateArgument(firstArgument)) {
  expect(firstArgument.instanceFilePath).toContain("project");
}
```

## Stand-ins

`createMock<T>()` from `@golevelup/ts-vitest` builds a typed deep mock of any class or interface, every method a `vi.fn()`. Use it for a value `buildTestingModule` does not provide. Never write a stub object by hand: it drifts from the type it stands in for.
