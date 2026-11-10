<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/common/testing`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 184 |
| Files | 46 |
| Calls traced | 181 |
| Call stacks | 17 |
| Deepest stack | 7 |
| Stacks through recursion | 0 |
| Unfollowable calls | 13 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 7 |
| `maximumBreadth` | 8 |

### Call stacks (depth)

**1. `describe(…)`** — depth 7 · orphan-root

```text
🚀 describe(…)(): void [projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.unit.test.ts:15]
  └─> describe(…)(): void [projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.unit.test.ts:16]
    └─> describe(…)(): void [projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.unit.test.ts:40]
      └─> beforeEach(…)(): void [projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.unit.test.ts:43]
        └─> createTemporaryDirectory(label: string): string [projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.ts:14]
           ↳ Creates an empty directory for the running test, named `codebase-test-<label>-…`, and removes it with everything in it…
          └─> onTestFinished(…)(): void [projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.ts:17]
            └─> removeDirectory(directory: string): void [projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.ts:63]
               ↳ Removes a directory and everything in it, if it is still there.
```

**2. `describe(…)`** — depth ≥ 6 · orphan-root

```text
🚀 describe(…)(): void [projects/common/testing/src/modules/capture/capture.utilities.unit.test.ts:16]
  └─> describe(…)(): void [projects/common/testing/src/modules/capture/capture.utilities.unit.test.ts:17]
    └─> it(…)(): void [projects/common/testing/src/modules/capture/capture.utilities.unit.test.ts:18]
      └─> captureOutput(): CapturedOutput [projects/common/testing/src/modules/capture/capture.utilities.ts:26]
         ↳ Captures standard output and standard error for the running test, keeping the writes off the real streams, and restores…
        └─> mockImplementation(…)(chunk: string | Uint8Array): true [projects/common/testing/src/modules/capture/capture.utilities.ts:31]
          └─> toText(chunk: string | Uint8Array): string [projects/common/testing/src/modules/capture/capture.utilities.ts:59]
             ↳ The text a stream write carried, whether it was a string or bytes.
```

**3. `describe(…)`** — depth 6 · orphan-root

```text
🚀 describe(…)(): void [projects/common/testing/src/modules/environment/environment.utilities.unit.test.ts:10]
  └─> describe(…)(): void [projects/common/testing/src/modules/environment/environment.utilities.unit.test.ts:47]
    └─> beforeEach(…)(): void [projects/common/testing/src/modules/environment/environment.utilities.unit.test.ts:48]
      └─> overrideEnvironment(overrides: Readonly<Record<string, string | undefined>>): void [projects/common/testing/src/modules/environment/environment.utilities.ts:8]
         ↳ Sets environment variables for the running test, removing any given as `undefined`, and restores each to its value from…
        └─> onTestFinished(…)(): void [projects/common/testing/src/modules/environment/environment.utilities.ts:14]
          └─> setVariable(name: string, value: string | undefined): void [projects/common/testing/src/modules/environment/environment.utilities.ts:22]
             ↳ Sets one environment variable, or removes it for `undefined`.
```

<details>
<summary>14 more call stacks</summary>

**4. `describe(…)`** — depth 6 · orphan-root

```text
🚀 describe(…)(): void [projects/common/testing/src/modules/mocks/mocks.utilities.unit.test.ts:48]
  └─> describe(…)(): void [projects/common/testing/src/modules/mocks/mocks.utilities.unit.test.ts:77]
    └─> it(…)(): void [projects/common/testing/src/modules/mocks/mocks.utilities.unit.test.ts:78]
      └─> createTemporaryDirectory(label: string): string [projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.ts:14]
         ↳ Creates an empty directory for the running test, named `codebase-test-<label>-…`, and removes it with everything in it…
        └─> onTestFinished(…)(): void [projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.ts:17]
          └─> removeDirectory(directory: string): void [projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.ts:63]
             ↳ Removes a directory and everything in it, if it is still there.
