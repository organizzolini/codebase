<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/common/testing`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 394 |
| Files | 86 |
| Calls traced | 438 |
| Call stacks | 46 |
| Deepest stack | 7 |
| Stacks through recursion | 0 |
| Unfollowable calls | 81 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 7 |
| `maximumBreadth` | 8 |

### Call stacks (depth)

**1. `usePackedRegistry`** — depth ≥ 7 · orphan-root

```text
🚀 usePackedRegistry(options: PackedRegistryOptions): PackedRegistry [projects/common/testing/src/modules/nx-plugin-sandbox/modules/packed-sandbox/packed-sandbox.utilities.ts:34]
   ↳ Starts a registry and publishes packed tarballs to it before the suite, then stops it after. Call inside `describe`.
  └─> beforeAll(…)(): Promise<void> [projects/common/testing/src/modules/nx-plugin-sandbox/modules/packed-sandbox/packed-sandbox.utilities.ts:39]
    └─> startVerdaccioPluginRunner(options?: VerdaccioPluginRunnerOptions): Promise<VerdaccioPluginRunner> [projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.utilities.ts:31]
       ↳ Starts an ephemeral Verdaccio registry on a free local port.
      └─> connect(…): Promise<{ readonly port: number; readonly registryUrl: string; }> [projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.utilities.ts:93]
         ↳ Listens, signs up a user, and writes that user's `.npmrc`.
        └─> listen(server: Server): Promise<void> [projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.utilities.ts:162]
           ↳ Listens on a free local port chosen by the operating system.
          └─> anonymous(…): void [projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.utilities.ts:163]
            └─> listen(…)(): void [projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.utilities.ts:165]
```

**2. `describe(…)`** — depth 7 · orphan-root

```text
🚀 describe(…)(): void [projects/common/testing/src/modules/command/modules/example-run/example-run.utilities.unit.test.ts:17]
  └─> describe(…)(): void [projects/common/testing/src/modules/command/modules/example-run/example-run.utilities.unit.test.ts:18]
    └─> it(…)(): void [projects/common/testing/src/modules/command/modules/example-run/example-run.utilities.unit.test.ts:19]
      └─> createFileTree(files: Readonly<Record<string, string>>, options?: FileTreeOptions): string [projects/common/testing/src/modules/file-tree/file-tree.utilities.ts:9]
         ↳ Creates a temporary directory holding `files`, keyed by relative path, and returns its root, removed once the test…
        └─> createTemporaryDirectory(label: string, parent?: string): string [projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.ts:13]
           ↳ Creates an empty directory for the running test, removed once it finishes. `parent` holds it instead of the system…
          └─> onTestFinished(…)(): void [projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.ts:19]
            └─> removeDirectory(directory: string): void [projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.ts:71]
               ↳ Removes a directory and everything in it, if it is still there.
```

**3. `describe(…)`** — depth 7 · orphan-root

```text
🚀 describe(…)(): void [projects/common/testing/src/modules/file-tree/file-tree.utilities.unit.test.ts:10]
  └─> describe(…)(): void [projects/common/testing/src/modules/file-tree/file-tree.utilities.unit.test.ts:11]
    └─> it(…)(): void [projects/common/testing/src/modules/file-tree/file-tree.utilities.unit.test.ts:12]
      └─> createFileTree(files: Readonly<Record<string, string>>, options?: FileTreeOptions): string [projects/common/testing/src/modules/file-tree/file-tree.utilities.ts:9]
         ↳ Creates a temporary directory holding `files`, keyed by relative path, and returns its root, removed once the test…
        └─> createTemporaryDirectory(label: string, parent?: string): string [projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.ts:13]
           ↳ Creates an empty directory for the running test, removed once it finishes. `parent` holds it instead of the system…
          └─> onTestFinished(…)(): void [projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.ts:19]
            └─> removeDirectory(directory: string): void [projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.ts:71]
               ↳ Removes a directory and everything in it, if it is still there.
```

<details>
<summary>43 more call stacks</summary>

**4. `describe(…)`** — depth ≥ 7 · orphan-root

```text
🚀 describe(…)(): void [projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.utilities.unit.test.ts:15]
  └─> beforeAll(…)(): Promise<void> [projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.utilities.unit.test.ts:19]
    └─> startVerdaccioPluginRunner(options?: VerdaccioPluginRunnerOptions): Promise<VerdaccioPluginRunner> [projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.utilities.ts:31]
       ↳ Starts an ephemeral Verdaccio registry on a free local port.
      └─> connect(…): Promise<{ readonly port: number; readonly registryUrl: string; }> [projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.utilities.ts:93]
         ↳ Listens, signs up a user, and writes that user's `.npmrc`.
        └─> listen(server: Server): Promise<void> [projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.utilities.ts:162]
           ↳ Listens on a free local port chosen by the operating system.
          └─> anonymous(…): void [projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.utilities.ts:163]
            └─> listen(…)(): void [projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.utilities.ts:165]
```

**5. `describe(…)`** — depth ≥ 7 · orphan-root

```text
🚀 describe(…)(): void [projects/common/testing/src/modules/nx-plugin-sandbox/modules/tarball-sandbox/tarball-sandbox.utilities.unit.test.ts:18]
  └─> describe(…)(): void [projects/common/testing/src/modules/nx-plugin-sandbox/modules/tarball-sandbox/tarball-sandbox.utilities.unit.test.ts:19]
    └─> it(…)(): void [projects/common/testing/src/modules/nx-plugin-sandbox/modules/tarball-sandbox/tarball-sandbox.utilities.unit.test.ts:38]
      └─> expect(…)(): string[] [projects/common/testing/src/modules/nx-plugin-sandbox/modules/tarball-sandbox/tarball-sandbox.utilities.unit.test.ts:39]
        └─> findTarballs(directory: string, packages: readonly string[]): string[] [projects/common/testing/src/modules/nx-plugin-sandbox/modules/tarball-sandbox/tarball-sandbox.utilities.ts:82]
           ↳ Finds each package's newest `<flat-name>-<version>.tgz` in a directory (`@scope/name` flattens to `scope-name`), in the…
          └─> map(…)(name: string): string [projects/common/testing/src/modules/nx-plugin-sandbox/modules/tarball-sandbox/tarball-sandbox.utilities.ts:88]
            └─> toSorted(…)(a: string, b: string): number [projects/common/testing/src/modules/nx-plugin-sandbox/modules/tarball-sandbox/tarball-sandbox.utilities.ts:95]
```

**6. `describe(…)`** — depth 7 · orphan-root

```text
🚀 describe(…)(): void [projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.unit.test.ts:15]
  └─> describe(…)(): void [projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.unit.test.ts:16]
    └─> describe(…)(): void [projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.unit.test.ts:40]
      └─> beforeEach(…)(): void [projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.unit.test.ts:43]
        └─> createTemporaryDirectory(label: string, parent?: string): string [projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.ts:13]
           ↳ Creates an empty directory for the running test, removed once it finishes. `parent` holds it instead of the system…
          └─> onTestFinished(…)(): void [projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.ts:19]
            └─> removeDirectory(directory: string): void [projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.ts:71]
               ↳ Removes a directory and everything in it, if it is still there.
```

**7. `usePackedSandbox`** — depth ≥ 6 · orphan-root

```text
🚀 usePackedSandbox(options: PackedSandboxOptions): PackedSandbox [projects/common/testing/src/modules/nx-plugin-sandbox/modules/packed-sandbox/packed-sandbox.utilities.ts:70]
   ↳ Installs packed tarballs before the suite and removes them after it.
  └─> beforeAll(…)(): Promise<void> [projects/common/testing/src/modules/nx-plugin-sandbox/modules/packed-sandbox/packed-sandbox.utilities.ts:80]
    └─> createTarballSandboxRunner(options: TarballSandboxOptions): Promise<TarballSandboxRunner> [projects/common/testing/src/modules/nx-plugin-sandbox/modules/tarball-sandbox/tarball-sandbox.utilities.ts:22]
       ↳ Installs packed tarballs from files into a fresh temporary project, so a test runs them exactly as a consumer would.
      └─> findTarballs(directory: string, packages: readonly string[]): string[] [projects/common/testing/src/modules/nx-plugin-sandbox/modules/tarball-sandbox/tarball-sandbox.utilities.ts:82]
         ↳ Finds each package's newest `<flat-name>-<version>.tgz` in a directory (`@scope/name` flattens to `scope-name`), in the…
        └─> map(…)(name: string): string [projects/common/testing/src/modules/nx-plugin-sandbox/modules/tarball-sandbox/tarball-sandbox.utilities.ts:88]
          └─> toSorted(…)(a: string, b: string): number [projects/common/testing/src/modules/nx-plugin-sandbox/modules/tarball-sandbox/tarball-sandbox.utilities.ts:95]
