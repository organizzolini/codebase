import {
  CODOMETER_COMMENT_LANGUAGES,
  CODOMETER_SYMBOL_KINDS,
  type CodometerConfiguration,
  type CodometerCustomStatistic,
} from "@codometer/configuration";

// ♟️ Conventions

/**
 * Name of the target holding a project's compiled JavaScript; the pull request
 * report joins targets across branches by this name.
 */
const COMPILED_TARGET_NAME = "Compiled JavaScript";

// 💬 Comment Budgets

/**
 * Each comment-budget counter's display label by language, such as "TypeScript
 * Comment Budget"; the limit below reads its metric path from it.
 */
const COMMENT_LANGUAGE_LABELS = {
  css: "CSS",
  hcl: "HCL",
  python: "Python",
  shell: "Shell",
  sql: "SQL",
  toml: "TOML",
  typescript: "TypeScript",
  yaml: "YAML",
} as const satisfies Record<
  (typeof CODOMETER_COMMENT_LANGUAGES)[number],
  string
>;

/** Words a plain comment block may hold: one short paragraph. */
const PLAIN_COMMENT_MAXIMUM_WORDS = 48;

/** Lines a plain comment block may span. */
const PLAIN_COMMENT_MAXIMUM_LINES = 8;

/**
 * One budget per language, since `comment` selectors carry no inheritance.
 * Capped per block by words and lines, never characters.
 */
const generalCommentBudgets: CodometerCustomStatistic[] =
  CODOMETER_COMMENT_LANGUAGES.filter((language) => language !== "shell").map(
    (language) => ({
      comment: {
        language,
        maximumLines: PLAIN_COMMENT_MAXIMUM_LINES,
        maximumWords: PLAIN_COMMENT_MAXIMUM_WORDS,
      },
      label: `${COMMENT_LANGUAGE_LABELS[language]} Comment Budget`,
    }),
  );

/** Words a class's or file header's JSDoc may hold: the one place a role is explained. */
const ROLE_JSDOC_MAXIMUM_WORDS = 64;

/** Lines a class's or file header's JSDoc may span, delimiters included. */
const ROLE_JSDOC_MAXIMUM_LINES = 14;

/** Words any other declaration's JSDoc may hold: what it is, and why. */
const DECLARATION_JSDOC_MAXIMUM_WORDS = 24;

/** Lines any other declaration's JSDoc may span, delimiters included. */
const DECLARATION_JSDOC_MAXIMUM_LINES = 8;

/** The kinds whose JSDoc says what a whole module is for. */
const ROLE_JSDOC_KINDS: readonly string[] = ["class", "file"];

/**
 * One JSDoc budget per declaration kind. Classes and file headers, which say
 * what a module is for, get the larger one.
 */
const jsdocBudgets: CodometerCustomStatistic[] = CODOMETER_SYMBOL_KINDS.map(
  (kind) => {
    const isRole = ROLE_JSDOC_KINDS.includes(kind);

    return {
      comment: {
        kind,
        maximumLines: isRole
          ? ROLE_JSDOC_MAXIMUM_LINES
          : DECLARATION_JSDOC_MAXIMUM_LINES,
        maximumWords: isRole
          ? ROLE_JSDOC_MAXIMUM_WORDS
          : DECLARATION_JSDOC_MAXIMUM_WORDS,
      },
      label: `${kind[0]?.toUpperCase() ?? ""}${kind.slice(1)} JSDoc Budget`,
    };
  },
);

/**
 * Shell is looser: a script's header documents usage and order in one block,
 * so 256 words still catches real sprawl.
 */
const shellCommentBudget: CodometerCustomStatistic = {
  comment: { language: "shell", maximumWords: 256 },
  label: `${COMMENT_LANGUAGE_LABELS.shell} Comment Budget`,
};

/** Every comment-budget counter declared above, in the order they render. */
const commentBudgets: CodometerCustomStatistic[] = [
  ...generalCommentBudgets,
  shellCommentBudget,
  ...jsdocBudgets,
];

/** Every custom statistic's own label, in declaration order. */
function selectAllLabels(
  statistics: readonly CodometerCustomStatistic[],
): string[] {
  return statistics.map((statistic) => statistic.label);
}

// 🧱 Shared Configuration

/**
 * The counters every project's measurement shares: file-suffix counters
 * showing what the TypeScript total is made of, then the comment budgets.
 */
