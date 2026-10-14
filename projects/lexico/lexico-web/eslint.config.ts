import baseConfig from "../../../configuration/eslint.config";

export default [
  // 🛠️ Base Config
  ...baseConfig,

  // 🚫 Project Ignores
  {
    ignores: ["src/routes/routeTree.gen.ts"],
  },

  // ⚛️ React Component Complexity Overrides
  // Components naturally have more JSX branches, state, and conditional rendering
  // than plain functions — allow 2× the base limits for TSX files.
  {
    files: ["**/*.tsx"],
    rules: {
      complexity: ["warn", { max: 16 }],
      "max-depth": ["warn", { max: 8 }],
      "max-lines-per-function": [
        "warn",
        { max: 128, skipBlankLines: true, skipComments: true },
      ],
      "max-statements": ["warn", { max: 32 }],
    },
  },
  // �📦 Dependency Checks
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
          ],
        },
      ],
    },
  },
];
