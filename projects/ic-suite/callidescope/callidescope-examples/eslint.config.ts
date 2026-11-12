import baseConfig from "../../../../configuration/eslint.config";

export default [
  // 🛠️ Base Config
  ...baseConfig,

  // 🔭 The committed reports
  // Callidescope writes these and reads them back byte for byte, so their key order must stay the emitter's.
  // Sorting them would make `examples:write` put them back and leave `examples` stale.
  {
    files: ["output/*.json"],
    rules: {
      "jsonc/sort-keys": "off",
    },
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
];
