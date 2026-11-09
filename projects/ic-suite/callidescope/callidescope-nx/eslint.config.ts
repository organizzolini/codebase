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
          // Build-time or test-only, not production: @codebase/observability (inlined by Vite),
          // @golevelup/ts-vitest, and vitest (named in tsconfig "types"). pino and pino-pretty
          // are runtime dependencies of the inlined observability package. typescript is a peer,
          // declared for consumers.
          ignoredDependencies: [
            "@codebase/observability",
            "@golevelup/ts-vitest",
            "pino",
            "pino-pretty",
            "typescript",
            "vitest",
          ],
          ignoredFiles: ["{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}"],
        },
      ],
    },
  },
];
