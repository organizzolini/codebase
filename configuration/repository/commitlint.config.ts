/**
 * Commitlint configuration — enforces Conventional Commits with Gitmoji support.
 *
 * Commit format: `<type>(<scope>): <gitmoji> <subject>`
 *
 * - Header max: 128 characters (aim for &lt;72 for readability)
 * - Body: forbidden unless every line is a `Co-authored-by:` or `Claude-Session:`
 *   trailer, in any casing, or (in a `chore(release)` commit) an Nx release
 *   project line
 * - Footer: forbidden unless every line is a `Co-authored-by:` or
 *   `Claude-Session:` trailer, in any casing
 * - Subject: lowercase, imperative mood, no trailing period
 * - Gitmoji required at start of subject
 *
 * Types and scopes are defined in conventional.config.cjs.
 * See: .agents/skills/commit-code/SKILL.md for full documentation.
 */
import { scopes, types } from "./conventional.config.cjs";

import type { Plugin, Rule, RuleOutcome, UserConfig } from "@commitlint/types";

/** Trailer line `nx release version` adds per bumped project. */
const NX_RELEASE_PROJECT_LINE =
  /^- project: [\w.@/-]+ \d+\.\d+\.\d+(?:-[\da-z.-]+)?$/i;

/** Attribution trailer: `Co-authored-by`, or the `Claude-Session` link. */
const ATTRIBUTION_TRAILER = /^(?:Co-authored-by|Claude-Session): \S+/i;

/** Non-empty body lines must all be trailers, matched case-insensitively. */
const bodyCoAuthoredOnly: Rule = (parsed): RuleOutcome => {
  const body: null | string = parsed.body;
  if (!body) return [true];
  const isReleaseCommit =
    parsed["type"] === "chore" && parsed["scope"] === "release";
  const lines = body.split("\n").filter((line: string) => line.trim() !== "");
  const allAllowed = lines.every(
    (line: string) =>
      ATTRIBUTION_TRAILER.test(line) ||
      (isReleaseCommit && NX_RELEASE_PROJECT_LINE.test(line)),
  );
  return [
    allAllowed,
    "Body must be empty or contain only Co-authored-by or Claude-Session trailers (or, in a chore(release) commit, Nx release project lines)",
  ];
};

/** Non-empty footer lines must all be trailers, matched case-insensitively. */
const footerCoAuthoredOnly: Rule = (parsed): RuleOutcome => {
  const footer: null | string = parsed.footer;
  if (!footer) return [true];
  const lines = footer.split("\n").filter((line: string) => line.trim() !== "");
  const allCoAuthored = lines.every((line: string) =>
    ATTRIBUTION_TRAILER.test(line),
  );
  return [
    allCoAuthored,
    "Footer must be empty or contain only Co-authored-by or Claude-Session trailers",
  ];
};

const coAuthoredPlugin: Plugin = {
  rules: {
    "body-co-authored-only": bodyCoAuthoredOnly,
    "footer-co-authored-only": footerCoAuthoredOnly,
  },
};

const configuration: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  plugins: [
    "commitlint-plugin-gitmoji",
    "commitlint-plugin-tense",
    coAuthoredPlugin,
  ],
  rules: {
    // ❗ Breaking change
    "subject-exclamation-mark": [0],

    // 😀 Enforce gitmoji at start of commit message
    "start-with-gitmoji": [2, "always"],

    // 💬 Enforce grammatical tense
    "tense/subject-tense": [
      2,
      "always",
      { allowedTenses: ["present-imperative"] },
    ],

    // 🏷️ Enforce enums
    "scope-enum": [2, "always", scopes.map((scope) => scope.name)],
    "type-enum": [2, "always", types.map((type) => type.name)],

    // 🎯 Require a scope, so scope-enum always has something to check
    "scope-empty": [2, "never"],

    // 📏 Limit lengths
    "header-max-length": [2, "always", 128],

    // 🚫 Forbid arbitrary body/footer content; allow only Co-authored-by and Claude-Session trailers
    // (and Nx's per-project lines in a release commit)
    "body-co-authored-only": [2, "always"],
    "footer-co-authored-only": [2, "always"],

    // 🔡 Enforce case
    "scope-case": [2, "always", "lower-case"],
    "subject-case": [2, "always", "lower-case"],
    "type-case": [2, "always", "lower-case"],

    // 🎨 Format rules
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
  },
};

export default configuration;