```

**5. `describe(…)`** — depth 6 · orphan-root

```text
🚀 describe(…)(): void [projects/common/testing/src/modules/module-wiring/module-wiring.utilities.unit.test.ts:34]
  └─> describe(…)(): void [projects/common/testing/src/modules/module-wiring/module-wiring.utilities.unit.test.ts:35]
    └─> it(…)(): void [projects/common/testing/src/modules/module-wiring/module-wiring.utilities.unit.test.ts:36]
      └─> expect(…)(): void [projects/common/testing/src/modules/module-wiring/module-wiring.utilities.unit.test.ts:37]
        └─> expectModuleProvides(module: Type<unknown>, ...providers: readonly unknown[]): void [projects/common/testing/src/modules/module-wiring/module-wiring.utilities.ts:29]
           ↳ Asserts that a module's `@Module` metadata provides every provider given.
          └─> expectModuleMetadata(key: string, module: Type<unknown>, entries: readonly unknown[]): void [projects/common/testing/src/modules/module-wiring/module-wiring.utilities.ts:40]
             ↳ Asserts that one list in a module's metadata holds every entry given; a module that declares no such list holds none.
```

**6. `describe(…)`** — depth 5 · orphan-root

```text
🚀 describe(…)(): void [projects/common/testing/src/modules/fixtures/fixtures.utilities.unit.test.ts:13]
  └─> it(…)(): void [projects/common/testing/src/modules/fixtures/fixtures.utilities.unit.test.ts:14]
    └─> createTemporaryDirectory(label: string): string [projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.ts:14]
       ↳ Creates an empty directory for the running test, named `codebase-test-<label>-…`, and removes it with everything in it…
      └─> onTestFinished(…)(): void [projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.ts:17]
        └─> removeDirectory(directory: string): void [projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.ts:63]
           ↳ Removes a directory and everything in it, if it is still there.
```

**7. `describe(…)`** — depth ≥ 4 · orphan-root

```text
🚀 describe(…)(): void [projects/common/testing/src/modules/browser-stand-ins/browser-stand-ins.utilities.unit.test.ts:10]
  └─> describe(…)(): void [projects/common/testing/src/modules/browser-stand-ins/browser-stand-ins.utilities.unit.test.ts:11]
    └─> it(…)(): void [projects/common/testing/src/modules/browser-stand-ins/browser-stand-ins.utilities.unit.test.ts:12]
      └─> handler(…)({ data }: { data: { name: string; }; }): string [projects/common/testing/src/modules/browser-stand-ins/browser-stand-ins.utilities.unit.test.ts:16]
```

**8. `describe(…)`** — depth 4 · orphan-root

```text
🚀 describe(…)(): void [projects/common/testing/src/modules/clock/clock.utilities.unit.test.ts:8]
  └─> describe(…)(): void [projects/common/testing/src/modules/clock/clock.utilities.unit.test.ts:9]
    └─> mockDates(date?: Date): void [projects/common/testing/src/modules/clock/clock.utilities.ts:19]
       ↳ Sets up fake timers with a fixed system time before each test and restores real timers after each test.
      └─> beforeEach(…)(): void [projects/common/testing/src/modules/clock/clock.utilities.ts:20]
```

**9. `describe(…)`** — depth ≥ 4 · orphan-root

```text
🚀 describe(…)(): void [projects/common/testing/src/modules/testing-module/testing-module.utilities.unit.test.ts:13]
  └─> it(…)(): Promise<void> [projects/common/testing/src/modules/testing-module/testing-module.utilities.unit.test.ts:14]
    └─> buildTestingModule(…): Promise<BuiltTestingModule<Target>> [projects/common/testing/src/modules/testing-module/testing-module.utilities.ts:27]
       ↳ Compiles a testing module around the class under test, with a logger mock, a deep mock for each class in `mocks`, and…
      └─> map(…)(token: Type<unknown>): { provide: Type<unknown>; useValue: object; } [projects/common/testing/src/modules/testing-module/testing-module.utilities.ts:38]
