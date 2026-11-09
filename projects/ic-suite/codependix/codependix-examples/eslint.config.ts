import baseConfig from "../../../../configuration/eslint.config";

export default [
  // 🛠️ Base Config
  ...baseConfig,

  // 🧪 Example subjects
  // Subjects are the input being graphed, not authored code: intentionally broken tsconfigs, throwing
  // modules, self-referential aliases, and `require` calls. Linting them would force them to stop
  // demonstrating their behavior, so they are excluded rather than suppressed.

  // The pattern draws the line: one level under `examples/` is the rendered guide, which stays linted;
  // two levels down is the subject. That is why the committed graph JSON keeps its `jsonc/sort-array-values` carve-out.
  {
    ignores: ["examples/*/*/**"],
  },

  // 📦 Dependency Checks
  {
    files: ["**/*.json"],
    rules: {
      "@nx/dependency-checks": [
        "error",
        {
          // vitest: referenced via tsconfig "types" array; it's a devDependency and
          // the @nx/dependency-checks rule misidentifies it as a production dependency.
          ignoredDependencies: ["vitest"],
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
