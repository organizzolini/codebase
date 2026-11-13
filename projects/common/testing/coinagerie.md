<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with this project's `coinagerie-check:write` Nx target.

- **contract**: The `LoggerServiceContract` type from `@codebase/observability`, the logger shape the testing-module builder accepts.
- **counter**: A spy in `setup.unit.test.ts` that counts calls, proving mocks reset between tests.
- **dispose**: Cleanup call on a sandbox runner that deletes its temporary consumer directory, which a packed test calls once it has finished with the installed tarballs.
- **forbid**: Names the packages an entry point must not reach, `execa` and `verdaccio`, in `entries.unit.test.ts`.
- **fork**: The `node:child_process` function, one of the process starters the child-process mock replaces with a spy.
- **greeter**: Sample dependency class in the module-wiring tests, injected to prove a module resolves its providers.
- **ping**: Sample server function in the browser stand-in tests that answers `pong`.
- **poem**: Sample route in the route-render tests whose loader data the rendered heading shows.
- **role**: The ARIA role testing-library queries find an element by, as in `findByRole("heading")`.
- **sandbox**: Isolated consumer project outside the workspace, where a packed test installs tarballs and runs the real executable. Everyday "sandbox" suggests a safe play area; here it is a disposable directory. Created by `createTarballSandboxRunner`.
- **selector**: A CSS selector string passed to `querySelector` in the route-render tests.
- **self**: The `self_path` key the Nx plugin sandbox writes, pointing a consumer workspace at its own directory.
- **starter**: A `node:child_process` function that starts a process, such as `spawn` or `fork`; `ProcessStarter` names the ones the mock replaces.
- **wire**: Connect a NestJS module's providers so its classes resolve; the module-wiring assertions check that this holds.

<!-- coinagerie:end -->
