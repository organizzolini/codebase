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
          // @codebase/observability: bundled directly into the build output via the Vite library build.
          // @golevelup/ts-vitest: a devDependency used only in test files, which
          // are outside the build dependency check's scope.
          // pino: runtime dependency imported by the inlined @codebase/observability bundle.
          // pino-pretty: runtime transport reached only via runtime string in pino configuration.
          // vitest: referenced via tsconfig "types" array; it's a devDependency and
          // the @nx/dependency-checks rule misidentifies it as a production dependency.
          // @codebase/testing: a devDependency whose shared setup the project's
          // `testing/` folder imports, outside the build's scope.
          // reflect-metadata: the Nest decorators need it at runtime, but only
          // the shared test setup imports it now.
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
