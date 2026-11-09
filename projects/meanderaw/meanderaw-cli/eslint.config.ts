import baseConfig from "../../../configuration/eslint.config";

export default [
  // 🛠️ Base Config
  ...baseConfig,

  // 🙈 Draw Run Output
  // The draw run's index and pattern pages: gitignored, and gigabytes at the
  // default edge budget, past the 2 GiB one file read can hold. The base
  // config's root-relative ignore cannot match them from this project directory.
  { ignores: ["output/**"] },

  // 📦 Dependency Checks
  {
    files: ["**/*.json"],
    rules: {
      "@nx/dependency-checks": [
        "error",
        {
          // pg: TypeORM resolves its driver by name at runtime, so nothing imports it.
          // vitest: a devDependency imported by the harnesses in `testing/`, which the
          // build check counts as source.
          ignoredDependencies: ["pg", "vitest"],
          ignoredFiles: ["{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}"],
        },
      ],
    },
  },
];
