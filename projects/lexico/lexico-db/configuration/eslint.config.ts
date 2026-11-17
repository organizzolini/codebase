import baseConfig from "../../../../configuration/eslint.config";

export default [
  // �️ Base Config
  ...baseConfig,

  // 🙈 Ignores
  { ignores: ["migrations/**"] },

  // 📦 Dependency Checks
  {
    files: ["**/*.json"],
    rules: {
      "@nx/dependency-checks": [
        "error",
        {
          // vitest: used only by tests and the configuration folder's Vitest
          // configuration, both outside the build dependency check's scope.
          ignoredDependencies: ["typescript", "pg", "@nestjs/core", "vitest"],
          ignoredFiles: ["{projectRoot}/configuration/**"],
        },
      ],
    },
  },
];
