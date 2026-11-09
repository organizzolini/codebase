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
          // @codebase/observability is bundled into the library by Vite, so it is a devDependency.
          // pino and pino-pretty back the inlined logger; pino-pretty is loaded by a runtime string.
          // vitest is named in tsconfig "types" and misread as a production dependency.
          ignoredDependencies: [
            "@codebase/observability",
            "pino",
            "pino-pretty",
            "vitest",
          ],
          ignoredFiles: ["{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}"],
        },
      ],
    },
  },
];