```

**8. `describe(…)`** — depth ≥ 6 · orphan-root

```text
🚀 describe(…)(): void [projects/common/testing/src/modules/capture/capture.utilities.unit.test.ts:16]
  └─> describe(…)(): void [projects/common/testing/src/modules/capture/capture.utilities.unit.test.ts:17]
    └─> it(…)(): void [projects/common/testing/src/modules/capture/capture.utilities.unit.test.ts:18]
      └─> captureOutput(): CapturedOutput [projects/common/testing/src/modules/capture/capture.utilities.ts:24]
         ↳ Captures stdout and stderr for the running test, keeping writes off the real streams and restoring both afterwards.
        └─> mockImplementation(…)(chunk: string | Uint8Array): true [projects/common/testing/src/modules/capture/capture.utilities.ts:29]
          └─> toText(chunk: string | Uint8Array): string [projects/common/testing/src/modules/capture/capture.utilities.ts:57]
             ↳ The text a stream write carried, whether it was a string or bytes.
```

**9. `describe(…)`** — depth 6 · orphan-root

```text
🚀 describe(…)(): void [projects/common/testing/src/modules/environment/environment.utilities.unit.test.ts:10]
  └─> describe(…)(): void [projects/common/testing/src/modules/environment/environment.utilities.unit.test.ts:47]
    └─> beforeEach(…)(): void [projects/common/testing/src/modules/environment/environment.utilities.unit.test.ts:48]
      └─> overrideEnvironment(overrides: Readonly<Record<string, string | undefined>>): void [projects/common/testing/src/modules/environment/environment.utilities.ts:7]
         ↳ Sets environment variables for the running test, removing any given as `undefined`, and restores each to its prior…
        └─> onTestFinished(…)(): void [projects/common/testing/src/modules/environment/environment.utilities.ts:13]
          └─> setVariable(name: string, value: string | undefined): void [projects/common/testing/src/modules/environment/environment.utilities.ts:21]
             ↳ Sets one environment variable, or removes it for `undefined`.
```

**10. `describe(…)`** — depth ≥ 6 · orphan-root

```text
🚀 describe(…)(): void [projects/common/testing/src/modules/mocks/mocks.utilities.unit.test.ts:51]
  └─> describe(…)(): void [projects/common/testing/src/modules/mocks/mocks.utilities.unit.test.ts:123]
    └─> it(…)(): void [projects/common/testing/src/modules/mocks/mocks.utilities.unit.test.ts:124]
      └─> createTemporaryDirectory(label: string, parent?: string): string [projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.ts:13]
         ↳ Creates an empty directory for the running test, removed once it finishes. `parent` holds it instead of the system…
        └─> onTestFinished(…)(): void [projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.ts:19]
          └─> removeDirectory(directory: string): void [projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.ts:71]
             ↳ Removes a directory and everything in it, if it is still there.
```

**11. `describe(…)`** — depth 6 · orphan-root

```text
🚀 describe(…)(): void [projects/common/testing/src/modules/testing-module/modules/module-wiring/module-wiring.utilities.unit.test.ts:34]
  └─> describe(…)(): void [projects/common/testing/src/modules/testing-module/modules/module-wiring/module-wiring.utilities.unit.test.ts:35]
    └─> it(…)(): void [projects/common/testing/src/modules/testing-module/modules/module-wiring/module-wiring.utilities.unit.test.ts:36]
      └─> expect(…)(): void [projects/common/testing/src/modules/testing-module/modules/module-wiring/module-wiring.utilities.unit.test.ts:37]
        └─> expectModuleProvides(module: Type<unknown>, ...providers: readonly unknown[]): void [projects/common/testing/src/modules/testing-module/modules/module-wiring/module-wiring.utilities.ts:29]
           ↳ Asserts that a module's `@Module` metadata provides every provider given.
          └─> expectModuleMetadata(key: string, module: Type<unknown>, entries: readonly unknown[]): void [projects/common/testing/src/modules/testing-module/modules/module-wiring/module-wiring.utilities.ts:40]
             ↳ Asserts that one list in a module's metadata holds every entry given; a module that declares no such list holds none.
```

**12. `describe(…)`** — depth ≥ 5 · orphan-root

```text
🚀 describe(…)(): void [projects/common/testing/src/modules/command/command.utilities.unit.test.ts:8]
  └─> describe(…)(): void [projects/common/testing/src/modules/command/command.utilities.unit.test.ts:9]
    └─> it(…)(): void [projects/common/testing/src/modules/command/command.utilities.unit.test.ts:10]
      └─> sanitizeEnvironment(…): Record<string, string> [projects/common/testing/src/modules/command/command.utilities.ts:64]
         ↳ Builds a child-process environment from the inherited keys alone, so `NX_*`, `npm_config_*` and tokens never leak in;…
        └─> flatMap(…)(this: undefined, key: string): (readonly [string, string])[] [projects/common/testing/src/modules/command/command.utilities.ts:68]
```

**13. `describe(…)`** — depth 5 · orphan-root

```text
🚀 describe(…)(): void [projects/common/testing/src/modules/file-tree/modules/fixtures/fixtures.utilities.unit.test.ts:13]
  └─> it(…)(): void [projects/common/testing/src/modules/file-tree/modules/fixtures/fixtures.utilities.unit.test.ts:14]
    └─> createTemporaryDirectory(label: string, parent?: string): string [projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.ts:13]
       ↳ Creates an empty directory for the running test, removed once it finishes. `parent` holds it instead of the system…
      └─> onTestFinished(…)(): void [projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.ts:19]
        └─> removeDirectory(directory: string): void [projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.ts:71]
           ↳ Removes a directory and everything in it, if it is still there.
```

**14. `describe(…)`** — depth 5 · orphan-root

```text
🚀 describe(…)(): void [projects/common/testing/src/modules/temporary-directory/modules/working-directory/working-directory.utilities.unit.test.ts:9]
  └─> describe(…)(): void [projects/common/testing/src/modules/temporary-directory/modules/working-directory/working-directory.utilities.unit.test.ts:31]
    └─> beforeEach(…)(): void [projects/common/testing/src/modules/temporary-directory/modules/working-directory/working-directory.utilities.unit.test.ts:32]
      └─> useWorkingDirectory(directory: string): void [projects/common/testing/src/modules/temporary-directory/modules/working-directory/working-directory.utilities.ts:7]
         ↳ Makes `process.cwd()` return `directory` for the running test, real or not, and restores it afterwards.
        └─> onTestFinished(…)(): void [projects/common/testing/src/modules/temporary-directory/modules/working-directory/working-directory.utilities.ts:10]
```

**15. `publish`** — depth ≥ 4 · orphan-root

```text
🚀 publish(…): Promise<void> [projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.utilities.ts:62]
  └─> findTarballs(directory: string, packages: readonly string[]): string[] [projects/common/testing/src/modules/nx-plugin-sandbox/modules/tarball-sandbox/tarball-sandbox.utilities.ts:82]
     ↳ Finds each package's newest `<flat-name>-<version>.tgz` in a directory (`@scope/name` flattens to `scope-name`), in the…
    └─> map(…)(name: string): string [projects/common/testing/src/modules/nx-plugin-sandbox/modules/tarball-sandbox/tarball-sandbox.utilities.ts:88]
      └─> toSorted(…)(a: string, b: string): number [projects/common/testing/src/modules/nx-plugin-sandbox/modules/tarball-sandbox/tarball-sandbox.utilities.ts:95]
```

**16. `describe(…)`** — depth 4 · orphan-root

```text
🚀 describe(…)(): void [projects/common/testing/src/entries.unit.test.ts:44]
  └─> it(…)(): void [projects/common/testing/src/entries.unit.test.ts:45]
    └─> reachablePackages(entry: string): string[] [projects/common/testing/src/entries.unit.test.ts:11]
       ↳ Walks relative imports and re-exports from an entry, collecting bare specifiers.
      └─> filter(…)(candidate: string): boolean [projects/common/testing/src/entries.unit.test.ts:31]
```

**17. `describe(…)`** — depth ≥ 4 · orphan-root

```text
🚀 describe(…)(): void [projects/common/testing/src/modules/browser-stand-ins/browser-stand-ins.utilities.unit.test.ts:10]
  └─> describe(…)(): void [projects/common/testing/src/modules/browser-stand-ins/browser-stand-ins.utilities.unit.test.ts:11]
    └─> it(…)(): void [projects/common/testing/src/modules/browser-stand-ins/browser-stand-ins.utilities.unit.test.ts:12]
      └─> handler(…)({ data }: { data: { name: string; }; }): string [projects/common/testing/src/modules/browser-stand-ins/browser-stand-ins.utilities.unit.test.ts:16]
