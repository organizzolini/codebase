import fs from "node:fs";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  readWords,
  removeStagedExample,
  runCoinagerie,
  stageExample,
} from "./coinagerie.js";
import { EXCLUSIONS_SCRATCH_FILES } from "./runs.js";

/**
 * Every example this package ships, run the way its guide says.
 *
 * The refusals matter most. They are where coinagerie is opinionated and
 * where a reader gets stuck, so each one is reproduced with the exit code and
 * the sentence the tool actually prints — a message that changes wording is a
 * guide that has drifted, and this is what notices.
 */

describe("every example this package ships", () => {
  let root: string | undefined;

  /** A staged copy of an example, removed after the case that asked for it. */
  function stage(
    exampleName: string,
    extraFiles?: Record<string, string>,
  ): string {
    root = stageExample(exampleName, extraFiles);
    return root;
  }

  afterEach(() => {
    if (root !== undefined) {
      removeStagedExample(root);
      root = undefined;
    }
  });

  describe("zero-config", () => {
    it("prints every language's words, hides what each skips, and writes nothing", () => {
      const staged = stage("zero-config");
      const before = fs.readdirSync(staged, { recursive: true }).toSorted();

      const result = runCoinagerie(staged, []);

      expect(result.exitCode).toBe(0);
      expect(readWords(result.standardOutput)).toStrictEqual(
        [
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
        ].toSorted(),
      );
      expect(result.standardOutput).not.toContain("hidden");
      expect(
        fs.readdirSync(staged, { recursive: true }).toSorted(),
      ).toStrictEqual(before);
    });
  });

  describe("exclusions", () => {
    it("leaves out ignored files, excluded paths, and excluded words", () => {
      const result = runCoinagerie(
        stage("exclusions", EXCLUSIONS_SCRATCH_FILES),
        [],
      );

      expect(result.exitCode).toBe(0);
      expect(readWords(result.standardOutput)).toStrictEqual([
        "harbor",
        "high",
        "tide",
        "water",
      ]);
    });
  });

  describe("folding", () => {
    it("folds forms, merges a configured family, and excludes after folding", () => {
      const result = runCoinagerie(stage("folding"), []);

      expect(result.exitCode).toBe(0);
      expect(readWords(result.standardOutput)).toStrictEqual([
        "aspect",
        "configure",
        "engine",
        "src",
      ]);
    });
  });

  describe("layered-glossaries", () => {
    it("lists in the package only the words the root glossary lacks", () => {
      const staged = stage("layered-glossaries");
      const billing = path.join("packages", "billing", "README.md");
      fs.rmSync(path.join(staged, billing));

      const written = runCoinagerie(staged, [
        "--config",
        "packages/billing/coinagerie.config.ts",
        "--write",
      ]);

      expect(written.exitCode).toBe(0);
      expect(
        readWords(fs.readFileSync(path.join(staged, billing), "utf8")),
      ).toStrictEqual(["date", "due", "invoice", "src"]);
    });

    it("turns a package word stale once the root glossary defines it", () => {
      const staged = stage("layered-glossaries");
      fs.appendFileSync(
        path.join(staged, "GLOSSARY.md"),
        "\n- **invoice**: Moved up.\n",
      );

      const result = runCoinagerie(staged, [
        "--config",
        "packages/billing/coinagerie.config.ts",
        "--check",
      ]);

      expect(result.exitCode).toBe(1);
      expect(result.standardError).toContain("invoice");
    });
  });

  describe("outputs", () => {
    it("keeps each destination's own definitions and does not change on a second write", () => {
      const staged = stage("outputs");
      const markdown = path.join(staged, "README.md");
      const json = path.join(staged, "glossary.json");
      const committed = [
        fs.readFileSync(markdown, "utf8"),
        fs.readFileSync(json, "utf8"),
      ];

      const first = runCoinagerie(staged, ["--write"]);
      const second = runCoinagerie(staged, ["--write"]);

      expect(first.exitCode).toBe(0);
      expect(second.exitCode).toBe(0);
      expect([
        fs.readFileSync(markdown, "utf8"),
        fs.readFileSync(json, "utf8"),
      ]).toStrictEqual(committed);
      expect(committed[0]).toContain("- **kilometer**: The unit every");
      expect(committed[1]).toContain('"orbit": "A closed path around a body."');
    });

    it("deletes a stale word with its definition and adds a missing one empty", () => {
      const staged = stage("outputs");
      fs.writeFileSync(
        path.join(staged, "glossary.json"),
        '{"orbit": "Kept.", "vanished": "Deleted."}\n',
      );

      const result = runCoinagerie(staged, ["--write"]);
      const json = fs.readFileSync(path.join(staged, "glossary.json"), "utf8");

      expect(result.exitCode).toBe(0);
      expect(json).toContain('"orbit": "Kept."');
      expect(json).toContain('"perigee": ""');
      expect(json).not.toContain("vanished");
    });

    it("prints the flat JSON glossary when asked", () => {
      const result = runCoinagerie(stage("outputs"), ["--format", "json"]);

      expect(result.exitCode).toBe(0);
      expect(JSON.parse(result.standardOutput)).toStrictEqual({
        kilometer: "",
        orbit: "",
        perigee: "",
        plan: "",
        planner: "",
        src: "",
      });
    });
  });

  describe("check-failures", () => {
    it.each([
      ["missing", ["angle", "service", "src"], []],
      ["stale", [], ["vanished"]],
    ])("names every missing and stale word for %s", (name, missing, stale) => {
      const staged = stage("check-failures");

      const result = runCoinagerie(staged, [
        "--config",
        `${name}.config.ts`,
        "--check",
      ]);

      expect(result.exitCode).toBe(1);
      expect(result.standardError).toContain(
        "Found a glossary out of step with the code",
      );
      expect(result.standardError).toContain(
        path.join(staged, "glossaries", `${name}.md`),
      );

      for (const word of [...missing, ...stale]) {
        expect(result.standardError).toContain(word);
      }
    });

    it("passes a glossary whose every definition is empty", () => {
      const result = runCoinagerie(stage("check-failures"), [
        "--config",
        "undefined.config.ts",
        "--check",
      ]);

      expect(result.exitCode).toBe(0);
      expect(result.standardError).toContain("in step with the code");
    });

    it.each([
      ["unparsable", "unparsable.md"],
      ["duplicate", "duplicate.md"],
      ["broken-json", "broken.glossary"],
    ])(
      "refuses a %s glossary, even to write, leaving it byte for byte",
      (name, glossary) => {
        const staged = stage("check-failures");
        const glossaryPath = path.join(staged, "glossaries", glossary);
        const before = fs.readFileSync(glossaryPath, "utf8");

        for (const mode of ["--check", "--write"]) {
          const result = runCoinagerie(staged, [
            "--config",
            `${name}.config.ts`,
            mode,
          ]);

          expect(result.exitCode).toBe(1);
          expect(result.standardError).toContain(
            "Refused a glossary it cannot parse",
          );
          expect(result.standardError).toContain(glossaryPath);
        }

        expect(fs.readFileSync(glossaryPath, "utf8")).toBe(before);
      },
    );

    it.each([
      ["no-destination", "Found no glossary destination to check"],
      ["bad-shape", "Rejected the configuration"],
      ["throwing-words", "the parent glossary is unreadable"],
      ["empty-fold", "fold must return a non-empty string"],
    ])("reports %s", (name, sentence) => {
      const staged = stage("check-failures");

      const result = runCoinagerie(staged, [
        "--config",
        `${name}.config.ts`,
        "--check",
      ]);

      expect(result.exitCode).toBe(1);
      expect(result.standardError).toContain(sentence);
      expect(result.standardError).toContain(
        path.join(staged, `${name}.config.ts`),
      );
    });

    it("refuses both --check and --write, writing nothing", () => {
      const staged = stage("check-failures");
      const glossaryPath = path.join(staged, "glossaries", "missing.md");
      const before = fs.readFileSync(glossaryPath, "utf8");

      const result = runCoinagerie(staged, [
        "--config",
        "missing.config.ts",
        "--check",
        "--write",
      ]);

      expect(result.exitCode).toBe(1);
      expect(result.standardError).toContain(
        "--check and --write cannot be combined",
      );
      expect(fs.readFileSync(glossaryPath, "utf8")).toBe(before);
    });
  });
});
