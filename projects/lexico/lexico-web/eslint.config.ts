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
          ignoredDependencies: ["vite", "@vitejs/plugin-react", "lodash"],
          ignoredFiles: [
            "{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}",
            "{projectRoot}/testing/**",
            "{projectRoot}/vite.config.{js,ts,mjs,mts}",
            "{projectRoot}/vitest.config.{js,ts,mjs,mts}",
          ],
        },
      ],
    },
  },
];
