import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/** The skills this package ships, one directory each. */
const EXPECTED_SKILLS = ["coinagerie-collect", "coinagerie-configure"];

/**
 * What would tie a skill to the repository it was written in, each with the
 * label that explains a failure.
 *
 * An installed skill is a bare copy dropped into some other repository, where
 * a path, a task runner target, or another toolchain's skill names something
 * that does not exist.
 */
const REPOSITORY_SPECIFICS: { label: string; pattern: RegExp }[] = [
  { label: "a folder of this repository", pattern: /\bprojects\//u },
  {
    label: "this repository's shared configuration",
    pattern: /\bconfiguration\//u,
  },
  { label: "this repository's skills folder", pattern: /\.agents\b/u },
  { label: "this repository's toolchain folder", pattern: /\bic-suite\b/u },
  { label: "this repository's owner", pattern: /\bOrganizzolini\b/iu },
  {
    label: "a task runner invocation",
    pattern: /\b(?:nx|pnpm) (?:exec|run)\b/u,
  },
  {
    label: "this repository's agent guidance",
    pattern: /\b(?:AGENTS|CLAUDE|CONTEXT)\.md\b/u,
  },
  {
    label: "another toolchain",
    pattern: /\b(?:callidescope|codependix|codometer|conformetry)\b/iu,
  },
];

const skillsDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "skills",
);

/** Every file under a directory, as paths relative to it. */
const filesUnder = (directory: string): string[] =>
  fs
    .readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) =>
      path.relative(directory, path.join(entry.parentPath, entry.name)),
    );

/**
 * Checks that the skills travel: the package ships exactly its skills, each
 * holding only prose, and none names anything of the repository it lives in.
 */
describe("shipped coinagerie skills", () => {
  it("ships exactly the coinagerie skills", () => {
    const shipped = fs
      .readdirSync(skillsDirectory, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .toSorted();

    expect(shipped).toStrictEqual(EXPECTED_SKILLS);
  });

  describe.each(EXPECTED_SKILLS)("%s", (skill: string) => {
    const root = path.join(skillsDirectory, skill);

    it("holds only markdown, so it imports nothing", () => {
      const files = filesUnder(root);

      expect(files).toContain("SKILL.md");
      expect(files.filter((file) => !file.endsWith(".md"))).toStrictEqual([]);
    });

    it.each(REPOSITORY_SPECIFICS)(
      "names no $label",
      ({ pattern }: { pattern: RegExp }) => {
        const prose = filesUnder(root)
          .map((file) => fs.readFileSync(path.join(root, file), "utf8"))
          .join("\n");

        expect(prose).not.toMatch(pattern);
      },
    );
  });
});
