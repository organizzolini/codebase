import baseConfig from "@codebase/configuration/eslint.config";

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
          ignoredDependencies: [
            "@codebase/testing",
            "@golevelup/ts-vitest",
            "reflect-metadata",
            "vitest",
          ],
          ignoredFiles: ["{projectRoot}/configuration/**"],
        },
      ],
    },
  },
];
