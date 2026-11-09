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
          // @codebase/observability is inlined at build time, so it is a devDependency.
          // @golevelup/ts-vitest is used only by test files, outside this check's scope.
          // pino and pino-pretty are its runtime dependencies, never imported here.
          // vitest is named in tsconfig "types", so this rule misreads it as production.
          ignoredDependencies: [
            "@codebase/observability",
            "@golevelup/ts-vitest",
            "pino",
            "pino-pretty",
            "vitest",
          ],
          ignoredFiles: ["{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}"],
        },
      ],
    },
  },
];
