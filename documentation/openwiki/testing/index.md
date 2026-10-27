# Files

- [Affirmancy Testing](affirmancy.md) - Documents affirmancy's pytest suites, test organization, type checking, and notebook output stripping conventions.
- [Integration Testing Patterns](integration.md) - Cross-project integration testing patterns using Testcontainers Postgres, GraphQL mock servers, Nx affected test runs, and workspace-wide validation with production-equivalent wiring.
- [Lexico Testing](lexico.md) - Documents lexico's testing strategy across its CLI, web, API, and entities packages using vitest, GraphQL mock servers, testcontainers for Postgres, and React Testing Library.
- [Meanderaw Testing](meanderaw.md) - Documents testing infrastructure for meanderaw-cli and meanderaw-web, covering vitest configuration, historical corpus test set, enumeration logic, characteristic measurement, database integration tests with testcontainers, and web rendering tests.
- [Testing Strategy Overview](overview.md) - High-level testing strategy: test targets (vitest:unit, vitest:integration, vitest:end-to-end), coverage gates, the testing-strategy skill, and CI test sharding. Explains persistence testing helpers (testcontainers Postgres) and MSW/GraphQL codegen for lexico-web.
