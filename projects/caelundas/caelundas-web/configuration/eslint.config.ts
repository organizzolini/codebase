import baseConfig from "@codebase/configuration/eslint.config";

export default [
  // 🛠️ Base Config
  ...baseConfig,

  // 🚫 Project Ignores
  {
    ignores: [
      "configuration/codegen.ts",
      "src/graphql/generated/**",
      "src/routeTree.gen.ts",
    ],
  },

  // 📦 Dependency Checks
  {
    files: ["**/*.json"],
    rules: {
      "@nx/dependency-checks": [
        "error",
        {
          ignoredFiles: [
            "{projectRoot}/configuration/**",
            "{projectRoot}/testing/**",
          ],
          // Named only by `testing/`, which dependency checks skip.
          // @graphql-codegen/cli: read only by configuration/codegen.ts, which
          // the `codegen` target runs.
          ignoredDependencies: ["@codebase/interface", "@graphql-codegen/cli"],
        },
      ],
    },
  },
];