```

**18. `describe(…)`** — depth 4 · orphan-root

```text
🚀 describe(…)(): void [projects/common/testing/src/modules/clock/clock.utilities.unit.test.ts:8]
  └─> describe(…)(): void [projects/common/testing/src/modules/clock/clock.utilities.unit.test.ts:9]
    └─> mockDates(date?: Date): void [projects/common/testing/src/modules/clock/clock.utilities.ts:9]
       ↳ Fakes timers at a fixed system time around each test, restoring real timers after. Call it inside a `describe`.
      └─> beforeEach(…)(): void [projects/common/testing/src/modules/clock/clock.utilities.ts:10]
```

**19. `describe(…)`** — depth ≥ 4 · orphan-root

```text
🚀 describe(…)(): void [projects/common/testing/src/modules/command/modules/source-command/source-command.utilities.unit.test.ts:14]
  └─> it(…)(): Promise<void> [projects/common/testing/src/modules/command/modules/source-command/source-command.utilities.unit.test.ts:15]
    └─> runSourceCommand(options: SourceCommandOptions): Promise<SourceCommandResult> [projects/common/testing/src/modules/command/modules/source-command/source-command.utilities.ts:9]
       ↳ Runs a TypeScript entry through swc in a child process, with color off and a sanitized environment; it never throws.
      └─> createCommand(…): Command [projects/common/testing/src/modules/command/command.utilities.ts:14]
         ↳ Describes one child process: chain `inDirectory`, `withEnvironment` and `withTimeout`, then `run` it.
```

**20. `describe(…)`** — depth ≥ 4 · orphan-root

```text
🚀 describe(…)(): void [projects/common/testing/src/modules/testing-module/testing-module.utilities.unit.test.ts:17]
  └─> it(…)(): Promise<void> [projects/common/testing/src/modules/testing-module/testing-module.utilities.unit.test.ts:18]
    └─> buildTestingModule(…): Promise<BuiltTestingModule<Target>> [projects/common/testing/src/modules/testing-module/testing-module.utilities.ts:18]
       ↳ Compiles a testing module around the class, with a logger mock and a deep mock per `mocks` class; resolving fails on…
      └─> map(…)(token: Type<unknown>): { provide: Type<unknown>; useValue: object; } [projects/common/testing/src/modules/testing-module/testing-module.utilities.ts:29]
```

**21. `describe(…)`** — depth 4 · orphan-root

```text
🚀 describe(…)(): void [projects/common/testing/src/modules/testing-module/modules/boot-module/boot-module.utilities.unit.test.ts:12]
  └─> it(…)(): Promise<void> [projects/common/testing/src/modules/testing-module/modules/boot-module/boot-module.utilities.unit.test.ts:13]
    └─> bootModule(module: DynamicModule | Type<unknown>): Promise<TestingModule> [projects/common/testing/src/modules/testing-module/modules/boot-module/boot-module.utilities.ts:8]
       ↳ Boots a root module with its real providers, closing it once the running test finishes.
      └─> onTestFinished(…)(): Promise<void> [projects/common/testing/src/modules/testing-module/modules/boot-module/boot-module.utilities.ts:15]
```

**22. `run`** — depth 3 · orphan-root

```text
🚀 run(…): Promise<{ exitCode: number | undefined; stderr: string; stdout: string; timedOut: boolean; }> [projects/common/testing/src/modules/command/command.utilities.ts:32]
  └─> sanitizeEnvironment(…): Record<string, string> [projects/common/testing/src/modules/command/command.utilities.ts:64]
     ↳ Builds a child-process environment from the inherited keys alone, so `NX_*`, `npm_config_*` and tokens never leak in;…
    └─> flatMap(…)(this: undefined, key: string): (readonly [string, string])[] [projects/common/testing/src/modules/command/command.utilities.ts:68]
```

**23. `generate`** — depth ≥ 3 · orphan-root

```text
🚀 generate(…): Promise<CommandResult> [projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.functions.ts:63]
  └─> command(name: string, args?: readonly string[]): Command [projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.functions.ts:57]
    └─> createCommand(…): Command [projects/common/testing/src/modules/command/command.utilities.ts:14]
       ↳ Describes one child process: chain `inDirectory`, `withEnvironment` and `withTimeout`, then `run` it.
```

**24. `runTarget`** — depth ≥ 3 · orphan-root

```text
🚀 runTarget(target: string, args?: readonly string[] | undefined): Promise<CommandResult> [projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.functions.ts:81]
  └─> command(name: string, args?: readonly string[]): Command [projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.functions.ts:57]
    └─> createCommand(…): Command [projects/common/testing/src/modules/command/command.utilities.ts:14]
       ↳ Describes one child process: chain `inDirectory`, `withEnvironment` and `withTimeout`, then `run` it.
```

**25. `createWorkspace`** — depth ≥ 3 · orphan-root

```text
🚀 createWorkspace(workspaceOptions: ConsumerWorkspaceOptions): Promise<ConsumerWorkspace> [projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.utilities.ts:51]
  └─> bootstrapConsumerWorkspace(…): Promise<ConsumerWorkspace> [projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.functions.ts:15]
     ↳ Creates a clean Nx consumer workspace in `directory` and installs it.
    └─> map(…)(name: string): [string, string] [projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.functions.ts:22]
```

**26. `mockFileSystem`** — depth 3 · orphan-root

```text
🚀 mockFileSystem(actual?: Readonly<Record<string, unknown>>): FileSystemMock [projects/common/testing/src/modules/file-system-mock/file-system-mock.utilities.ts:8]
   ↳ Builds a file-system `vi.mock` factory's module, served as named and `default` exports; given the real module,…
  └─> map(…)([name, value]: [string, unknown]): [string, unknown] [projects/common/testing/src/modules/file-system-mock/file-system-mock.utilities.ts:17]
    └─> isFunction(value: unknown): value is (...parameters: never[]) => unknown [projects/common/testing/src/modules/file-system-mock/file-system-mock.utilities.ts:27]
       ↳ Whether a module member is a function, which a spy can wrap.
```

**27. `describe(…)`** — depth 3 · orphan-root

```text
🚀 describe(…)(): void [projects/common/testing/src/modules/file-system-mock/file-system-mock.utilities.unit.test.ts:35]
  └─> it(…)(): void [projects/common/testing/src/modules/file-system-mock/file-system-mock.utilities.unit.test.ts:36]
    └─> existsThroughDefault(file: string): boolean [projects/common/testing/testing/fixtures/sample-file-reader.ts:5]
       ↳ Reads through the default export, as code that writes `import fs from "node:fs"` does.
```

**28. `describe(…)`** — depth 3 · orphan-root

```text
🚀 describe(…)(): void [projects/common/testing/src/modules/file-tree/modules/workspace-tree/workspace-tree.utilities.unit.test.ts:7]
  └─> it(…)(): void [projects/common/testing/src/modules/file-tree/modules/workspace-tree/workspace-tree.utilities.unit.test.ts:8]
    └─> createWorkspaceTree(files?: Readonly<Record<string, string>>): Tree [projects/common/testing/src/modules/file-tree/modules/workspace-tree/workspace-tree.utilities.ts:9]
       ↳ Builds an in-memory Nx workspace holding each given file at its workspace path, for testing a generator, executor, or…
```

**29. `describe(…)`** — depth ≥ 3 · orphan-root

```text
🚀 describe(…)(): void [projects/common/testing/src/modules/nx-plugin-sandbox/modules/packed-sandbox/packed-sandbox.utilities.unit.test.ts:90]
  └─> it(…)(): void [projects/common/testing/src/modules/nx-plugin-sandbox/modules/packed-sandbox/packed-sandbox.utilities.unit.test.ts:113]
    └─> every(…)(m: string): boolean [projects/common/testing/src/modules/nx-plugin-sandbox/modules/packed-sandbox/packed-sandbox.utilities.unit.test.ts:115]
```

**30. `describe(…)`** — depth 3 · orphan-root

```text
🚀 describe(…)(): void [projects/common/testing/src/modules/browser-stand-ins/modules/route-render/route-render.utilities.unit.test.tsx:50]
  └─> it(…)(): Promise<void> [projects/common/testing/src/modules/browser-stand-ins/modules/route-render/route-render.utilities.unit.test.tsx:55]
    └─> renderRoute(router: AnyRouter, path: string): Promise<RenderResult> [projects/common/testing/src/modules/browser-stand-ins/modules/route-render/route-render.utilities.tsx:12]
       ↳ Renders a router at a path, running its loader.
```

**31. `inDirectory`** — depth 2 · orphan-root

```text
🚀 inDirectory(next: string): Command [projects/common/testing/src/modules/command/command.utilities.ts:30]
  └─> createCommand(…): Command [projects/common/testing/src/modules/command/command.utilities.ts:14]
     ↳ Describes one child process: chain `inDirectory`, `withEnvironment` and `withTimeout`, then `run` it.
