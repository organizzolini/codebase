import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { readExample } from "../testing/examples";
import { createFixtureTree, removeFixtureTree } from "../testing/fixture-tree";
import { run, SPAWN_TIMEOUT } from "../testing/run-command";

import { environmentSchema } from "./coinagerie-cli.constants";

const START = "<!-- coinagerie:start -->";

/** The words of the `zero-config` example, one file per language. */
const POLYGLOT_WORDS = [
  "angle",
  "book",
  "cloud",
  "color",
  "config",
  "cover",
  "datum",
  "def",
  "degree",
  "dome",
  "elevation",
  "from",
  "header",
  "infrastructure",
  "lead",
  "length",
  "limit",
  "location",
  "log",
  "magnitude",
  "max",
  "meter",
  "mirror",
  "motor",
  "name",
  "night",
  "note",
  "observer",
  "panel",
  "park",
  "primary",
  "red",
  "reserve",
  "resource",
  "return",
  "roster",
  "rotate",
  "script",
  "select",
  "service",
  "site",
  "slot",
  "speed",
  "sql",
  "src",
  "star",
  "state",
  "style",
  "target",
  "telescope",
];

/** Runs `coinagerie --config <name>.config.ts <flags>` over the `check-failures` example. */
function runCheckFailure(
  root: string,
  name: string,
  ...flags: string[]
): ReturnType<typeof run> {
  return run(root, ["--config", `${name}.config.ts`, ...flags]);
}

