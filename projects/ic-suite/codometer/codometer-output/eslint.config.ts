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
          // @codebase/observability: bundled into the library by Vite, a build-time devDependency.
          // @golevelup/ts-vitest: a devDependency used only by test files.
          // pino: runtime dependency of the inlined logger.
          // pino-pretty: loaded by runtime string in LoggerService, invisible to static analysis.
          // vitest: named in tsconfig "types"; the rule misreads it as production.
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
