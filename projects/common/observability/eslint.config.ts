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
          // eslint: imported only by a rule file the build excludes, so it
          // stays a devDependency. pino-pretty: a string transport target.
          // vitest: named in tsconfig "types", which the rule misreads.
          ignoredDependencies: [
            "@golevelup/ts-vitest",
            "eslint",
            "pino-pretty",
            "vitest",
          ],
          ignoredFiles: ["{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}"],
        },
      ],
    },
  },
];
