import baseConfig from "../../../../configuration/eslint.config";

export default [
  // 🛠️ Base Config
  ...baseConfig,

  // 📦 Dependency Checks
  {
    files: ["**/*.json"],
    rules: {
      "@nx/dependency-checks": [
        "error",
        {
          // Ignored as build-time or test-only: pino rides inside observability, which Vite
          // inlines; testing and ts-vitest serve tests; reflect-metadata is needed at runtime,
          // yet only the test setup imports it; vitest is referenced via tsconfig "types",
          // which the rule misreads as production use.
          ignoredDependencies: [
            "@codebase/observability",
            "@codebase/testing",
            "@golevelup/ts-vitest",
            "pino",
            "pino-pretty",
            "reflect-metadata",
            "vitest",
          ],
          ignoredFiles: ["{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}"],
        },
      ],
    },
  },
];
