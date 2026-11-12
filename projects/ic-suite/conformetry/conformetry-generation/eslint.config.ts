import baseConfig from "../../../../configuration/eslint.config";

export default [
  {
    ignores: ["src/index.d.ts"],
  },

  // 🛠️ Base Config
  ...baseConfig,

  // 📦 Dependency Checks
  {
    files: ["**/*.json"],
    rules: {
      "@nx/dependency-checks": [
        "error",
        {
          // @golevelup/ts-vitest: test-only devDependency.
          // vitest: named in tsconfig "types"; the rule misreads it as production.
          // @codebase/testing: test-only devDependency.
          // reflect-metadata: Nest decorators need it at runtime.
          ignoredDependencies: [
            "@codebase/testing",
            "@golevelup/ts-vitest",
            "reflect-metadata",
            "vitest",
          ],
          ignoredFiles: ["{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}"],
        },
      ],
    },
  },
];
