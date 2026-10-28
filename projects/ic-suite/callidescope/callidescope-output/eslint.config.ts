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
          // @codebase/observability: bundled into the library build output via Vite and inlined,
          // so it is a build-time devDependency rather than a runtime dependency.
          // @golevelup/ts-vitest: a devDependency used only in test files, which
          // are outside the build dependency check's scope.
          // pino, pino-pretty: runtime dependencies of the inlined @codebase/observability,
          // not imported directly in this package's TypeScript source.
          // @codebase/testing: a devDependency whose shared setup the project's
          // `testing/` folder imports, outside the build's scope.
          // reflect-metadata: the Nest decorators need it at runtime, but only
          // the shared test setup imports it now.
          // vitest: referenced via tsconfig "types" array; it's a devDependency and
          // the @nx/dependency-checks rule misidentifies it as a production dependency.
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
