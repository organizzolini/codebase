/**
 * Shared conventional commit configuration
 *
 * This file is the single source of truth for types, scopes, and emoji mappings used across:
 * - commitlint.config.ts (commit message validation)
 * - validate-branch-name.config.js (branch name validation)
 * - release.config.cjs (release rules and changelog sections)
 * - .vscode/settings.json (scope autocomplete)
 * - .agents/skills/commit-code/SKILL.md (reference tables)
 *
 * When adding/removing types, scopes, or emojis, update this file only.
 * Run `nx run synchronization:conventional-config:write` to propagate changes.
 */

/**
 * Canonical gitmoji — one emoji per commit type.
 * Each entry is the source of truth for the type key, its description, and its canonical emoji.
 * See https://gitmoji.dev for the full list of available emojis.
 */
const types = [
  {
    code: ":sparkles:",
    description: "A new feature or capability that adds value for users",
    emoji: "✨",
    name: "feat",
  },
  {
    code: ":bug:",
    description: "A bug fix that addresses a specific issue or problem",
    emoji: "🐛",
    name: "fix",
  },
  {
    code: ":memo:",
    description:
      "Documentation, AGENTS.md, SKILL.md, README, and planning files",
    emoji: "📝",
    name: "docs",
  },
  {
    code: ":test_tube:",
    description: "Adding or correcting unit, integration, or end-to-end tests",
    emoji: "🧪",
    name: "test",
  },
  {
    code: ":recycle:",
    description:
      "Code restructuring that neither fixes a bug nor adds a feature",
    emoji: "♻️",
    name: "refactor",
  },
  {
    code: ":art:",
    description:
      "Formatting, whitespace, or code structure changes with no semantic effect",
    emoji: "🎨",
    name: "style",
  },
  {
    code: ":zap:",
    description:
      "A code change that improves performance (caching, query optimization, etc.)",
    emoji: "⚡️",
    name: "perf",
  },
  {
    code: ":wrench:",
    description:
      "Housekeeping that doesn't modify src or test files (gitignore, editor config, etc.)",
    emoji: "🔧",
    name: "chore",
  },
  {
    code: ":construction_worker:",
    description:
      "GitHub Actions workflows, composite actions, and CI/CD scripts",
    emoji: "👷",
    name: "ci",
  },
  {
    code: ":package:",
    description:
      "Build system, Vite/Docker/Helm config, or external dependency integration",
    emoji: "📦️",
    name: "build",
  },
  {
    code: ":rewind:",
    description: "Reverts a previous commit",
    emoji: "⏪️",
    name: "revert",
  },
];

const scopes = [
  {
    description: "Code measurement and validation toolchains and their shared conventions",
    name: "ic-suite",
  },
  {
    description:
      "Python Jupyter notebook application for LangGraph affirmation generation",
    name: "affirmancy",
  },
  {
    description:
      "Node.js CLI for astronomical calendar generation (NASA JPL ephemeris)",
    name: "caelundas",
  },
  {
    description:
      "Workspace root config files (tsconfig, eslint, vitest, nx.json, etc.)",
    name: "configuration",
  },
  {
    description:
      "GitHub issue and pull request metadata, repository governance, and external resource policies",
    name: "compliance",
  },
  {
    description:
      "Code generator templates and validation tests for generated instances",
    name: "conformetry",
  },
  {
    description:
      "Shared Postgres package: environment, TypeORM module, base entities, test harness, and migrations",
    name: "persistence",
  },
  {
    description:
      "Shared GraphQL package: Relay helpers, entity-to-object types, client codegen, and test helpers",
    name: "interface",
  },
  {
    description:
      "Dependency version changes (upgrades, additions, removals via pnpm)",
    name: "dependencies",
  },
  {
    description:
      "Deployment CLI: the CI release steps and the publishable-packages gate",
    name: "deployment",
  },
  {
    description: "GitHub Actions workflows and CI/CD pipeline configuration",
    name: "deployments",
  },
  {
    description: "Markdown docs, skills, planning files, and AGENTS.md files",
    name: "documentation",
  },
  {
    description: "Helm charts, Terraform configs, and Kubernetes resources",
    name: "infrastructure",
  },
  {
    description: "Developer-machine setup: environment files, dependencies, shell config, software",
    name: "installation",
  },
  {
    description: "CI plumbing: steps around a CI job (affected run, Nx task-cache database)",
    name: "integration",
  },
  {
    description: "Static GitHub profile README project (markdown and assets)",
    name: "JimmyPaolini",
  },
  {
    description:
      "TanStack Start SSR Latin dictionary web app",
    name: "lexico",
  },
  {
    description: "Shared React/shadcn component library",
    name: "presentation",
  },
  {
    description: "Shared TypeORM entities and GraphQL types",
    name: "lexico-db",
  },
  {
    description: "Data ingestion scripts for Lexico",
    name: "lexico-cli",
  },
  {
    description:
      "Greek meander (key/fret) SVG generator CLI and the composable motif/modifier library it reads",
    name: "meanderaw",
  },
  {
    description: "Lexical gap discovery CLI for English morphological and phonotactic gaps",
    name: "sempientor",
  },
  {
    description: "Call stack tracing and linting CLI and its configuration and rendering packages",
    name: "callidescope",
  },
  {
    description: "Dependency graph export CLI and its configuration and boundary-checking packages",
    name: "codependix",
  },
  {
    description: "Code statistics measurement CLI and its configuration, diff, and rendering packages",
    name: "codometer",
  },
  {
    description:
      "Codebase vocabulary CLI that lists the words a codebase uses and keeps a glossary of them in step with the code",
    name: "coinagerie",
  },
  {
    description: "Escape hatch: suppress semantic-release for any commit type",
    name: "no-release",
  },
  {
    description:
      "Version bumps and release commits generated by semantic-release",
    name: "release",
  },
  {
    description:
      "Pull request change report generation and the packages that diff and render it",
    name: "reporting",
  },
  {
    description:
      "Shell and TypeScript scripts in scripts/ (sync, setup, utilities)",
    name: "scripts",
  },
  {
    description:
      "Vitest configuration, shared test utilities, and coverage setup",
    name: "testing",
  },
  {
    description:
      "Commands that reconcile codebase files and generated repository configuration",
    name: "synchronization",
  },
  {
    description:
      "Checks and gates for codebase and project invariants",
    name: "validation",
  },
];

module.exports = { scopes, types };
