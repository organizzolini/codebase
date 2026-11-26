import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { beforeAll, describe, expect, it } from "vitest";

import { createTemporaryDirectory } from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { SkillDescriptionsService } from "./skill-descriptions.service";

/** Writes a file under the workspace, creating its folders. */
const writeWorkspaceFile = (
  workspaceRoot: string,
  relativePath: string,
  contents: string,
): void => {
  const filePath = path.join(workspaceRoot, relativePath);

  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, contents);
};

/** A skill file whose front matter holds the given description. */
const renderSkill = (name: string, description: string): string =>
  `---\nname: ${name}\ndescription: ${description}\n---\n\n# ${name}\n`;

/** A workspace holding local, authored-locked, and vendored skills. */
const createWorkspace = (): string => {
  const workspaceRoot = createTemporaryDirectory("skill-descriptions");

  writeWorkspaceFile(
    workspaceRoot,
    "skills-lock.json",
    JSON.stringify({
      skills: {
        "callidescope-trace": {
          skillPath:
            "projects/ic-suite/callidescope/callidescope-agents/skills/callidescope-trace/SKILL.md",
          source: "Organizzolini/codebase",
        },
        "codometer-measure": {
          source:
            "./projects/ic-suite/codometer/codometer-agents/skills/codometer-measure",
          sourceType: "local",
        },
        "nx-workspace": {
          skillPath: "skills/nx-workspace/SKILL.md",
          source: "nrwl/nx",
        },
        reui: { source: "./.agents/skills/reui" },
      },
      version: 1,
    }),
  );
  writeWorkspaceFile(
    workspaceRoot,
    ".agents/skills/commit-code/SKILL.md",
    renderSkill("commit-code", "Write commit messages."),
  );
  writeWorkspaceFile(
    workspaceRoot,
    ".agents/skills/nx-workspace/SKILL.md",
    renderSkill("nx-workspace", "word ".repeat(200)),
  );
  writeWorkspaceFile(
    workspaceRoot,
    ".agents/skills/callidescope-trace/SKILL.md",
    renderSkill("callidescope-trace", "Installed copy."),
  );
  writeWorkspaceFile(
    workspaceRoot,
    "projects/ic-suite/callidescope/callidescope-agents/skills/callidescope-trace/SKILL.md",
    renderSkill("callidescope-trace", "Trace call stacks."),
  );
  writeWorkspaceFile(
    workspaceRoot,
    "projects/ic-suite/codometer/codometer-agents/skills/codometer-measure/SKILL.md",
    renderSkill("codometer-measure", "Run a measurement."),
  );
  mkdirSync(path.join(workspaceRoot, ".agents/skills/empty-folder"));
  writeWorkspaceFile(workspaceRoot, ".agents/skills/README.md", "# Skills\n");

  return workspaceRoot;
};