```

**32. `withEnvironment`** — depth 2 · orphan-root

```text
🚀 withEnvironment(variables: Readonly<Record<string, string>>): Command [projects/common/testing/src/modules/command/command.utilities.ts:50]
  └─> createCommand(…): Command [projects/common/testing/src/modules/command/command.utilities.ts:14]
     ↳ Describes one child process: chain `inDirectory`, `withEnvironment` and `withTimeout`, then `run` it.
```

**33. `withTimeout`** — depth 2 · orphan-root

```text
🚀 withTimeout(milliseconds: number): Command [projects/common/testing/src/modules/command/command.utilities.ts:55]
  └─> createCommand(…): Command [projects/common/testing/src/modules/command/command.utilities.ts:14]
     ↳ Describes one child process: chain `inDirectory`, `withEnvironment` and `withTimeout`, then `run` it.
```

**34. `anonymous`** — depth 2 · orphan-root

```text
🚀 anonymous(): void [projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.ts:54]
  └─> removeDirectory(directory: string): void [projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.ts:71]
     ↳ Removes a directory and everything in it, if it is still there.
```

**35. `command`** — depth ≥ 2 · orphan-root

```text
🚀 command(command: string, args?: readonly string[] | undefined): Command [projects/common/testing/src/modules/nx-plugin-sandbox/modules/tarball-sandbox/tarball-sandbox.utilities.ts:70]
  └─> createCommand(…): Command [projects/common/testing/src/modules/command/command.utilities.ts:14]
     ↳ Describes one child process: chain `inDirectory`, `withEnvironment` and `withTimeout`, then `run` it.
```

**36. `registerPlugin`** — depth 2 · orphan-root

```text
🚀 registerPlugin(plugin: string, options: Readonly<Record<string, unknown>> | undefined): void [projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.functions.ts:65]
  └─> some(…)(entry: string | { options?: unknown; plugin: string; }): boolean [projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.functions.ts:70]
```

**37. `command`** — depth ≥ 2 · orphan-root

```text
🚀 command(command: string, args: readonly string[] | undefined): Command [projects/common/testing/src/modules/nx-plugin-sandbox/modules/packed-sandbox/packed-sandbox.utilities.ts:89]
  └─> current(): TarballSandboxRunner [projects/common/testing/src/modules/nx-plugin-sandbox/modules/packed-sandbox/packed-sandbox.utilities.ts:72]
```

**38. `get directory`** — depth 2 · orphan-root

```text
🚀 get directory(): string [projects/common/testing/src/modules/nx-plugin-sandbox/modules/packed-sandbox/packed-sandbox.utilities.ts:90]
  └─> current(): TarballSandboxRunner [projects/common/testing/src/modules/nx-plugin-sandbox/modules/packed-sandbox/packed-sandbox.utilities.ts:72]
```

**39. `run`** — depth ≥ 2 · orphan-root

```text
🚀 run(directory: string, args: readonly string[]): Promise<CommandResult> [projects/common/testing/src/modules/nx-plugin-sandbox/modules/packed-sandbox/packed-sandbox.utilities.ts:93]
  └─> current(): TarballSandboxRunner [projects/common/testing/src/modules/nx-plugin-sandbox/modules/packed-sandbox/packed-sandbox.utilities.ts:72]
```

**40. `get sandbox`** — depth 2 · orphan-root

```text
🚀 get sandbox(): TarballSandboxRunner [projects/common/testing/src/modules/nx-plugin-sandbox/modules/packed-sandbox/packed-sandbox.utilities.ts:101]
  └─> current(): TarballSandboxRunner [projects/common/testing/src/modules/nx-plugin-sandbox/modules/packed-sandbox/packed-sandbox.utilities.ts:72]
```

**41. `beforeEach(…)`** — depth 2 · orphan-root

```text
🚀 beforeEach(…)(): void [projects/common/testing/src/setup.ts:33]
  └─> mockImplementation(…)(): void [projects/common/testing/src/setup.ts:35]
```

**42. `describe(…)`** — depth 2 · orphan-root

```text
🚀 describe(…)(): void [projects/common/testing/src/setup.unit.test.ts:12]
  └─> it(…)(): void [projects/common/testing/src/setup.unit.test.ts:15]
```

**43. `mock(…)`** — depth ≥ 2 · orphan-root

```text
🚀 mock(…)(…): Promise<ChildProcessMock> [projects/common/testing/src/modules/mocks/mocks.utilities.unit.test.ts:26]
  └─> mockChildProcess(actual: typeof ChildProcess): ChildProcessMock [projects/common/testing/src/modules/mocks/mocks.utilities.ts:34]
     ↳ The `node:child_process` module with each process-starting function wrapped in a spy that runs the real process until a…
```

**44. `mock(…)`** — depth ≥ 2 · orphan-root

```text
🚀 mock(…)(…): Promise<typeof import("/home/user/codebase/projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities")> [projects/common/testing/src/modules/mocks/mocks.utilities.unit.test.ts:34]
  └─> mockPartially<Module extends object>(actual: Module, overrides: Partial<Module>): Module [projects/common/testing/src/modules/mocks/mocks.utilities.ts:77]
     ↳ Replaces only the given members of a module, keeping the rest of the real module, for a `vi.mock` factory.
```

**45. `map(…)`** — depth ≥ 2 · orphan-root

```text
🚀 map(…)(…): string [projects/common/testing/src/modules/nx-plugin-sandbox/modules/packed-sandbox/packed-sandbox.utilities.unit.test.ts:86]
  └─> messageOfRead(read: () => unknown): string [projects/common/testing/src/modules/nx-plugin-sandbox/modules/packed-sandbox/packed-sandbox.utilities.unit.test.ts:21]
     ↳ The message a read throws, or an empty string when it does not throw.
```

**46. `describe(…)`** — depth 2 · orphan-root

```text
🚀 describe(…)(): void [projects/common/testing/src/react-setup.unit.test.tsx:9]
  └─> it(…)(): void [projects/common/testing/src/react-setup.unit.test.tsx:10]
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `describe(…)` | 8 | `it(…)`, `it(…)`, `it(…)`, `it(…)`, `it(…)`, `it(…)`, `it(…)`, `it(…)` | `projects/common/testing/src/setup.unit.test.ts:12` |
| `describe(…)` | 8 | `it(…)`, `it(…)`, `it(…)`, `it(…)`, `it(…)`, `it(…)`, `describe(…)`, `it(…)` | `projects/common/testing/src/modules/environment/environment.utilities.unit.test.ts:10` |
| `describe(…)` | 7 | `useTemporaryDirectory`, `beforeAll(…)`, `afterAll(…)`, `describe(…)`, `describe(…)`, `it(…)`, `it(…)` | `projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.utilities.unit.test.ts:15` |

