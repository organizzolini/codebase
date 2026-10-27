import baseConfig from "../../../../configuration/eslint.config";

export default [
  // 🛠️ Base Config
  ...baseConfig,

  // 📚 Fixture Projects
  // Everything under `examples/` is measured input rather than authored
  // source: each fixture exists so coinagerie has words to collect, several
  // are deliberately shaped the way this repository's conventions are not (an
  // unparsable glossary, a configuration that throws, an undefined `fold`),
  // and the comments and strings inside them exist to be skipped. Linting them
  // would either force the fixtures to stop demonstrating what they
  // demonstrate or bury them under suppression comments, which is the one
  // thing this repository never does. Scoped out here, once.
  {
    ignores: ["examples/**"],
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
