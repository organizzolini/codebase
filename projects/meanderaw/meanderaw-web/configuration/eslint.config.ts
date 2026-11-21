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
          // @graphql-codegen/cli: read only by configuration/codegen.ts, which
          // the `codegen` target runs. The others are named only by `testing/`,
          // which dependency checks skip.
          ignoredDependencies: [
            "@codebase/interface",
            "@graphql-codegen/cli",
            "msw",
          ],
          ignoredFiles: [
            "{projectRoot}/configuration/**",
            "{projectRoot}/testing/**",
          ],
        },
      ],
    },
  },
];