describe(SkillDescriptionsService, () => {
  let service: SkillDescriptionsService;

  beforeAll(async () => {
    const built = await buildTestingModule(SkillDescriptionsService);

    service = built.instance;
  });

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(SkillDescriptionsService);

    expect(instance).toBeInstanceOf(SkillDescriptionsService);
  });

  describe("countWords", () => {
    it("counts runs of non-whitespace the way wc -w does", () => {
      expect(service.countWords("  Use when\n  a check   fails. ")).toBe(5);
    });

    it("counts nothing in an empty description", () => {
      expect(service.countWords("")).toBe(0);
    });
  });

  describe("resolveAuthoredSkillPaths", () => {
    it("names local skills and authored locked skills at their source, never vendored ones", () => {
      expect.hasAssertions();

      const workspaceRoot = createWorkspace();

      expect(service.resolveAuthoredSkillPaths(workspaceRoot)).toStrictEqual([
        ".agents/skills/commit-code/SKILL.md",
        "projects/ic-suite/callidescope/callidescope-agents/skills/callidescope-trace/SKILL.md",
        "projects/ic-suite/codometer/codometer-agents/skills/codometer-measure/SKILL.md",
      ]);
    });

    it("skips an authored locked skill whose source file is missing", () => {
      expect.hasAssertions();

      const workspaceRoot = createTemporaryDirectory("skill-descriptions");

      writeWorkspaceFile(
        workspaceRoot,
        "skills-lock.json",
        JSON.stringify({
          skills: {
            gone: {
              skillPath: "skills/gone/SKILL.md",
              source: "organizzolini/codebase",
            },
          },
        }),
      );
      mkdirSync(path.join(workspaceRoot, ".agents/skills"), {
        recursive: true,
      });

      expect(service.resolveAuthoredSkillPaths(workspaceRoot)).toStrictEqual(
        [],
      );
    });

    it("rejects a lockfile without a skills map", () => {
      expect.hasAssertions();

      const workspaceRoot = createTemporaryDirectory("skill-descriptions");

      writeWorkspaceFile(workspaceRoot, "skills-lock.json", "{}");

      expect(() => service.resolveAuthoredSkillPaths(workspaceRoot)).toThrow(
        /skills/u,
      );
    });
  });

  describe("readDescription", () => {
    it("reads a folded multi-line description", () => {
      expect.hasAssertions();

      const workspaceRoot = createTemporaryDirectory("skill-descriptions");

      writeWorkspaceFile(
        workspaceRoot,
        "SKILL.md",
        "---\nname: folded\ndescription: >-\n  Spans two\n  lines.\n---\n",
      );

      expect(service.readDescription(workspaceRoot, "SKILL.md")).toBe(
        "Spans two lines.",
      );
    });

    it("reads nothing from a file without front matter", () => {
      expect.hasAssertions();

      const workspaceRoot = createTemporaryDirectory("skill-descriptions");

      writeWorkspaceFile(workspaceRoot, "SKILL.md", "# No front matter\n");

      expect(service.readDescription(workspaceRoot, "SKILL.md")).toBe("");
    });

    it("reads nothing from front matter that is not a mapping", () => {
      expect.hasAssertions();

      const workspaceRoot = createTemporaryDirectory("skill-descriptions");

      writeWorkspaceFile(workspaceRoot, "SKILL.md", "---\njust text\n---\n");

      expect(service.readDescription(workspaceRoot, "SKILL.md")).toBe("");
    });

    it("reads nothing when the description is not a string", () => {
      expect.hasAssertions();

      const workspaceRoot = createTemporaryDirectory("skill-descriptions");

      writeWorkspaceFile(
        workspaceRoot,
        "SKILL.md",
        "---\ndescription: 42\n---\n",
      );

      expect(service.readDescription(workspaceRoot, "SKILL.md")).toBe("");
    });
  });

  describe("findOverlongDescriptions", () => {
    it("names only the descriptions past the limit, with their word counts", () => {
      expect.hasAssertions();

      const workspaceRoot = createTemporaryDirectory("skill-descriptions");

      writeWorkspaceFile(
        workspaceRoot,
        "fits/SKILL.md",
        renderSkill("fits", "word ".repeat(128).trim()),
      );
      writeWorkspaceFile(
        workspaceRoot,
        "overlong/SKILL.md",
        renderSkill("overlong", "word ".repeat(129).trim()),
      );

      expect(
        service.findOverlongDescriptions(workspaceRoot, [
          "fits/SKILL.md",
          "overlong/SKILL.md",
        ]),
      ).toStrictEqual([{ skillPath: "overlong/SKILL.md", words: 129 }]);
    });
  });

  describe("measureTotalCharacters", () => {
    it("adds up every description's characters, counting a missing one as none", () => {
      expect.hasAssertions();

      const workspaceRoot = createTemporaryDirectory("skill-descriptions");

      writeWorkspaceFile(workspaceRoot, "a/SKILL.md", renderSkill("a", "abc"));
      writeWorkspaceFile(workspaceRoot, "b/SKILL.md", renderSkill("b", "de"));
      writeWorkspaceFile(workspaceRoot, "c/SKILL.md", "# No front matter\n");

      expect(
        service.measureTotalCharacters(workspaceRoot, [
          "a/SKILL.md",
          "b/SKILL.md",
          "c/SKILL.md",
        ]),
      ).toBe(5);
    });
  });
});
