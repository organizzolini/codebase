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
          // @codebase/observability: bundled into the build by Vite.
          // @golevelup/ts-vitest: test-only devDependency.
          // pino: runtime dependency of the bundled observability.
          // pino-pretty: runtime transport, named only in configuration.
          // vitest: named in tsconfig "types"; the rule misreads it as production.
          // @codebase/testing: test-only devDependency.
          // reflect-metadata: Nest decorators need it at runtime.
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
