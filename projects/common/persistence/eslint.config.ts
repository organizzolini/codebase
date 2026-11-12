import baseConfig from "../../../configuration/eslint.config";

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
          // @golevelup/ts-vitest: devDependency used only by test files.
          // pg: TypeORM's driver, resolved by name at runtime, so nothing imports it.
          // vitest: named in tsconfig "types", which the rule misreads.
          ignoredDependencies: ["@golevelup/ts-vitest", "pg", "vitest"],
          ignoredFiles: ["{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}"],
        },
      ],
    },
  },
];
