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
          // @codebase/interface and @graphql-codegen/cli: read only by
          // configuration/codegen.ts, which the `codegen` target runs.
          ignoredDependencies: [
            "vite",
            "@vitejs/plugin-react",
            "lodash",
            "@codebase/interface",
            "@graphql-codegen/cli",
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
