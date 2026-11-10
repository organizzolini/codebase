import baseConfig from "../../../../configuration/eslint.config";

export default [
  // 🛠️ Base Config
  ...baseConfig,

  // 🚫 Fixture Trees
  // Templates hold mustache where code belongs, and instances drift on purpose.
  // Ignored here, since flat-config patterns resolve against this file's directory.
  // Example configs stay linted, since readers copy them.
  {
    ignores: ["examples/*/instances/**", "examples/*/templates/**"],
  },

  // 📦 Dependency Checks
  {
    files: ["**/*.json"],
    rules: {
      "@nx/dependency-checks": [
        "error",
        {
          // vitest: named in tsconfig "types"; the rule misreads it as production.
          // @codebase/testing: test-only devDependency.
          // reflect-metadata: Nest decorators need it at runtime.
          ignoredDependencies: [
            "@codebase/testing",
            "reflect-metadata",
            "vitest",
          ],
          ignoredFiles: ["{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}"],
        },
      ],
    },
  },
];