describe("main end-to-end suite", () => {
  let root: string | undefined;

  /** Stages an example's project, removed after the case that asked for it. */
  function stage(
    exampleName: string,
    overrides: Record<string, string> = {},
  ): string {
    root = createFixtureTree({ ...readExample(exampleName), ...overrides });
    return root;
  }

  afterEach(() => {
    if (root !== undefined) {
      removeFixtureTree(root);
      root = undefined;
    }
  });

  describe("environment schema e2e", () => {
    it("allows an empty schema by default", () => {
      expect.hasAssertions();
      expect(environmentSchema.parse({})).toStrictEqual({});
    });
  });

  it(
    "prints the glossary of every language and writes nothing when run with no configuration and no flag",
    () => {
      const staged = stage("zero-config");

      const result = run(staged, []);
      const words = [
        ...result.standardOutput.matchAll(/^- \*\*(.+)\*\*:/gmu),
      ].map(([, word]) => word);

      expect(result.exitCode).toBe(0);
      expect(result.standardOutput).toContain(START);
      expect(result.standardOutput).toContain("## 🪙 Coinagerie");
      expect(words).toStrictEqual(POLYGLOT_WORDS.toSorted());
      expect(result.standardOutput).not.toContain("hidden");
      expect(existsSync(path.join(staged, "README.md"))).toBe(false);
    },
    SPAWN_TIMEOUT,
  );

  it(
    "fails a check naming every missing word",
    () => {
      const staged = stage("check-failures");

      const result = runCheckFailure(staged, "missing", "--check");

      expect(result.exitCode).toBe(1);
      expect(result.standardError).toContain("angle");
      expect(result.standardError).toContain("service");
      expect(result.standardError).toContain(
        path.join(staged, "glossaries", "missing.md"),
      );
    },
    SPAWN_TIMEOUT,
  );

  it(
    "fails a check naming every stale word, and passes one whose definitions are empty",
    () => {
      const staged = stage("check-failures");

      const stale = runCheckFailure(staged, "stale", "--check");
      const empty = runCheckFailure(staged, "undefined", "--check");

      expect(stale.exitCode).toBe(1);
      expect(stale.standardError).toContain("vanished");
      expect(empty.exitCode).toBe(0);
    },
    SPAWN_TIMEOUT * 2,
  );

  it(
    "writes a glossary that then checks clean, keeps definitions, and does not change on a second write",
    () => {
      const staged = stage("check-failures");
      const glossaryPath = path.join(staged, "glossaries", "stale.md");

      const written = runCheckFailure(staged, "stale", "--write");
      const content = readFileSync(glossaryPath, "utf8");
      const checked = runCheckFailure(staged, "stale", "--check");
      const rewritten = runCheckFailure(staged, "stale", "--write");

      expect(written.exitCode).toBe(0);
      expect(content).toContain(
        "- **angle**: The gap between two bodies.\n  Measured in degrees.\n",
      );
      expect(content).toContain("- **phase**:\n");
      expect(content).not.toContain("vanished");
      expect(checked.exitCode).toBe(0);
      expect(rewritten.exitCode).toBe(0);
      expect(readFileSync(glossaryPath, "utf8")).toBe(content);
    },
    SPAWN_TIMEOUT * 3,
  );

  it(
    "appends the block to a destination without anchors",
    () => {
      const staged = stage("outputs", { "README.md": "# Fixture\n" });

      const result = run(staged, ["--write"]);

      expect(result.exitCode).toBe(0);
      expect(readFileSync(path.join(staged, "README.md"), "utf8")).toContain(
        `# Fixture\n\n${START}`,
      );
    },
    SPAWN_TIMEOUT,
  );

  it.each([
    ["an unrecognized line", "unparsable"],
    ["a duplicated word", "duplicate"],
  ])(
    "refuses to write a glossary with %s, leaving it byte for byte",
    (_case, name) => {
      const staged = stage("check-failures");
      const glossaryPath = path.join(staged, "glossaries", `${name}.md`);
      const content = readFileSync(glossaryPath, "utf8");

      const result = runCheckFailure(staged, name, "--write");

      expect(result.exitCode).toBe(1);
      expect(result.standardError).toContain(glossaryPath);
      expect(readFileSync(glossaryPath, "utf8")).toBe(content);
    },
    SPAWN_TIMEOUT,
  );

  it(
    "reports a faulty configuration with its path",
    () => {
      const staged = stage("check-failures");

      const result = runCheckFailure(staged, "bad-shape", "--check");

      expect(result.exitCode).toBe(1);
      expect(result.standardError).toContain(
        path.join(staged, "bad-shape.config.ts"),
      );
    },
    SPAWN_TIMEOUT,
  );

  it(
    "folds word forms, merges a configured family, and leaves out excluded words",
    () => {
      const staged = stage("folding");

      const written = run(staged, ["--output-markdown", "WORDS.md", "--write"]);
      const checked = run(staged, ["--output-markdown", "WORDS.md", "--check"]);

      expect(written.exitCode).toBe(0);
      expect(readFileSync(path.join(staged, "WORDS.md"), "utf8")).toContain(
        "- **aspect**:\n- **configure**:\n- **engine**:\n- **src**:\n",
      );
      expect(checked.exitCode).toBe(0);
    },
    SPAWN_TIMEOUT * 2,
  );

  it(
    "leaves out ignored files, excluded paths, and excluded words",
    () => {
      const staged = stage("exclusions", {
        "scratch/leftover.ts": "export const leftoverWord = 1;\n",
      });

      const result = run(staged, []);

      expect(result.exitCode).toBe(0);
      expect(result.standardOutput).toContain(
        "- **harbor**:\n- **high**:\n- **tide**:\n- **water**:\n",
      );
      expect(result.standardOutput).not.toMatch(/leftover|mock|generated/u);
    },
    SPAWN_TIMEOUT,
  );

  it(
    "reads a layered glossary through exclude.words from the root glossary",
    () => {
      const staged = stage("layered-glossaries");
      const flags = ["--config", "packages/billing/coinagerie.config.ts"];

      const checked = run(staged, [...flags, "--check"]);

      expect(checked.exitCode).toBe(0);
    },
    SPAWN_TIMEOUT,
  );

  it.each([
    ["an exclude.words that throws", "throwing-words"],
    ["a fold that returns an empty string", "empty-fold"],
  ])(
    "aborts on %s, naming the configuration file and writing nothing",
    (_case, name) => {
      const staged = stage("check-failures");
      const glossaryPath = path.join(staged, "glossaries", "missing.md");
      const content = readFileSync(glossaryPath, "utf8");

      const result = runCheckFailure(staged, name, "--write");

      expect(result.exitCode).toBe(1);
      expect(result.standardError).toContain(
        path.join(staged, `${name}.config.ts`),
      );
      expect(readFileSync(glossaryPath, "utf8")).toBe(content);
    },
    SPAWN_TIMEOUT,
  );

  it.each([
    ["both --check and --write", "zero-config", ["--check", "--write"]],
    ["--check with no destination configured", "zero-config", ["--check"]],
    ["--write with no destination configured", "zero-config", ["--write"]],
  ])(
    "refuses %s",
    (_case, exampleName, args) => {
      const staged = stage(exampleName);
      const listing = (): string[] =>
        readdirSync(staged, { recursive: true }).map(String).toSorted();
      const before = listing();

      const result = run(staged, args);

      expect(result.exitCode).toBe(1);
      expect(listing()).toStrictEqual(before);
    },
    SPAWN_TIMEOUT,
  );
});
