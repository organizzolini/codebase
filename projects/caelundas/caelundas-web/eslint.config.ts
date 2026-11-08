import baseConfig from "@codebase/configuration/eslint.config";

export default [
  // 🛠️ Base Config
  ...baseConfig,

  // 🚫 Project Ignores
  {
    ignores: ["codegen.ts", "src/graphql/generated/**", "src/routeTree.gen.ts"],
  },

  // 📦 Dependency Checks
  {
    files: ["**/*.json"],
    rules: {
      "@nx/dependency-checks": [
        "error",
        {
          ignoredFiles: [
            "{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}",
            "{projectRoot}/testing/**",
            "{projectRoot}/vite.config.{js,ts,mjs,mts}",
            "{projectRoot}/vitest.config.{js,ts,mjs,mts}",
          ],
          // Named only by `testing/`, which dependency checks skip.
          ignoredDependencies: ["@codebase/interface"],
        },
      ],
    },
  },
];
