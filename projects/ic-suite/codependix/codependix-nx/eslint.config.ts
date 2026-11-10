import baseConfig from "../../../../configuration/eslint.config";

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
          // @codependix/cli: run as a child process.
          // @swc-node/register, @swc/core: the loader's runtime, named by string.
          // typescript: the loader's peer, declared so consumers install it.
          // @golevelup/ts-vitest: a devDependency used only in test files.
          // vitest: named in tsconfig "types"; this rule misreads it as a production dependency.
          ignoredDependencies: [
            "@codebase/testing",
            "@codependix/cli",
            "@golevelup/ts-vitest",
            "@swc-node/register",
            "@swc/core",
            "reflect-metadata",
            "typescript",
            "vitest",
          ],
          ignoredFiles: ["{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}"],
        },
      ],
    },
  },
];
