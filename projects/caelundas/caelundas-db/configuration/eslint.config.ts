import baseConfig from "@codebase/configuration/eslint.config";

export default [
  // 🛠️ Base Config
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
          // @golevelup/ts-vitest: a devDependency used only in test files, which
          // are outside the build dependency check's scope.
          // vitest: referenced via tsconfig "types" array; it's a devDependency and
          // the @nx/dependency-checks rule misidentifies it as a production dependency.
          // pg: the driver TypeORM loads by name for its Postgres connection.
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
