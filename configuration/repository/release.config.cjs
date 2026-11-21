/**
 * semantic-release configuration. Only `main` releases. It versions the root
 * codebase and commits the release artifacts; Nx release versions the ic-suite
 * packages. Bump rules are `releaseRules`; commit format is in
 * `.agents/skills/commit-code/SKILL.md`.
 * @see https://semantic-release.gitbook.io/semantic-release/usage/configuration
 */

module.exports = {
  branches: ["main"],
  plugins: [
    // Analyzes commits to determine the version bump type
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "conventionalcommits",
        releaseRules: [
          { breaking: true, release: "major" }, // BREAKING CHANGE or `!` suffix → major
          { revert: true, release: "patch" }, // Reverted commits → patch
          { type: "feat", release: "minor" }, // New features → minor
          { type: "fix", release: "patch" }, // Bug fixes → patch
          { type: "perf", release: "patch" }, // Performance improvements → patch
          { type: "docs", release: false }, // Documentation only → no release
          { type: "style", release: false }, // Formatting/whitespace → no release
          { type: "refactor", release: "patch" }, // Code restructuring → patch
          { type: "test", release: false }, // Test additions/changes → no release
          { type: "build", release: "patch" }, // Build system changes → patch
          { type: "ci", release: "patch" }, // CI/CD changes → patch
          { type: "chore", release: false }, // Housekeeping → no release
          { scope: "no-release", release: false }, // Escape hatch: any type with this scope → no release
        ],
      },
    ],

    // Generates release notes grouped by gitmoji-labeled sections
    [
      "@semantic-release/release-notes-generator",
      {
        preset: "conventionalcommits",
        presetConfig: {
          types: [
            { type: "feat", section: "✨ Features" }, // A new feature or capability that adds value for users
            { type: "fix", section: "🐛 Bug Fixes" }, // A bug fix that addresses a specific issue or problem
            { type: "perf", section: "⚡ Performance Improvements" }, // A code change that improves performance (caching, query optimization, etc.)
            { type: "revert", section: "⏪ Reverts" }, // Reverts a previous commit
            { type: "docs", section: "📝 Documentation", hidden: false }, // Documentation, AGENTS.md, SKILL.md, README, and planning files
            { type: "style", section: "💄 Styles", hidden: true }, // Formatting, whitespace, or code structure changes with no semantic effect
            { type: "refactor", section: "♻️ Code Refactoring" }, // Code restructuring that neither fixes a bug nor adds a feature
            { type: "test", section: "🧪 Tests", hidden: true }, // Adding or correcting unit, integration, or end-to-end tests
            { type: "build", section: "📦 Build System" }, // Build system, Vite/Docker/Helm config, or external dependency integration
            { type: "ci", section: "👷 CI/CD", hidden: true }, // GitHub Actions workflows, composite actions, and CI/CD scripts
            { type: "chore", section: "🔧 Chores", hidden: true }, // Housekeeping that doesn't modify src or test files (gitignore, editor config, etc.)
          ],
        },
      },
    ],

    // Writes release notes to CHANGELOG.md (auto-generated — never edit manually)
    [
      "@semantic-release/changelog",
      {
        changelogFile: "CHANGELOG.md",
        changelogTitle: `# Changelog\n\nAll notable changes to this project will be documented in this file. See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.`,
      },
    ],

    // Updates package.json version field without publishing to npm
    [
      "@semantic-release/npm",
      {
        npmPublish: false,
      },
    ],

    // Commits version-bumped files back to the repository
    [
      "@semantic-release/git",
      {
        // Markdown a report is spliced into rides along, since earlier steps regenerate it.
        // Publishing on a branch would make every pull request rewrite the same blocks; on main they are release artifacts.
        // The ic-suite versions and changelogs ride along too, so a release is one commit.
        assets: [
          "CHANGELOG.md",
          "README.md",
          "package.json",
          "pnpm-lock.yaml",
          "projects/*/AGENTS.md",
          "projects/*/README.md",
          // One glob per grouping folder, never `projects/*/*`: this plugin
          // adds assets with `git add --force`, and `projects/*/*/README.md`
          // also matches a gitignored `projects/<project>/dist/README.md`.
          "projects/caelundas/*/AGENTS.md",
          "projects/caelundas/*/README.md",
          "projects/lexico/*/AGENTS.md",
          "projects/lexico/*/README.md",
          "projects/meanderaw/*/AGENTS.md",
          "projects/meanderaw/*/README.md",
          "projects/ic-suite/*/*/CHANGELOG.md",
          "projects/ic-suite/*/*/package.json",
        ],
        message: "chore(release): 🔖 tag codebase ${nextRelease.version}",
      },
    ],

    // Creates a GitHub release with tag (comments/labels disabled to reduce noise)
    [
      "@semantic-release/github",
      {
        successComment: false, // Don't comment on issues/PRs included in the release
        failComment: false, // Don't open issues on release failure
        releasedLabels: false, // Don't add labels to released issues/PRs
      },
    ],
  ],
};
