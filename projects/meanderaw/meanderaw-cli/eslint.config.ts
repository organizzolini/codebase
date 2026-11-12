import baseConfig from "../../../configuration/eslint.config";

export default [
  // 🛠️ Base Config
  ...baseConfig,

  // 🙈 Draw Run Output
  // Gitignored draw pages, gigabytes at the default edge budget. The base
  // config's root-relative ignore cannot match them from the project directory.
  { ignores: ["output/**"] },

  // 📦 Dependency Checks
  {
    files: ["**/*.json"],
    rules: {
      "@nx/dependency-checks": [
        "error",
        {
          // pg: TypeORM resolves its driver by name at runtime, so nothing imports it.
          // Test devDependencies: `testing/` harnesses count as source to the build check.
          ignoredDependencies: ["@codebase/testing", "pg", "vitest"],
          ignoredFiles: ["{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}"],
        },
      ],
    },
  },
];
