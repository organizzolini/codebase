<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with this project's `coinagerie-check:write` Nx target.

- **baseline**: The previously committed report that a fresh measurement is diffed against when checking for stale reports.
- **breadth**: The number of distinct callables a function calls directly, reported in the breadth table and gated by a limit.
- **bundle**: The built JavaScript output that codometer measures for the package, with its size checked against a Bundle limit.
- **dispose**: Cleanup call on a sandbox runner that deletes its temporary consumer directory, which a packed test calls once it has finished with the installed tarballs. Defined by `@codebase/testing`.
- **sandbox**: Isolated consumer project outside the workspace, where a packed test installs tarballs and runs the real executable. Everyday "sandbox" suggests a safe play area; here it is a disposable directory. Created by `createTarballSandboxRunner` in `@codebase/testing`.
- **staleness**: The condition of a committed report that differs from a fresh run, kept distinct from a limit breach.
- **statistic**: A custom measurement counter declared in configuration, keyed by its label and measured for each output.

<!-- coinagerie:end -->
