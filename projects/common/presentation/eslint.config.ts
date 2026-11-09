import baseConfig from "../../../configuration/eslint.config";

export default [
  // 🛠️ Base Config
  ...baseConfig,

  // 🚫 Project Ignores
  // Exclude shadcn/ui generated components (auto-generated, not hand-authored)
  {
    ignores: ["src/components/**", "src/lib/**", "src/hooks/**"],
  },

  // 🧭 Self-referential path alias
  // The base config forbids aliases back into a project's own directory, but
  // `components.json` declares `@/components`, `@/hooks`, and `@/lib`, and the
  // shadcn CLI emits `@/` imports on every add. Relative paths would be undone.
  {
    files: ["tsconfig.json"],
    rules: {
      "no-restricted-syntax": "off",
    },
  },

  // 📦 Dependency Checks
  {
    files: ["**/*.json"],
    rules: {
      "@nx/dependency-checks": [
        "error",
        {
          ignoredDependencies: [
            "vite",
            "@vitejs/plugin-react",
            "vite-plugin-dts",
          ],
          ignoredFiles: [
            "{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}",
            "{projectRoot}/vite.config.{js,ts,mjs,mts}",
          ],
        },
      ],
    },
  },
];