const customStatistics: CodometerCustomStatistic[] = [
  { label: "Module Files", patterns: ["**/*.module.ts"] },
  { label: "Service Files", patterns: ["**/*.service.ts"] },
  { label: "Command Files", patterns: ["**/*.command.ts"] },
  { label: "Constants Files", patterns: ["**/*.constants.ts"] },
  { label: "Types Files", patterns: ["**/*.types.ts"] },
  { label: "Utilities Files", patterns: ["**/*.utilities.ts"] },
  { label: "TypeORM Entities", patterns: ["**/*.entity.ts"] },
  { label: "Unit Tests", patterns: ["**/*.unit.test.ts"] },
  { label: "Integration Tests", patterns: ["**/*.integration.test.ts"] },
  { label: "End To End Tests", patterns: ["**/*.end-to-end.test.ts"] },
  // Not a file-name counter but a symbol one, and rendered beside the
  // built-in TypeScript counters rather than under Conventions. Every
  // service here is an injected singleton, so a static method appearing
  // anywhere is worth seeing in the report.
  {
    color: "166534",
    group: "typescript",
    label: "Static Methods",
    symbols: { kinds: ["method"], modifiers: ["static"] },
  },
  ...commentBudgets,
];

/**
 * Each comment-budget counter's `custom.<label>` limit is zero breaching
 * blocks; a counter with no limit only counts. Derived from `commentBudgets`.
 */
const commentBudgetLimits: CodometerConfiguration["limits"] =
  commentBudgets.map((statistic) => ({
    metric: `custom.${statistic.label}`,
    value: 0,
  }));

/**
 * What every measurement shares, spread by each project; `format` is set here.
 * A named export, since the loader reads only default exports.
 */
export const codometerConfiguration = {
  // Measures every counter declared above, regardless of which output below
  // selects it — an output's own `custom` only picks labels back out of this.
  custom: customStatistics,
  // Target an unqualified limit's metric path belongs to, so the comment
  // budgets below can be written as `custom.<label>` rather than
  // `codebase.custom.<label>`.
  defaultInput: "codebase",
  format: "markdown",
  // A comment budget declared and never limited is a counter, not a cap.
  limits: commentBudgetLimits,
  // Where each project leaves the report the pull request's Codometer section reads.
  //
  // The `markdown` entry is what `codometer:write` splices into each project's README.
  // Every output selects every `custom` label, so without this entry README badges would drop
  // the counters `json` still reports.
  outputs: [
    {
      custom: selectAllLabels(customStatistics),
      path: "codometer-report.json",
      type: "json",
    },
    {
      custom: selectAllLabels(customStatistics),
      path: "README.md",
      type: "markdown",
    },
  ],
  // Python lives in a uv workspace, so the interpreter is reached through uv
  // rather than being on PATH.
  python: { command: "uv run python" },
} satisfies CodometerConfiguration;

// 🎯 Targets

/**
 * What a compiled-output input holds except its files, which each project
 * supplies as its `dist/` glob. A project emitting nothing declares none.
 */
export const compiledJavaScriptTarget = {
  analyses: ["size"],
  compression: "gzip",
  name: COMPILED_TARGET_NAME,
} satisfies Omit<
  NonNullable<CodometerConfiguration["inputs"]>[number],
  "include"
>;

// 🏛️ Workspace

/**
 * What a whole-repository run measures: the default export, with no input of
 * its own; projects measure their own builds.
 */
const workspaceConfiguration = {
  ...codometerConfiguration,
  // What this repository does not measure lives in an ignore file, the way
  // every other tool here keeps its exclusions. Files `.gitignore` covers are
  // already absent — discovery reads those files itself — so the ignore file
  // only has to name what is committed but generated.
  excludeFrom: ["configuration/.codometerignore"],
  // Replaces the shared destination rather than adding to it: the repository
  // writes badges and its report for pull request change diffs. The same
  // counters as the shared JSON output, so the README badges keep reporting
  // what they always have.
  outputs: [
    {
      custom: selectAllLabels(customStatistics),
      path: "codometer-report.json",
      type: "json",
    },
    {
      custom: selectAllLabels(customStatistics),
      description:
        "Repository statistics measured by [codometer](projects/ic-suite/codometer/codometer-cli), regenerated by `nx run configuration:codometer`.",
      path: "README.md",
      type: "markdown",
    },
  ],
} satisfies CodometerConfiguration;

/**
 * What codometer resolves for the repository itself, and for any folder here
 * that is not a project — `configuration/`, `scripts/` — which then gets the
 * exclusions and README destination that belong to the repository alone. A
 * project declares its own `codometer.config.ts` and spreads the named
 * `codometerConfiguration` export above instead, the same way each project's
 * `eslint.config.ts` spreads the base config beside this file.
 *
 * @see [`projects/ic-suite/codometer/codometer-examples/README.md`](../ic-suite/codometer/codometer-examples/README.md)
 * for the guided tour, and
 * [`projects/ic-suite/codometer/codometer-examples/AGENTS.md`](../ic-suite/codometer/codometer-examples/AGENTS.md)
 * for the message-to-example lookup table.
 */
export default workspaceConfiguration;
