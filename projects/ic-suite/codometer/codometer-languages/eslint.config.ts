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
          // Dependencies static analysis cannot see as used:
          // @codebase/observability is bundled by Vite; pino and pino-pretty
          // (pretty-printing is named by a runtime string) are runtime only;
          // vitest and @golevelup/ts-vitest are test-only devDependencies.
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
