# Raising Coverage

Coverage below 96% is a gap in what the tests prove, so close it with tests of behavior, never with tests that only execute lines.

1. **Measure.** Run `nx run <project>:vitest --configuration=coverage` and sort the report by branch coverage, lowest first.
2. **Take the worst file first.** The uncovered lines are usually guard clauses, empty-result paths, fallback branches, and error paths. Write one focused test per branch, asserting what the code returns or reports on that path.
3. **Re-run** and repeat until the gate passes.

Practices that keep it passing:

- Keep a project's `vitest.config.ts` thin: inherit the shared defaults through `mergeConfig(...)` from `configuration/typescript/vitest.config.ts`, so the threshold lives in one place.
- Give a service with dense branching a test file of its own for those branches, so its intent survives a refactor.
- Fix clocks and random sources (`mockDates`) for time- or math-heavy logic, so a branch test stays deterministic.
- For orchestration services, pair focused unit tests with a few integration tests of cross-service error propagation and empty data.
- After restructuring tests — renaming, regrouping, extracting a helper — re-run coverage before committing.
- Before opening a pull request, run the CI-shaped command: `nx affected --target=vitest --configuration=coverage --base=main`.