```

**10. `describe(…)`** — depth 3 · orphan-root

```text
🚀 describe(…)(): void [projects/common/testing/src/modules/workspace-tree/workspace-tree.utilities.unit.test.ts:7]
  └─> it(…)(): void [projects/common/testing/src/modules/workspace-tree/workspace-tree.utilities.unit.test.ts:8]
    └─> createWorkspaceTree(files?: Readonly<Record<string, string>>): Tree [projects/common/testing/src/modules/workspace-tree/workspace-tree.utilities.ts:10]
       ↳ Builds an in-memory Nx workspace, with its `nx.json` and root `package.json`, holding each file given at its workspace…
```

**11. `describe(…)`** — depth 3 · orphan-root

```text
🚀 describe(…)(): void [projects/common/testing/src/modules/route-render/route-render.utilities.unit.test.tsx:50]
  └─> it(…)(): Promise<void> [projects/common/testing/src/modules/route-render/route-render.utilities.unit.test.tsx:55]
    └─> renderRoute(router: Router<AnyRoute>, path: string): Promise<RenderResult> [projects/common/testing/src/modules/route-render/route-render.utilities.tsx:18]
       ↳ Renders an application's router at a path, running that route's loader and head the way a navigation would.
```

**12. `anonymous`** — depth 2 · orphan-root

```text
🚀 anonymous(): void [projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.ts:36]
  └─> removeDirectory(directory: string): void [projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.ts:63]
     ↳ Removes a directory and everything in it, if it is still there.
```

**13. `beforeEach(…)`** — depth 2 · orphan-root

```text
🚀 beforeEach(…)(): void [projects/common/testing/src/setup.ts:20]
  └─> mockImplementation(…)(): void [projects/common/testing/src/setup.ts:22]
```

**14. `describe(…)`** — depth 2 · orphan-root

```text
🚀 describe(…)(): void [projects/common/testing/src/setup.unit.test.ts:11]
  └─> it(…)(): void [projects/common/testing/src/setup.unit.test.ts:14]
```

**15. `mock(…)`** — depth ≥ 2 · orphan-root

```text
🚀 mock(…)(…): Promise<ChildProcessMock> [projects/common/testing/src/modules/mocks/mocks.utilities.unit.test.ts:23]
  └─> mockChildProcess(actual: typeof ChildProcess): ChildProcessMock [projects/common/testing/src/modules/mocks/mocks.utilities.ts:36]
     ↳ The `node:child_process` module with each process-starting function wrapped in a spy that runs the real process until a…
```

**16. `mock(…)`** — depth ≥ 2 · orphan-root

```text
🚀 mock(…)(…): Promise<typeof import("/Users/jimmypaolini/Development/Personal/codebase/.claude/worktrees/caelundas-screenshots-errors-706f9d/projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities")> [projects/common/testing/src/modules/mocks/mocks.utilities.unit.test.ts:31]
  └─> mockPartially<Module extends object>(actual: Module, overrides: Partial<Module>): Module [projects/common/testing/src/modules/mocks/mocks.utilities.ts:62]
     ↳ A module with only the given members replaced, for a `vi.mock` factory that keeps the rest of the real module: ```ts…
```

**17. `describe(…)`** — depth 2 · orphan-root

