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
          // @codebase/observability: bundled into the build output by Vite.
          // @golevelup/ts-vitest: test-only devDependency, outside this check's scope.
          // pino: imported by the bundled observability code. pino-pretty: loaded by string at runtime.
          // vitest: named in tsconfig "types"; misread as a production dependency.
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
