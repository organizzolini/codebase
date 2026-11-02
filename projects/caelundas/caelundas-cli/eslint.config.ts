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
          // @codebase/testing: a devDependency, imported by `testing/setup.ts`,
          // which the build dependency check counts as source.
          // moment: a devDependency, imported by one unit test, which the
          // build dependency check does not read.
          // vitest: a devDependency, imported by the harnesses in `testing/`,
          // which the build dependency check counts as source because they
          // are not `*.test.ts` themselves.
          ignoredDependencies: ["@codebase/testing", "moment", "vitest"],
          ignoredFiles: ["{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}"],
        },
      ],
    },
  },
];
