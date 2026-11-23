import baseConfig from "@codebase/configuration/eslint.config";

export default [
  // 🙈 Ignores
  { ignores: ["migrations/**"] },

  // 🛠️ Base Config
  ...baseConfig,

  // 📦 Dependency Checks
  {
    files: ["**/*.json"],
    rules: {
      "@nx/dependency-checks": [
        "error",
        {
          // Test-only packages and the runtime-loaded pg driver sit outside the build check.
          ignoredDependencies: [
            "@codebase/testing",
            "@golevelup/ts-vitest",
            "pg",
            "reflect-metadata",
            "vitest",
          ],
          ignoredFiles: ["{projectRoot}/configuration/**"],
        },
      ],
    },
  },
];
