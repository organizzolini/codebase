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
            "@as-integrations/express5",
            "@golevelup/ts-vitest",
            "graphql",
            "typeorm",
            "vitest",
          ],
          ignoredFiles: ["{projectRoot}/configuration/**"],
        },
      ],
    },
  },
];