<details>
<summary>223 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `createTarballSandboxRunner` | 6 | `findTarballs`, `makeDirectory`, `readNames`, `map(…)`, `createCommand`, `dispose` | `projects/common/testing/src/modules/nx-plugin-sandbox/modules/tarball-sandbox/tarball-sandbox.utilities.ts:22` |
| `describe(…)` | 6 | `it(…)`, `it(…)`, `it(…)`, `it(…)`, `it(…)`, `it(…)` | `projects/common/testing/src/modules/file-tree/file-tree.utilities.unit.test.ts:24` |
| `describe(…)` | 6 | `describe(…)`, `describe(…)`, `describe(…)`, `describe(…)`, `describe(…)`, `describe(…)` | `projects/common/testing/src/modules/mocks/mocks.utilities.unit.test.ts:51` |
| `describe(…)` | 6 | `afterEach(…)`, `it(…)`, `it(…)`, `it(…)`, `it(…)`, `it(…)` | `projects/common/testing/src/modules/nx-plugin-sandbox/modules/tarball-sandbox/tarball-sandbox.utilities.unit.test.ts:57` |
| `describe(…)` | 6 | `it(…)`, `it(…)`, `it(…)`, `it(…)`, `describe(…)`, `it(…)` | `projects/common/testing/src/modules/temporary-directory/modules/working-directory/working-directory.utilities.unit.test.ts:9` |
| `describe(…)` | 6 | `it(…)`, `it(…)`, `it(…)`, `it(…)`, `it(…)`, `it(…)` | `projects/common/testing/src/modules/testing-module/testing-module.utilities.unit.test.ts:17` |
| `describe(…)` | 5 | `it(…)`, `it(…)`, `it(…)`, `it(…)`, `it(…)` | `projects/common/testing/src/modules/command/modules/source-command/source-command.utilities.unit.test.ts:14` |
| `describe(…)` | 5 | `it(…)`, `it(…)`, `it(…)`, `it(…)`, `it(…)` | `projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.utilities.unit.test.ts:52` |
| `describe(…)` | 5 | `it(…)`, `it(…)`, `it(…)`, `it(…)`, `it(…)` | `projects/common/testing/src/modules/nx-plugin-sandbox/modules/packed-sandbox/packed-sandbox.utilities.unit.test.ts:90` |
| `startVerdaccioPluginRunner` | 4 | `makeDirectory`, `createServer`, `connect`, `stop` | `projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.utilities.ts:31` |
| `describe(…)` | 4 | `it(…)`, `it(…)`, `it(…)`, `it(…)` | `projects/common/testing/src/modules/command/command.utilities.unit.test.ts:32` |
| `describe(…)` | 4 | `it(…)`, `it(…)`, `it(…)`, `describe(…)` | `projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.unit.test.ts:16` |
| `stageExample` | 3 | `makeDirectory`, `onTestFinished(…)`, `writeFileTree` | `projects/common/testing/src/modules/command/modules/example-run/example-run.utilities.ts:48` |
| `map(…)` | 3 | `toSorted(…)`, `map(…)`, `filter(…)` | `projects/common/testing/src/modules/nx-plugin-sandbox/modules/tarball-sandbox/tarball-sandbox.utilities.ts:88` |
| `assertClosure` | 3 | `map(…)`, `map(…)`, `filter(…)` | `projects/common/testing/src/modules/nx-plugin-sandbox/modules/tarball-sandbox/tarball-sandbox.utilities.ts:112` |
| `readNames` | 3 | `readManifest`, `assertClosure`, `map(…)` | `projects/common/testing/src/modules/nx-plugin-sandbox/modules/tarball-sandbox/tarball-sandbox.utilities.ts:152` |
| `bootstrapConsumerWorkspace` | 3 | `map(…)`, `createCommand`, `describeWorkspace` | `projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.functions.ts:15` |
| `it(…)` | 3 | `map(…)`, `filter(…)`, `reachablePackages` | `projects/common/testing/src/entries.unit.test.ts:45` |
| `mockFileSystem` | 3 | `map(…)`, `map(…)`, `filter(…)` | `projects/common/testing/src/modules/file-system-mock/file-system-mock.utilities.ts:8` |
| `captureOutput` | 3 | `mockImplementation(…)`, `mockImplementation(…)`, `onTestFinished(…)` | `projects/common/testing/src/modules/capture/capture.utilities.ts:24` |
| `beforeEach(…)` | 3 | `mockImplementation(…)`, `mockImplementation(…)`, `mockImplementation(…)` | `projects/common/testing/src/setup.ts:33` |
| `describe(…)` | 3 | `it(…)`, `it(…)`, `it(…)` | `projects/common/testing/src/modules/capture/capture.utilities.unit.test.ts:17` |
| `describe(…)` | 3 | `describe(…)`, `describe(…)`, `it(…)` | `projects/common/testing/src/modules/clock/clock.utilities.unit.test.ts:8` |
| `describe(…)` | 3 | `mockDates`, `it(…)`, `it(…)` | `projects/common/testing/src/modules/clock/clock.utilities.unit.test.ts:9` |
| `describe(…)` | 3 | `describe(…)`, `describe(…)`, `describe(…)` | `projects/common/testing/src/modules/command/modules/example-run/example-run.utilities.unit.test.ts:17` |
| `it(…)` | 3 | `createFileTree`, `stageExample`, `removeStagedExample` | `projects/common/testing/src/modules/command/modules/example-run/example-run.utilities.unit.test.ts:77` |
| `describe(…)` | 3 | `it(…)`, `it(…)`, `it(…)` | `projects/common/testing/src/modules/file-system-mock/file-system-mock.utilities.unit.test.ts:35` |
| `describe(…)` | 3 | `it(…)`, `it(…)`, `it(…)` | `projects/common/testing/src/modules/file-tree/modules/fixtures/fixtures.utilities.unit.test.ts:13` |
| `describe(…)` | 3 | `it(…)`, `it(…)`, `it(…)` | `projects/common/testing/src/modules/mocks/mocks.utilities.unit.test.ts:158` |
| `describe(…)` | 3 | `it(…)`, `it(…)`, `it(…)` | `projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.utilities.unit.test.ts:109` |
| `describe(…)` | 3 | `it(…)`, `it(…)`, `it(…)` | `projects/common/testing/src/modules/nx-plugin-sandbox/modules/tarball-sandbox/tarball-sandbox.utilities.unit.test.ts:19` |
| `it(…)` | 3 | `createTemporaryDirectory`, `createFixtureTarball`, `findTarballs` | `projects/common/testing/src/modules/nx-plugin-sandbox/modules/tarball-sandbox/tarball-sandbox.utilities.unit.test.ts:20` |
| `it(…)` | 3 | `createTemporaryDirectory`, `createFixtureTarball`, `expect(…)` | `projects/common/testing/src/modules/nx-plugin-sandbox/modules/tarball-sandbox/tarball-sandbox.utilities.unit.test.ts:44` |
| `it(…)` | 3 | `createTemporaryDirectory`, `createFixtureTarball`, `createTarballSandboxRunner` | `projects/common/testing/src/modules/nx-plugin-sandbox/modules/tarball-sandbox/tarball-sandbox.utilities.unit.test.ts:65` |
| `it(…)` | 3 | `createTemporaryDirectory`, `createFixtureTarball`, `createTarballSandboxRunner` | `projects/common/testing/src/modules/nx-plugin-sandbox/modules/tarball-sandbox/tarball-sandbox.utilities.unit.test.ts:95` |
| `it(…)` | 3 | `createTemporaryDirectory`, `createFixtureTarball`, `createTarballSandboxRunner` | `projects/common/testing/src/modules/nx-plugin-sandbox/modules/tarball-sandbox/tarball-sandbox.utilities.unit.test.ts:112` |
| `it(…)` | 3 | `createTemporaryDirectory`, `createFixtureTarball`, `createTarballSandboxRunner` | `projects/common/testing/src/modules/nx-plugin-sandbox/modules/tarball-sandbox/tarball-sandbox.utilities.unit.test.ts:126` |
| `describe(…)` | 3 | `beforeEach(…)`, `it(…)`, `it(…)` | `projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.unit.test.ts:40` |
| `describe(…)` | 3 | `describe(…)`, `it(…)`, `describe(…)` | `projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.unit.test.ts:60` |
| `describe(…)` | 3 | `useTemporaryDirectory`, `it(…)`, `it(…)` | `projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.unit.test.ts:63` |
| `describe(…)` | 3 | `it(…)`, `it(…)`, `it(…)` | `projects/common/testing/src/modules/testing-module/modules/boot-module/boot-module.utilities.unit.test.ts:12` |
| `describe(…)` | 3 | `describe(…)`, `describe(…)`, `describe(…)` | `projects/common/testing/src/modules/testing-module/modules/module-wiring/module-wiring.utilities.unit.test.ts:34` |
| `describe(…)` | 3 | `it(…)`, `it(…)`, `it(…)` | `projects/common/testing/src/react-setup.unit.test.tsx:9` |
| `describe(…)` | 3 | `afterEach(…)`, `it(…)`, `it(…)` | `projects/common/testing/src/modules/browser-stand-ins/modules/route-render/route-render.utilities.unit.test.tsx:50` |
| `createTemporaryDirectory` | 2 | `makeDirectory`, `onTestFinished(…)` | `projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.ts:13` |
| `createFileTree` | 2 | `createTemporaryDirectory`, `writeFileTree` | `projects/common/testing/src/modules/file-tree/file-tree.utilities.ts:9` |
| `listExampleNames` | 2 | `map(…)`, `filter(…)` | `projects/common/testing/src/modules/command/modules/example-run/example-run.utilities.ts:29` |
| `createWorkspace` | 2 | `makeDirectory`, `bootstrapConsumerWorkspace` | `projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.utilities.ts:51` |
| `publish` | 2 | `findTarballs`, `publishTarball` | `projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.utilities.ts:62` |
| `connect` | 2 | `listen`, `createRegistryToken` | `projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.utilities.ts:93` |
| `usePackedRegistry` | 2 | `beforeAll(…)`, `afterAll(…)` | `projects/common/testing/src/modules/nx-plugin-sandbox/modules/packed-sandbox/packed-sandbox.utilities.ts:34` |
| `usePackedSandbox` | 2 | `beforeAll(…)`, `afterAll(…)` | `projects/common/testing/src/modules/nx-plugin-sandbox/modules/packed-sandbox/packed-sandbox.utilities.ts:70` |
| `describe(…)` | 2 | `it(…)`, `it(…)` | `projects/common/testing/src/entries.unit.test.ts:44` |
| `mockDates` | 2 | `beforeEach(…)`, `afterEach(…)` | `projects/common/testing/src/modules/clock/clock.utilities.ts:9` |
| `overrideEnvironment` | 2 | `onTestFinished(…)`, `setVariable` | `projects/common/testing/src/modules/environment/environment.utilities.ts:7` |
| `mockExecFile` | 2 | `mockChildProcess`, `fn(…)` | `projects/common/testing/src/modules/mocks/mocks.utilities.ts:53` |
| `describe(…)` | 2 | `describe(…)`, `describe(…)` | `projects/common/testing/src/modules/browser-stand-ins/browser-stand-ins.utilities.unit.test.ts:10` |
| `describe(…)` | 2 | `it(…)`, `it(…)` | `projects/common/testing/src/modules/browser-stand-ins/browser-stand-ins.utilities.unit.test.ts:11` |
| `it(…)` | 2 | `handler(…)`, `createServerFunctionStandIn` | `projects/common/testing/src/modules/browser-stand-ins/browser-stand-ins.utilities.unit.test.ts:12` |
| `it(…)` | 2 | `handler(…)`, `createServerFunctionStandIn` | `projects/common/testing/src/modules/browser-stand-ins/browser-stand-ins.utilities.unit.test.ts:22` |
| `describe(…)` | 2 | `it(…)`, `it(…)` | `projects/common/testing/src/modules/browser-stand-ins/browser-stand-ins.utilities.unit.test.ts:29` |
| `it(…)` | 2 | `matchMediaStandIn`, `expect(…)` | `projects/common/testing/src/modules/browser-stand-ins/browser-stand-ins.utilities.unit.test.ts:39` |
| `describe(…)` | 2 | `describe(…)`, `describe(…)` | `projects/common/testing/src/modules/capture/capture.utilities.unit.test.ts:16` |
| `describe(…)` | 2 | `it(…)`, `it(…)` | `projects/common/testing/src/modules/capture/capture.utilities.unit.test.ts:43` |
| `describe(…)` | 2 | `mockDates`, `it(…)` | `projects/common/testing/src/modules/clock/clock.utilities.unit.test.ts:24` |
| `describe(…)` | 2 | `describe(…)`, `describe(…)` | `projects/common/testing/src/modules/command/command.utilities.unit.test.ts:8` |
| `describe(…)` | 2 | `it(…)`, `it(…)` | `projects/common/testing/src/modules/command/command.utilities.unit.test.ts:9` |
| `it(…)` | 2 | `createFileTree`, `listExampleNames` | `projects/common/testing/src/modules/command/modules/example-run/example-run.utilities.unit.test.ts:19` |
| `describe(…)` | 2 | `it(…)`, `it(…)` | `projects/common/testing/src/modules/command/modules/example-run/example-run.utilities.unit.test.ts:32` |
| `it(…)` | 2 | `createFileTree`, `findGuideGaps` | `projects/common/testing/src/modules/command/modules/example-run/example-run.utilities.unit.test.ts:33` |
| `it(…)` | 2 | `createFileTree`, `findGuideGaps` | `projects/common/testing/src/modules/command/modules/example-run/example-run.utilities.unit.test.ts:44` |
| `describe(…)` | 2 | `it(…)`, `it(…)` | `projects/common/testing/src/modules/command/modules/example-run/example-run.utilities.unit.test.ts:56` |
| `it(…)` | 2 | `createFileTree`, `stageExample` | `projects/common/testing/src/modules/command/modules/example-run/example-run.utilities.unit.test.ts:57` |
| `describe(…)` | 2 | `beforeEach(…)`, `it(…)` | `projects/common/testing/src/modules/environment/environment.utilities.unit.test.ts:47` |
| `it(…)` | 2 | `existsThroughDefault`, `readThroughNamed` | `projects/common/testing/src/modules/file-system-mock/file-system-mock.utilities.unit.test.ts:36` |
| `describe(…)` | 2 | `describe(…)`, `describe(…)` | `projects/common/testing/src/modules/file-tree/file-tree.utilities.unit.test.ts:10` |
| `it(…)` | 2 | `createFileTree`, `writeFileTree` | `projects/common/testing/src/modules/file-tree/file-tree.utilities.unit.test.ts:12` |
| `it(…)` | 2 | `createTemporaryDirectory`, `loadFixture` | `projects/common/testing/src/modules/file-tree/modules/fixtures/fixtures.utilities.unit.test.ts:14` |
| `describe(…)` | 2 | `it(…)`, `it(…)` | `projects/common/testing/src/modules/file-tree/modules/workspace-tree/workspace-tree.utilities.unit.test.ts:7` |
| `describe(…)` | 2 | `it(…)`, `it(…)` | `projects/common/testing/src/modules/mocks/mocks.utilities.unit.test.ts:52` |
| `describe(…)` | 2 | `it(…)`, `it(…)` | `projects/common/testing/src/modules/mocks/mocks.utilities.unit.test.ts:80` |
| `it(…)` | 2 | `mockExecFile(…)`, `mockExecFile` | `projects/common/testing/src/modules/mocks/mocks.utilities.unit.test.ts:81` |
| `it(…)` | 2 | `mockExecFile(…)`, `mockExecFile` | `projects/common/testing/src/modules/mocks/mocks.utilities.unit.test.ts:100` |
| `describe(…)` | 2 | `it(…)`, `it(…)` | `projects/common/testing/src/modules/mocks/mocks.utilities.unit.test.ts:131` |
| `it(…)` | 2 | `stubFetch`, `textOf` | `projects/common/testing/src/modules/mocks/mocks.utilities.unit.test.ts:134` |
| `beforeAll(…)` | 2 | `createFixtureTarball`, `startVerdaccioPluginRunner` | `projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.utilities.unit.test.ts:19` |
| `describe(…)` | 2 | `describe(…)`, `describe(…)` | `projects/common/testing/src/modules/nx-plugin-sandbox/modules/tarball-sandbox/tarball-sandbox.utilities.unit.test.ts:18` |
| `it(…)` | 2 | `createTemporaryDirectory`, `createTarballSandboxRunner` | `projects/common/testing/src/modules/nx-plugin-sandbox/modules/tarball-sandbox/tarball-sandbox.utilities.unit.test.ts:143` |
| `describe(…)` | 2 | `describe(…)`, `describe(…)` | `projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.unit.test.ts:15` |
| `describe(…)` | 2 | `useTemporaryDirectory`, `it(…)` | `projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.unit.test.ts:86` |
| `describe(…)` | 2 | `beforeEach(…)`, `it(…)` | `projects/common/testing/src/modules/temporary-directory/modules/working-directory/working-directory.utilities.unit.test.ts:31` |
| `it(…)` | 2 | `buildTestingModule`, `SampleGreeterService.greet` | `projects/common/testing/src/modules/testing-module/testing-module.utilities.unit.test.ts:18` |
| `it(…)` | 2 | `buildTestingModule`, `SampleGreeterService.greet` | `projects/common/testing/src/modules/testing-module/testing-module.utilities.unit.test.ts:41` |
| `it(…)` | 2 | `buildTestingModule`, `mockErrorLogEntries` | `projects/common/testing/src/modules/testing-module/testing-module.utilities.unit.test.ts:59` |
| `it(…)` | 2 | `setErrorLogFilePath`, `Sample.read` | `projects/common/testing/src/modules/testing-module/testing-module.utilities.unit.test.ts:75` |
| `describe(…)` | 2 | `it(…)`, `it(…)` | `projects/common/testing/src/modules/testing-module/modules/module-wiring/module-wiring.utilities.unit.test.ts:35` |
| `describe(…)` | 2 | `it(…)`, `it(…)` | `projects/common/testing/src/modules/testing-module/modules/module-wiring/module-wiring.utilities.unit.test.ts:49` |
| `describe(…)` | 2 | `it(…)`, `it(…)` | `projects/common/testing/src/modules/testing-module/modules/module-wiring/module-wiring.utilities.unit.test.ts:63` |
| `it(…)` | 2 | `renderRoute`, `getRouter` | `projects/common/testing/src/modules/browser-stand-ins/modules/route-render/route-render.utilities.unit.test.tsx:55` |
| `it(…)` | 2 | `renderRoute`, `getRouter` | `projects/common/testing/src/modules/browser-stand-ins/modules/route-render/route-render.utilities.unit.test.tsx:65` |
| `inDirectory` | 1 | `createCommand` | `projects/common/testing/src/modules/command/command.utilities.ts:30` |
| `run` | 1 | `sanitizeEnvironment` | `projects/common/testing/src/modules/command/command.utilities.ts:32` |
| `withEnvironment` | 1 | `createCommand` | `projects/common/testing/src/modules/command/command.utilities.ts:50` |
| `withTimeout` | 1 | `createCommand` | `projects/common/testing/src/modules/command/command.utilities.ts:55` |
| `sanitizeEnvironment` | 1 | `flatMap(…)` | `projects/common/testing/src/modules/command/command.utilities.ts:64` |
| `onTestFinished(…)` | 1 | `removeDirectory` | `projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.ts:19` |
| `useTemporaryDirectory` | 1 | `beforeAll(…)` | `projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.ts:47` |
| `beforeAll(…)` | 1 | `makeDirectory` | `projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.ts:50` |
| `anonymous` | 1 | `removeDirectory` | `projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.ts:54` |
| `findGuideGaps` | 1 | `filter(…)` | `projects/common/testing/src/modules/command/modules/example-run/example-run.utilities.ts:12` |
| `onTestFinished(…)` | 1 | `removeStagedExample` | `projects/common/testing/src/modules/command/modules/example-run/example-run.utilities.ts:60` |
| `runSourceCommand` | 1 | `createCommand` | `projects/common/testing/src/modules/command/modules/source-command/source-command.utilities.ts:9` |
| `command` | 1 | `createCommand` | `projects/common/testing/src/modules/nx-plugin-sandbox/modules/tarball-sandbox/tarball-sandbox.utilities.ts:70` |
| `findTarballs` | 1 | `map(…)` | `projects/common/testing/src/modules/nx-plugin-sandbox/modules/tarball-sandbox/tarball-sandbox.utilities.ts:82` |
| `readManifest` | 1 | `createCommand` | `projects/common/testing/src/modules/nx-plugin-sandbox/modules/tarball-sandbox/tarball-sandbox.utilities.ts:137` |
| `command` | 1 | `createCommand` | `projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.functions.ts:57` |
| `generate` | 1 | `command` | `projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.functions.ts:63` |
| `registerPlugin` | 1 | `some(…)` | `projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.functions.ts:65` |
| `runTarget` | 1 | `command` | `projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.functions.ts:81` |
| `stop` | 1 | `closeServer` | `projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.utilities.ts:39` |
| `closeServer` | 1 | `anonymous` | `projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.utilities.ts:83` |
| `anonymous` | 1 | `close(…)` | `projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.utilities.ts:84` |
| `createServer` | 1 | `map(…)` | `projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.utilities.ts:138` |
| `listen` | 1 | `anonymous` | `projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.utilities.ts:162` |
| `anonymous` | 1 | `listen(…)` | `projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.utilities.ts:163` |
| `publishTarball` | 1 | `createCommand` | `projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.utilities.ts:172` |
| `beforeAll(…)` | 1 | `startVerdaccioPluginRunner` | `projects/common/testing/src/modules/nx-plugin-sandbox/modules/packed-sandbox/packed-sandbox.utilities.ts:39` |
| `beforeAll(…)` | 1 | `createTarballSandboxRunner` | `projects/common/testing/src/modules/nx-plugin-sandbox/modules/packed-sandbox/packed-sandbox.utilities.ts:80` |
| `command` | 1 | `current` | `projects/common/testing/src/modules/nx-plugin-sandbox/modules/packed-sandbox/packed-sandbox.utilities.ts:89` |
| `get directory` | 1 | `current` | `projects/common/testing/src/modules/nx-plugin-sandbox/modules/packed-sandbox/packed-sandbox.utilities.ts:90` |
| `run` | 1 | `current` | `projects/common/testing/src/modules/nx-plugin-sandbox/modules/packed-sandbox/packed-sandbox.utilities.ts:93` |
| `get sandbox` | 1 | `current` | `projects/common/testing/src/modules/nx-plugin-sandbox/modules/packed-sandbox/packed-sandbox.utilities.ts:101` |
| `reachablePackages` | 1 | `filter(…)` | `projects/common/testing/src/entries.unit.test.ts:11` |
| `it(…)` | 1 | `reachablePackages` | `projects/common/testing/src/entries.unit.test.ts:62` |
| `map(…)` | 1 | `isFunction` | `projects/common/testing/src/modules/file-system-mock/file-system-mock.utilities.ts:17` |
| `captureExitCode` | 1 | `onTestFinished(…)` | `projects/common/testing/src/modules/capture/capture.utilities.ts:9` |
| `mockImplementation(…)` | 1 | `toText` | `projects/common/testing/src/modules/capture/capture.utilities.ts:29` |
| `mockImplementation(…)` | 1 | `toText` | `projects/common/testing/src/modules/capture/capture.utilities.ts:35` |
| `onTestFinished(…)` | 1 | `setVariable` | `projects/common/testing/src/modules/environment/environment.utilities.ts:13` |
| `answerPrompts` | 1 | `onTestFinished(…)` | `projects/common/testing/src/modules/mocks/mocks.utilities.ts:20` |
| `stubFetch` | 1 | `onTestFinished(…)` | `projects/common/testing/src/modules/mocks/mocks.utilities.ts:99` |
| `useWorkingDirectory` | 1 | `onTestFinished(…)` | `projects/common/testing/src/modules/temporary-directory/modules/working-directory/working-directory.utilities.ts:7` |
| `bootModule` | 1 | `onTestFinished(…)` | `projects/common/testing/src/modules/testing-module/modules/boot-module/boot-module.utilities.ts:8` |
| `expectModuleExports` | 1 | `expectModuleMetadata` | `projects/common/testing/src/modules/testing-module/modules/module-wiring/module-wiring.utilities.ts:9` |
| `expectModuleImports` | 1 | `expectModuleMetadata` | `projects/common/testing/src/modules/testing-module/modules/module-wiring/module-wiring.utilities.ts:19` |
| `expectModuleProvides` | 1 | `expectModuleMetadata` | `projects/common/testing/src/modules/testing-module/modules/module-wiring/module-wiring.utilities.ts:29` |
| `buildTestingModule` | 1 | `map(…)` | `projects/common/testing/src/modules/testing-module/testing-module.utilities.ts:18` |
| `mockErrorLogEntries` | 1 | `mockImplementation(…)` | `projects/common/testing/src/modules/testing-module/testing-module.utilities.ts:46` |
| `it(…)` | 1 | `matchMediaStandIn` | `projects/common/testing/src/modules/browser-stand-ins/browser-stand-ins.utilities.unit.test.ts:30` |
| `flushed` | 1 | `anonymous` | `projects/common/testing/src/modules/capture/capture.utilities.unit.test.ts:8` |
| `anonymous` | 1 | `write(…)` | `projects/common/testing/src/modules/capture/capture.utilities.unit.test.ts:9` |
| `it(…)` | 1 | `captureOutput` | `projects/common/testing/src/modules/capture/capture.utilities.unit.test.ts:18` |
| `it(…)` | 1 | `captureOutput` | `projects/common/testing/src/modules/capture/capture.utilities.unit.test.ts:29` |
| `it(…)` | 1 | `flushed` | `projects/common/testing/src/modules/capture/capture.utilities.unit.test.ts:37` |
| `it(…)` | 1 | `captureExitCode` | `projects/common/testing/src/modules/capture/capture.utilities.unit.test.ts:46` |
| `it(…)` | 1 | `sanitizeEnvironment` | `projects/common/testing/src/modules/command/command.utilities.unit.test.ts:10` |
| `it(…)` | 1 | `sanitizeEnvironment` | `projects/common/testing/src/modules/command/command.utilities.unit.test.ts:22` |
| `it(…)` | 1 | `createCommand` | `projects/common/testing/src/modules/command/command.utilities.unit.test.ts:35` |
| `it(…)` | 1 | `createCommand` | `projects/common/testing/src/modules/command/command.utilities.unit.test.ts:51` |
| `it(…)` | 1 | `createCommand` | `projects/common/testing/src/modules/command/command.utilities.unit.test.ts:63` |
| `it(…)` | 1 | `createCommand` | `projects/common/testing/src/modules/command/command.utilities.unit.test.ts:76` |
| `describe(…)` | 1 | `it(…)` | `projects/common/testing/src/modules/command/modules/example-run/example-run.utilities.unit.test.ts:18` |
| `it(…)` | 1 | `runSourceCommand` | `projects/common/testing/src/modules/command/modules/source-command/source-command.utilities.unit.test.ts:15` |
| `it(…)` | 1 | `runSourceCommand` | `projects/common/testing/src/modules/command/modules/source-command/source-command.utilities.unit.test.ts:30` |
| `it(…)` | 1 | `runSourceCommand` | `projects/common/testing/src/modules/command/modules/source-command/source-command.utilities.unit.test.ts:40` |
| `it(…)` | 1 | `runSourceCommand` | `projects/common/testing/src/modules/command/modules/source-command/source-command.utilities.unit.test.ts:53` |
| `it(…)` | 1 | `runSourceCommand` | `projects/common/testing/src/modules/command/modules/source-command/source-command.utilities.unit.test.ts:68` |
| `it(…)` | 1 | `overrideEnvironment` | `projects/common/testing/src/modules/environment/environment.utilities.unit.test.ts:14` |
| `it(…)` | 1 | `overrideEnvironment` | `projects/common/testing/src/modules/environment/environment.utilities.unit.test.ts:26` |
| `it(…)` | 1 | `overrideEnvironment` | `projects/common/testing/src/modules/environment/environment.utilities.unit.test.ts:36` |
| `beforeEach(…)` | 1 | `overrideEnvironment` | `projects/common/testing/src/modules/environment/environment.utilities.unit.test.ts:48` |
| `it(…)` | 1 | `existsThroughDefault` | `projects/common/testing/src/modules/file-system-mock/file-system-mock.utilities.unit.test.ts:46` |
| `it(…)` | 1 | `readThroughPromises` | `projects/common/testing/src/modules/file-system-mock/file-system-mock.utilities.unit.test.ts:50` |
| `describe(…)` | 1 | `it(…)` | `projects/common/testing/src/modules/file-tree/file-tree.utilities.unit.test.ts:11` |
| `it(…)` | 1 | `createFileTree` | `projects/common/testing/src/modules/file-tree/file-tree.utilities.unit.test.ts:27` |
| `it(…)` | 1 | `createFileTree` | `projects/common/testing/src/modules/file-tree/file-tree.utilities.unit.test.ts:42` |
| `it(…)` | 1 | `createFileTree` | `projects/common/testing/src/modules/file-tree/file-tree.utilities.unit.test.ts:48` |
| `it(…)` | 1 | `createFileTree` | `projects/common/testing/src/modules/file-tree/file-tree.utilities.unit.test.ts:56` |
| `it(…)` | 1 | `createFileTree` | `projects/common/testing/src/modules/file-tree/file-tree.utilities.unit.test.ts:63` |
| `it(…)` | 1 | `loadFixture` | `projects/common/testing/src/modules/file-tree/modules/fixtures/fixtures.utilities.unit.test.ts:24` |
| `it(…)` | 1 | `expect(…)` | `projects/common/testing/src/modules/file-tree/modules/fixtures/fixtures.utilities.unit.test.ts:30` |
| `expect(…)` | 1 | `loadFixture` | `projects/common/testing/src/modules/file-tree/modules/fixtures/fixtures.utilities.unit.test.ts:31` |
| `it(…)` | 1 | `createWorkspaceTree` | `projects/common/testing/src/modules/file-tree/modules/workspace-tree/workspace-tree.utilities.unit.test.ts:8` |
| `it(…)` | 1 | `createWorkspaceTree` | `projects/common/testing/src/modules/file-tree/modules/workspace-tree/workspace-tree.utilities.unit.test.ts:15` |
| `mock(…)` | 1 | `mockChildProcess` | `projects/common/testing/src/modules/mocks/mocks.utilities.unit.test.ts:26` |
| `mock(…)` | 1 | `mockPartially` | `projects/common/testing/src/modules/mocks/mocks.utilities.unit.test.ts:34` |
| `describe(…)` | 1 | `it(…)` | `projects/common/testing/src/modules/mocks/mocks.utilities.unit.test.ts:113` |
| `it(…)` | 1 | `processFailure` | `projects/common/testing/src/modules/mocks/mocks.utilities.unit.test.ts:114` |
| `describe(…)` | 1 | `it(…)` | `projects/common/testing/src/modules/mocks/mocks.utilities.unit.test.ts:123` |
| `it(…)` | 1 | `createTemporaryDirectory` | `projects/common/testing/src/modules/mocks/mocks.utilities.unit.test.ts:124` |
| `it(…)` | 1 | `answerPrompts` | `projects/common/testing/src/modules/mocks/mocks.utilities.unit.test.ts:159` |
| `it(…)` | 1 | `answerPrompts` | `projects/common/testing/src/modules/mocks/mocks.utilities.unit.test.ts:170` |
| `it(…)` | 1 | `startVerdaccioPluginRunner` | `projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.utilities.unit.test.ts:163` |
| `it(…)` | 1 | `startVerdaccioPluginRunner` | `projects/common/testing/src/modules/nx-plugin-sandbox/nx-plugin-sandbox.utilities.unit.test.ts:173` |
| `map(…)` | 1 | `messageOfRead` | `projects/common/testing/src/modules/nx-plugin-sandbox/modules/packed-sandbox/packed-sandbox.utilities.unit.test.ts:86` |
| `it(…)` | 1 | `every(…)` | `projects/common/testing/src/modules/nx-plugin-sandbox/modules/packed-sandbox/packed-sandbox.utilities.unit.test.ts:113` |
| `it(…)` | 1 | `installedVersion` | `projects/common/testing/src/modules/nx-plugin-sandbox/modules/packed-sandbox/packed-sandbox.utilities.unit.test.ts:118` |
| `it(…)` | 1 | `expect(…)` | `projects/common/testing/src/modules/nx-plugin-sandbox/modules/tarball-sandbox/tarball-sandbox.utilities.unit.test.ts:38` |
| `expect(…)` | 1 | `findTarballs` | `projects/common/testing/src/modules/nx-plugin-sandbox/modules/tarball-sandbox/tarball-sandbox.utilities.unit.test.ts:39` |
| `expect(…)` | 1 | `findTarballs` | `projects/common/testing/src/modules/nx-plugin-sandbox/modules/tarball-sandbox/tarball-sandbox.utilities.unit.test.ts:51` |
| `it(…)` | 1 | `createTemporaryDirectory` | `projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.unit.test.ts:19` |
| `it(…)` | 1 | `createTemporaryDirectory` | `projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.unit.test.ts:34` |
| `beforeEach(…)` | 1 | `createTemporaryDirectory` | `projects/common/testing/src/modules/temporary-directory/temporary-directory.utilities.unit.test.ts:43` |
| `it(…)` | 1 | `useWorkingDirectory` | `projects/common/testing/src/modules/temporary-directory/modules/working-directory/working-directory.utilities.unit.test.ts:10` |
| `it(…)` | 1 | `useWorkingDirectory` | `projects/common/testing/src/modules/temporary-directory/modules/working-directory/working-directory.utilities.unit.test.ts:20` |
| `beforeEach(…)` | 1 | `useWorkingDirectory` | `projects/common/testing/src/modules/temporary-directory/modules/working-directory/working-directory.utilities.unit.test.ts:32` |
| `SampleGreeterService.greet` | 1 | `SampleClockService.now` | `projects/common/testing/testing/fixtures/sample-greeter.service.ts:18` |
| `it(…)` | 1 | `buildTestingModule` | `projects/common/testing/src/modules/testing-module/testing-module.utilities.unit.test.ts:28` |
| `it(…)` | 1 | `buildTestingModule` | `projects/common/testing/src/modules/testing-module/testing-module.utilities.unit.test.ts:53` |
| `it(…)` | 1 | `bootModule` | `projects/common/testing/src/modules/testing-module/modules/boot-module/boot-module.utilities.unit.test.ts:13` |
| `it(…)` | 1 | `bootModule` | `projects/common/testing/src/modules/testing-module/modules/boot-module/boot-module.utilities.unit.test.ts:31` |
| `it(…)` | 1 | `expect(…)` | `projects/common/testing/src/modules/testing-module/modules/module-wiring/module-wiring.utilities.unit.test.ts:36` |
| `expect(…)` | 1 | `expectModuleProvides` | `projects/common/testing/src/modules/testing-module/modules/module-wiring/module-wiring.utilities.unit.test.ts:37` |
| `it(…)` | 1 | `expect(…)` | `projects/common/testing/src/modules/testing-module/modules/module-wiring/module-wiring.utilities.unit.test.ts:42` |
| `expect(…)` | 1 | `expectModuleProvides` | `projects/common/testing/src/modules/testing-module/modules/module-wiring/module-wiring.utilities.unit.test.ts:43` |
| `it(…)` | 1 | `expect(…)` | `projects/common/testing/src/modules/testing-module/modules/module-wiring/module-wiring.utilities.unit.test.ts:50` |
| `expect(…)` | 1 | `expectModuleExports` | `projects/common/testing/src/modules/testing-module/modules/module-wiring/module-wiring.utilities.unit.test.ts:51` |
| `it(…)` | 1 | `expect(…)` | `projects/common/testing/src/modules/testing-module/modules/module-wiring/module-wiring.utilities.unit.test.ts:56` |
| `expect(…)` | 1 | `expectModuleExports` | `projects/common/testing/src/modules/testing-module/modules/module-wiring/module-wiring.utilities.unit.test.ts:57` |
| `it(…)` | 1 | `expect(…)` | `projects/common/testing/src/modules/testing-module/modules/module-wiring/module-wiring.utilities.unit.test.ts:64` |
| `expect(…)` | 1 | `expectModuleImports` | `projects/common/testing/src/modules/testing-module/modules/module-wiring/module-wiring.utilities.unit.test.ts:65` |
| `it(…)` | 1 | `expect(…)` | `projects/common/testing/src/modules/testing-module/modules/module-wiring/module-wiring.utilities.unit.test.ts:70` |
| `expect(…)` | 1 | `expectModuleImports` | `projects/common/testing/src/modules/testing-module/modules/module-wiring/module-wiring.utilities.unit.test.ts:71` |

</details>
<!-- callidescope:end -->