```text
🚀 describe(…)(): void [projects/common/testing/src/react-setup.unit.test.tsx:9]
  └─> it(…)(): void [projects/common/testing/src/react-setup.unit.test.tsx:10]
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `describe(…)` | 8 | `it(…)`, `it(…)`, `it(…)`, `it(…)`, `it(…)`, `it(…)`, `describe(…)`, `it(…)` | `projects/common/testing/src/modules/environment/environment.utilities.unit.test.ts:10` |
| `describe(…)` | 7 | `it(…)`, `it(…)`, `it(…)`, `it(…)`, `it(…)`, `it(…)`, `it(…)` | `projects/common/testing/src/setup.unit.test.ts:11` |
| `describe(…)` | 4 | `describe(…)`, `describe(…)`, `describe(…)`, `describe(…)` | `projects/common/testing/src/modules/mocks/mocks.utilities.unit.test.ts:48` |

<details>
<summary>96 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `describe(…)` | 4 | `it(…)`, `it(…)`, `it(…)`, `describe(…)` | `projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.unit.test.ts:16` |
| `describe(…)` | 4 | `it(…)`, `it(…)`, `it(…)`, `it(…)` | `projects/common/testing/src/modules/testing-module/testing-module.utilities.unit.test.ts:13` |
| `captureOutput` | 3 | `mockImplementation(…)`, `mockImplementation(…)`, `onTestFinished(…)` | `projects/common/testing/src/modules/capture/capture.utilities.ts:26` |
| `beforeEach(…)` | 3 | `mockImplementation(…)`, `mockImplementation(…)`, `mockImplementation(…)` | `projects/common/testing/src/setup.ts:20` |
| `describe(…)` | 3 | `it(…)`, `it(…)`, `it(…)` | `projects/common/testing/src/modules/capture/capture.utilities.unit.test.ts:17` |
| `describe(…)` | 3 | `describe(…)`, `describe(…)`, `it(…)` | `projects/common/testing/src/modules/clock/clock.utilities.unit.test.ts:8` |
| `describe(…)` | 3 | `mockDates`, `it(…)`, `it(…)` | `projects/common/testing/src/modules/clock/clock.utilities.unit.test.ts:9` |
| `describe(…)` | 3 | `it(…)`, `it(…)`, `it(…)` | `projects/common/testing/src/modules/fixtures/fixtures.utilities.unit.test.ts:13` |
| `describe(…)` | 3 | `it(…)`, `it(…)`, `it(…)` | `projects/common/testing/src/modules/mocks/mocks.utilities.unit.test.ts:112` |
| `describe(…)` | 3 | `describe(…)`, `describe(…)`, `describe(…)` | `projects/common/testing/src/modules/module-wiring/module-wiring.utilities.unit.test.ts:34` |
| `describe(…)` | 3 | `beforeEach(…)`, `it(…)`, `it(…)` | `projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.unit.test.ts:40` |
| `describe(…)` | 3 | `describe(…)`, `it(…)`, `describe(…)` | `projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.unit.test.ts:60` |
| `describe(…)` | 3 | `useTemporaryDirectory`, `it(…)`, `it(…)` | `projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.unit.test.ts:63` |
| `describe(…)` | 3 | `it(…)`, `it(…)`, `it(…)` | `projects/common/testing/src/react-setup.unit.test.tsx:9` |
| `describe(…)` | 3 | `afterEach(…)`, `it(…)`, `it(…)` | `projects/common/testing/src/modules/route-render/route-render.utilities.unit.test.tsx:50` |
| `mockDates` | 2 | `beforeEach(…)`, `afterEach(…)` | `projects/common/testing/src/modules/clock/clock.utilities.ts:19` |
| `overrideEnvironment` | 2 | `onTestFinished(…)`, `setVariable` | `projects/common/testing/src/modules/environment/environment.utilities.ts:8` |
| `createTemporaryDirectory` | 2 | `makeDirectory`, `onTestFinished(…)` | `projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.ts:14` |
| `describe(…)` | 2 | `describe(…)`, `describe(…)` | `projects/common/testing/src/modules/browser-stand-ins/browser-stand-ins.utilities.unit.test.ts:10` |
| `describe(…)` | 2 | `it(…)`, `it(…)` | `projects/common/testing/src/modules/browser-stand-ins/browser-stand-ins.utilities.unit.test.ts:11` |
| `it(…)` | 2 | `handler(…)`, `createServerFunctionStandIn` | `projects/common/testing/src/modules/browser-stand-ins/browser-stand-ins.utilities.unit.test.ts:12` |
| `it(…)` | 2 | `handler(…)`, `createServerFunctionStandIn` | `projects/common/testing/src/modules/browser-stand-ins/browser-stand-ins.utilities.unit.test.ts:22` |
| `describe(…)` | 2 | `it(…)`, `it(…)` | `projects/common/testing/src/modules/browser-stand-ins/browser-stand-ins.utilities.unit.test.ts:29` |
| `it(…)` | 2 | `matchMediaStandIn`, `expect(…)` | `projects/common/testing/src/modules/browser-stand-ins/browser-stand-ins.utilities.unit.test.ts:39` |
| `describe(…)` | 2 | `describe(…)`, `describe(…)` | `projects/common/testing/src/modules/capture/capture.utilities.unit.test.ts:16` |
| `describe(…)` | 2 | `it(…)`, `it(…)` | `projects/common/testing/src/modules/capture/capture.utilities.unit.test.ts:43` |
| `describe(…)` | 2 | `mockDates`, `it(…)` | `projects/common/testing/src/modules/clock/clock.utilities.unit.test.ts:24` |
| `describe(…)` | 2 | `beforeEach(…)`, `it(…)` | `projects/common/testing/src/modules/environment/environment.utilities.unit.test.ts:47` |
| `it(…)` | 2 | `createTemporaryDirectory`, `loadFixture` | `projects/common/testing/src/modules/fixtures/fixtures.utilities.unit.test.ts:14` |
| `describe(…)` | 2 | `it(…)`, `it(…)` | `projects/common/testing/src/modules/mocks/mocks.utilities.unit.test.ts:49` |
| `describe(…)` | 2 | `it(…)`, `it(…)` | `projects/common/testing/src/modules/mocks/mocks.utilities.unit.test.ts:85` |
| `it(…)` | 2 | `stubFetch`, `textOf` | `projects/common/testing/src/modules/mocks/mocks.utilities.unit.test.ts:88` |
| `describe(…)` | 2 | `it(…)`, `it(…)` | `projects/common/testing/src/modules/module-wiring/module-wiring.utilities.unit.test.ts:35` |
| `describe(…)` | 2 | `it(…)`, `it(…)` | `projects/common/testing/src/modules/module-wiring/module-wiring.utilities.unit.test.ts:49` |
| `describe(…)` | 2 | `it(…)`, `it(…)` | `projects/common/testing/src/modules/module-wiring/module-wiring.utilities.unit.test.ts:63` |
| `describe(…)` | 2 | `describe(…)`, `describe(…)` | `projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.unit.test.ts:15` |
| `describe(…)` | 2 | `useTemporaryDirectory`, `it(…)` | `projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.unit.test.ts:86` |
| `it(…)` | 2 | `buildTestingModule`, `SampleGreeterService.greet` | `projects/common/testing/src/modules/testing-module/testing-module.utilities.unit.test.ts:14` |
| `it(…)` | 2 | `buildTestingModule`, `SampleGreeterService.greet` | `projects/common/testing/src/modules/testing-module/testing-module.utilities.unit.test.ts:37` |
| `describe(…)` | 2 | `it(…)`, `it(…)` | `projects/common/testing/src/modules/workspace-tree/workspace-tree.utilities.unit.test.ts:7` |
| `it(…)` | 2 | `renderRoute`, `getRouter` | `projects/common/testing/src/modules/route-render/route-render.utilities.unit.test.tsx:55` |
| `it(…)` | 2 | `renderRoute`, `getRouter` | `projects/common/testing/src/modules/route-render/route-render.utilities.unit.test.tsx:65` |
| `captureExitCode` | 1 | `onTestFinished(…)` | `projects/common/testing/src/modules/capture/capture.utilities.ts:10` |
| `mockImplementation(…)` | 1 | `toText` | `projects/common/testing/src/modules/capture/capture.utilities.ts:31` |
| `mockImplementation(…)` | 1 | `toText` | `projects/common/testing/src/modules/capture/capture.utilities.ts:37` |
| `onTestFinished(…)` | 1 | `setVariable` | `projects/common/testing/src/modules/environment/environment.utilities.ts:14` |
| `answerPrompts` | 1 | `onTestFinished(…)` | `projects/common/testing/src/modules/mocks/mocks.utilities.ts:12` |
| `stubFetch` | 1 | `onTestFinished(…)` | `projects/common/testing/src/modules/mocks/mocks.utilities.ts:74` |
| `onTestFinished(…)` | 1 | `removeDirectory` | `projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.ts:17` |
| `useTemporaryDirectory` | 1 | `beforeAll(…)` | `projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.ts:29` |
| `beforeAll(…)` | 1 | `makeDirectory` | `projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.ts:32` |
| `anonymous` | 1 | `removeDirectory` | `projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.ts:36` |
| `expectModuleExports` | 1 | `expectModuleMetadata` | `projects/common/testing/src/modules/module-wiring/module-wiring.utilities.ts:9` |
| `expectModuleImports` | 1 | `expectModuleMetadata` | `projects/common/testing/src/modules/module-wiring/module-wiring.utilities.ts:19` |
| `expectModuleProvides` | 1 | `expectModuleMetadata` | `projects/common/testing/src/modules/module-wiring/module-wiring.utilities.ts:29` |
| `buildTestingModule` | 1 | `map(…)` | `projects/common/testing/src/modules/testing-module/testing-module.utilities.ts:27` |
| `it(…)` | 1 | `matchMediaStandIn` | `projects/common/testing/src/modules/browser-stand-ins/browser-stand-ins.utilities.unit.test.ts:30` |
| `flushed` | 1 | `anonymous` | `projects/common/testing/src/modules/capture/capture.utilities.unit.test.ts:8` |
| `anonymous` | 1 | `write(…)` | `projects/common/testing/src/modules/capture/capture.utilities.unit.test.ts:9` |
| `it(…)` | 1 | `captureOutput` | `projects/common/testing/src/modules/capture/capture.utilities.unit.test.ts:18` |
| `it(…)` | 1 | `captureOutput` | `projects/common/testing/src/modules/capture/capture.utilities.unit.test.ts:29` |
| `it(…)` | 1 | `flushed` | `projects/common/testing/src/modules/capture/capture.utilities.unit.test.ts:37` |
| `it(…)` | 1 | `captureExitCode` | `projects/common/testing/src/modules/capture/capture.utilities.unit.test.ts:46` |
| `it(…)` | 1 | `overrideEnvironment` | `projects/common/testing/src/modules/environment/environment.utilities.unit.test.ts:14` |
| `it(…)` | 1 | `overrideEnvironment` | `projects/common/testing/src/modules/environment/environment.utilities.unit.test.ts:26` |
| `it(…)` | 1 | `overrideEnvironment` | `projects/common/testing/src/modules/environment/environment.utilities.unit.test.ts:36` |
| `beforeEach(…)` | 1 | `overrideEnvironment` | `projects/common/testing/src/modules/environment/environment.utilities.unit.test.ts:48` |
| `it(…)` | 1 | `loadFixture` | `projects/common/testing/src/modules/fixtures/fixtures.utilities.unit.test.ts:24` |
| `it(…)` | 1 | `expect(…)` | `projects/common/testing/src/modules/fixtures/fixtures.utilities.unit.test.ts:30` |
| `expect(…)` | 1 | `loadFixture` | `projects/common/testing/src/modules/fixtures/fixtures.utilities.unit.test.ts:31` |
| `mock(…)` | 1 | `mockChildProcess` | `projects/common/testing/src/modules/mocks/mocks.utilities.unit.test.ts:23` |
| `mock(…)` | 1 | `mockPartially` | `projects/common/testing/src/modules/mocks/mocks.utilities.unit.test.ts:31` |
| `describe(…)` | 1 | `it(…)` | `projects/common/testing/src/modules/mocks/mocks.utilities.unit.test.ts:77` |
| `it(…)` | 1 | `createTemporaryDirectory` | `projects/common/testing/src/modules/mocks/mocks.utilities.unit.test.ts:78` |
| `it(…)` | 1 | `answerPrompts` | `projects/common/testing/src/modules/mocks/mocks.utilities.unit.test.ts:113` |
| `it(…)` | 1 | `answerPrompts` | `projects/common/testing/src/modules/mocks/mocks.utilities.unit.test.ts:124` |
| `it(…)` | 1 | `expect(…)` | `projects/common/testing/src/modules/module-wiring/module-wiring.utilities.unit.test.ts:36` |
| `expect(…)` | 1 | `expectModuleProvides` | `projects/common/testing/src/modules/module-wiring/module-wiring.utilities.unit.test.ts:37` |
| `it(…)` | 1 | `expect(…)` | `projects/common/testing/src/modules/module-wiring/module-wiring.utilities.unit.test.ts:42` |
| `expect(…)` | 1 | `expectModuleProvides` | `projects/common/testing/src/modules/module-wiring/module-wiring.utilities.unit.test.ts:43` |
| `it(…)` | 1 | `expect(…)` | `projects/common/testing/src/modules/module-wiring/module-wiring.utilities.unit.test.ts:50` |
| `expect(…)` | 1 | `expectModuleExports` | `projects/common/testing/src/modules/module-wiring/module-wiring.utilities.unit.test.ts:51` |
| `it(…)` | 1 | `expect(…)` | `projects/common/testing/src/modules/module-wiring/module-wiring.utilities.unit.test.ts:56` |
| `expect(…)` | 1 | `expectModuleExports` | `projects/common/testing/src/modules/module-wiring/module-wiring.utilities.unit.test.ts:57` |
| `it(…)` | 1 | `expect(…)` | `projects/common/testing/src/modules/module-wiring/module-wiring.utilities.unit.test.ts:64` |
| `expect(…)` | 1 | `expectModuleImports` | `projects/common/testing/src/modules/module-wiring/module-wiring.utilities.unit.test.ts:65` |
| `it(…)` | 1 | `expect(…)` | `projects/common/testing/src/modules/module-wiring/module-wiring.utilities.unit.test.ts:70` |
| `expect(…)` | 1 | `expectModuleImports` | `projects/common/testing/src/modules/module-wiring/module-wiring.utilities.unit.test.ts:71` |
| `it(…)` | 1 | `createTemporaryDirectory` | `projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.unit.test.ts:19` |
| `it(…)` | 1 | `createTemporaryDirectory` | `projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.unit.test.ts:34` |
| `beforeEach(…)` | 1 | `createTemporaryDirectory` | `projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.unit.test.ts:43` |
| `SampleGreeterService.greet` | 1 | `SampleClockService.now` | `projects/common/testing/testing/fixtures/sample-greeter.service.ts:18` |
| `it(…)` | 1 | `buildTestingModule` | `projects/common/testing/src/modules/testing-module/testing-module.utilities.unit.test.ts:24` |
| `it(…)` | 1 | `buildTestingModule` | `projects/common/testing/src/modules/testing-module/testing-module.utilities.unit.test.ts:49` |
| `it(…)` | 1 | `createWorkspaceTree` | `projects/common/testing/src/modules/workspace-tree/workspace-tree.utilities.unit.test.ts:8` |
| `it(…)` | 1 | `createWorkspaceTree` | `projects/common/testing/src/modules/workspace-tree/workspace-tree.utilities.unit.test.ts:15` |

</details>
<!-- callidescope:end -->
