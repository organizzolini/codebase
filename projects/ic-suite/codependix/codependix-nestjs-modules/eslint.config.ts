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
          // @codebase/observability: inlined into the bundled output.
          // @golevelup/ts-vitest: a devDependency used only in test files.
          // pino, pino-pretty: runtime dependencies of the inlined observability package;
          // pino-pretty is loaded by runtime string.
          // vitest: named in tsconfig "types"; this rule misreads it as a production dependency.
          ignoredDependencies: [
            "@codebase/observability",
            "@codebase/testing",
            "@golevelup/ts-vitest",
            "pino",
            "pino-pretty",
            "reflect-metadata",
            "vitest",
          ],
          ignoredFiles: ["{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}"],
        },
      ],
    },
  },

  // 🚧 Nx Containment
  {
    files: ["**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              // Only `@codependix/nx-projects` owns Nx. Everything another package
              // wants is already on `NxProject`, and a whole graph travels as
              // the opaque `NxProjectGraph` — reaching for `@nx/devkit` here
              // is how tag reading leaked into four packages before.
              message:
                "Import NxProject or NxProjectGraph from @codependix/nx-projects instead — only @codependix/nx-projects may depend on Nx.",
              name: "@nx/devkit",
            },
          ],
        },
      ],
    },
  },
];
