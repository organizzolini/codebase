import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { createFixtureTree, removeFixtureTree } from "../testing/fixture-tree";

import { environmentSchema } from "./coinagerie-cli.constants";

const COMMAND_PATH = path.resolve(
  import.meta.dirname,
  "coinagerie-cli.main.ts",
);
const START = "<!-- coinagerie:start -->";
const END = "<!-- coinagerie:end -->";
const SPAWN_TIMEOUT = 120_000;

/** A source file whose words are `aspect`, `angle`, `lunar`, `phase`, `service`, and `src`. */
const SOURCE = {
  "src/lunar-phase.service.ts": [
    "// hiddenComment",
    "export class LunarPhaseService {",
    '  readonly aspectAngle = "hiddenString";',
    "}",
    "",
  ].join("\n"),
};

/** A configuration keeping the vocabulary to the source file alone. */
const CONFIGURATION = {
  "coinagerie.config.ts": [
    "export default {",
    '  exclude: { paths: ["coinagerie.config.ts", "tsconfig.json"] },',
    '  outputs: [{ path: "README.md", type: "markdown" }],',
    "};",
    "",
  ].join("\n"),
};

interface RunResult {
  exitCode: null | number;
  standardError: string;
  standardOutput: string;
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
    ...bullets,
    "",
    END,
    "",
  ].join("\n");
}

/**
 * Runs the real command in a fixture tree, as a separate process, because
 * what is under test is its exit code, its streams, and the files it leaves.
 */
function run(root: string, args: string[]): RunResult {
  const result = spawnSync(
    process.execPath,
    ["--import", "@swc-node/register/esm-register", COMMAND_PATH, ...args],
    {
      cwd: root,
      encoding: "utf8",
      env: { ...process.env, FORCE_COLOR: "0" },
      timeout: SPAWN_TIMEOUT,
    },
  );

  return {
    exitCode: result.status,
    standardError: result.stderr,
    standardOutput: result.stdout,
  };
}

describe("main end-to-end suite", () => {
  let root: string | undefined;

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
    "prints the glossary and writes nothing when run with no configuration and no flag",
    () => {
      root = createFixtureTree(SOURCE);

      const result = run(root, []);

      expect(result.exitCode).toBe(0);
      expect(result.standardOutput).toContain(START);
      expect(result.standardOutput).toContain("## 🪙 Coinagerie");
      expect(result.standardOutput).toContain("- **lunar**:\n- **phase**:");
      expect(result.standardOutput).not.toContain("hidden");
      expect(existsSync(path.join(root, "README.md"))).toBe(false);
    },
    SPAWN_TIMEOUT,
  );

  it(
    "fails a check naming every missing word",
    () => {
      root = createFixtureTree({
        ...SOURCE,
        ...CONFIGURATION,
        "README.md": readme("- **aspect**:", "- **lunar**:", "- **phase**:"),
      });

      const result = run(root, ["--check"]);

      expect(result.exitCode).toBe(1);
      expect(result.standardError).toContain("angle");
      expect(result.standardError).toContain("service");
      expect(result.standardError).toContain(path.join(root, "README.md"));
    },
    SPAWN_TIMEOUT,
  );

  it(
    "fails a check naming every stale word, and passes one whose definitions are empty",
    () => {
      const words = ["angle", "aspect", "lunar", "phase", "service", "src"];
      root = createFixtureTree({
        ...SOURCE,
        ...CONFIGURATION,
        "README.md": readme(
          ...[...words, "vanished"].map((word) => `- **${word}**:`),
        ),
      });

      const stale = run(root, ["--check"]);

      expect(stale.exitCode).toBe(1);
      expect(stale.standardError).toContain("vanished");
    },
    SPAWN_TIMEOUT,
  );

  it(
    "writes a glossary that then checks clean, keeps definitions, and does not change on a second write",
    () => {
      root = createFixtureTree({
        ...SOURCE,
        ...CONFIGURATION,
        "README.md": readme(
          "- **gone**: Deleted on write.",
          "- **lunar**: Of the moon.",
          "  Continued here.",
        ),
      });
      const readmePath = path.join(root, "README.md");

      const written = run(root, ["--write"]);
      const content = readFileSync(readmePath, "utf8");
      const checked = run(root, ["--check"]);
      const rewritten = run(root, ["--write"]);

      expect(written.exitCode).toBe(0);
      expect(content).toBe(
        readme(
          "- **angle**:",
          "- **aspect**:",
          "- **lunar**: Of the moon.",
          "  Continued here.",
          "- **phase**:",
          "- **service**:",
          "- **src**:",
        ),
      );
      expect(checked.exitCode).toBe(0);
      expect(rewritten.exitCode).toBe(0);
      expect(readFileSync(readmePath, "utf8")).toBe(content);
    },
    SPAWN_TIMEOUT * 3,
  );

  it(
    "appends the block to a destination without anchors",
    () => {
      root = createFixtureTree({
        ...SOURCE,
        ...CONFIGURATION,
        "README.md": "# Fixture\n",
      });

      const result = run(root, ["--write"]);

      expect(result.exitCode).toBe(0);
      expect(readFileSync(path.join(root, "README.md"), "utf8")).toContain(
        `# Fixture\n\n${START}`,
      );
    },
    SPAWN_TIMEOUT,
  );

  it.each([
    ["an unrecognized line", readme("- **lunar**:", "stray text")],
    ["a duplicated word", readme("- **lunar**:", "- **lunar**: Again.")],
  ])(
    "refuses to write a glossary with %s, leaving it byte for byte",
    (_case, content) => {
      root = createFixtureTree({
        ...SOURCE,
        ...CONFIGURATION,
        "README.md": content,
      });

      const result = run(root, ["--write"]);

      expect(result.exitCode).toBe(1);
      expect(result.standardError).toContain(path.join(root, "README.md"));
      expect(readFileSync(path.join(root, "README.md"), "utf8")).toBe(content);
    },
    SPAWN_TIMEOUT,
  );

  it(
    "reports a faulty configuration with its path",
    () => {
      root = createFixtureTree({
        ...SOURCE,
        "coinagerie.config.ts": 'export default { include: "src" };\n',
      });

      const result = run(root, ["--check"]);

      expect(result.exitCode).toBe(1);
      expect(result.standardError).toContain(
        path.join(root, "coinagerie.config.ts"),
      );
    },
    SPAWN_TIMEOUT,
  );

  it.each([
    ["both --check and --write", ["--check", "--write"]],
    ["--check with no destination configured", ["--check"]],
    ["--write with no destination configured", ["--write"]],
  ])(
    "refuses %s",
    (_case, args) => {
      root = createFixtureTree(SOURCE);

      const result = run(root, args);

      expect(result.exitCode).toBe(1);
      expect(existsSync(path.join(root, "README.md"))).toBe(false);
    },
    SPAWN_TIMEOUT,
  );
});
