import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  createFixtureTree,
  removeFixtureTree,
} from "../../../testing/fixture-tree";
import { run, SPAWN_TIMEOUT } from "../../../testing/run-command";

const START = "<!-- coinagerie:start -->";
const END = "<!-- coinagerie:end -->";

/** A source file whose words are `aspect`, `angle`, `lunar`, `phase`, `service`, and `src`. */
const SOURCE = {
  "src/lunar-phase.service.ts":
    "export class LunarPhaseService { readonly aspectAngle = 1; }\n",
};

/** Both destinations, the JSON one first, and nothing else scanned. */
const CONFIGURATION = {
  "coinagerie.config.ts": [
    "export default {",
    '  exclude: { paths: ["coinagerie.config.ts", "tsconfig.json"] },',
    "  outputs: [",
    '    { path: "glossary.json", type: "json" },',
    '    { description: "Words.", path: "README.md", type: "markdown" },',
    "  ],",
    "};",
    "",
  ].join("\n"),
};

const JSON_WORDS = ["angle", "aspect", "lunar", "phase", "service", "src"];

/** A JSON glossary whose words are given, each with its definition. */
function glossary(entries: Record<string, string>): string {
  return `${JSON.stringify(entries, undefined, 2)}\n`;
}

/** A README whose glossary block holds exactly the given bullets. */
function readme(...bullets: string[]): string {
  return [
    "# Fixture",
    "",
    START,
    "",
    "## 🪙 Coinagerie",
    "",
    "Words.",
    "",
    ...bullets,
    "",
    END,
    "",
  ].join("\n");
}

describe("collect command with a json destination end-to-end suite", () => {
  let root: string | undefined;

  afterEach(() => {
    if (root !== undefined) {
      removeFixtureTree(root);
      root = undefined;
    }
  });

  it(
    "reports each destination's own missing and stale words",
    () => {
      root = createFixtureTree({
        ...SOURCE,
        ...CONFIGURATION,
        "glossary.json": glossary({ angle: "", lunar: "", vanished: "" }),
        "README.md": readme(
          ...[...JSON_WORDS, "gone"].map((word) => `- **${word}**:`),
        ),
      });

      const result = run(root, ["--check"]);

      expect(result.exitCode).toBe(1);
      expect(result.standardError).toContain(path.join(root, "glossary.json"));
      expect(result.standardError).toContain(path.join(root, "README.md"));
      expect(result.standardError).toContain("vanished");
      expect(result.standardError).toContain("gone");
    },
    SPAWN_TIMEOUT,
  );

  it(
    "writes both, copies no definition between them, and then checks clean",
    () => {
      root = createFixtureTree({
        ...SOURCE,
        ...CONFIGURATION,
        "glossary.json": glossary({ phase: "A stage.", stale: "Gone." }),
        "README.md": readme("- **lunar**: Of the moon."),
      });

      const written = run(root, ["--write"]);
      const checked = run(root, ["--check"]);
      const jsonPath = path.join(root, "glossary.json");
      const content = readFileSync(jsonPath, "utf8");
      const rewritten = run(root, ["--write"]);

      expect(written.exitCode).toBe(0);
      expect(content).toBe(
        glossary({
          angle: "",
          aspect: "",
          lunar: "",
          phase: "A stage.",
          service: "",
          src: "",
        }),
      );
      expect(readFileSync(path.join(root, "README.md"), "utf8")).toBe(
        readme(
          "- **angle**:",
          "- **aspect**:",
          "- **lunar**: Of the moon.",
          "- **phase**:",
          "- **service**:",
          "- **src**:",
        ),
      );
      expect(checked.exitCode).toBe(0);
      expect(rewritten.exitCode).toBe(0);
      expect(readFileSync(jsonPath, "utf8")).toBe(content);
    },
    SPAWN_TIMEOUT * 4,
  );

  it(
    "creates a json destination that does not exist yet",
    () => {
      root = createFixtureTree({ ...SOURCE, ...CONFIGURATION });

      const result = run(root, ["--write"]);

      expect(result.exitCode).toBe(0);
      expect(
        JSON.parse(readFileSync(path.join(root, "glossary.json"), "utf8")),
      ).toStrictEqual(Object.fromEntries(JSON_WORDS.map((word) => [word, ""])));
    },
    SPAWN_TIMEOUT,
  );

  it.each([
    ["invalid JSON", '{ "angle": '],
    ["a non-string value", '{ "angle": 1 }'],
    ["a duplicated word", '{ "angle": "one", "angle": "two" }'],
    ["an array", '["angle"]'],
  ])(
    "refuses to write over %s, leaving every destination untouched",
    (_case, content) => {
      root = createFixtureTree({
        ...SOURCE,
        ...CONFIGURATION,
        "glossary.json": content,
        "README.md": "# Fixture\n",
      });

      const result = run(root, ["--write"]);

      expect(result.exitCode).toBe(1);
      expect(result.standardError).toContain(path.join(root, "glossary.json"));
      expect(readFileSync(path.join(root, "glossary.json"), "utf8")).toBe(
        content,
      );
      expect(readFileSync(path.join(root, "README.md"), "utf8")).toBe(
        "# Fixture\n",
      );
    },
    SPAWN_TIMEOUT,
  );

  it(
    "refuses a check against a glossary it cannot parse",
    () => {
      root = createFixtureTree({
        ...SOURCE,
        ...CONFIGURATION,
        "glossary.json": "not json",
      });

      const result = run(root, ["--check"]);

      expect(result.exitCode).toBe(1);
      expect(existsSync(path.join(root, "README.md"))).toBe(false);
    },
    SPAWN_TIMEOUT,
  );
});
