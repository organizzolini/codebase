import {
  lstatSync,
  mkdirSync,
  readFileSync,
  readlinkSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

import { beforeAll, describe, expect, it } from "vitest";

import { createTemporaryDirectory } from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { ReadmeProjectsService } from "../readme-projects/readme-projects.service";

import { AgentInstructionsService } from "./agent-instructions.service";

const moduleOptions = { providers: [ReadmeProjectsService] };

/** Makes a project directory holding a manifest and, optionally, instructions. */
const makeProject = (
  workspaceRoot: string,
  projectPath: string,
  withInstructions = true,
): string => {
  const directory = path.join(workspaceRoot, projectPath);

  mkdirSync(directory, { recursive: true });
  writeFileSync(path.join(directory, "package.json"), "{}");

  if (withInstructions) {
    writeFileSync(path.join(directory, "AGENTS.md"), "# Instructions\n");
  }

  return directory;
};

/** A workspace with a project in each link state. */
const createWorkspace = (): string => {
  const workspaceRoot = createTemporaryDirectory("agent-instructions");

  makeProject(workspaceRoot, "missing");
  symlinkSync(
    "AGENTS.md",
    path.join(makeProject(workspaceRoot, "projects/linked"), "CLAUDE.md"),
  );
  makeProject(workspaceRoot, "projects/no-instructions", false);
  symlinkSync(
    "OTHER.md",
    path.join(makeProject(workspaceRoot, "projects/wrong"), "CLAUDE.md"),
  );
  writeFileSync(
    path.join(
      makeProject(workspaceRoot, "projects/domain/real-file"),
      "CLAUDE.md",
    ),
    "kept\n",
  );

  return workspaceRoot;
};

describe(AgentInstructionsService, () => {
  let service: AgentInstructionsService;

  beforeAll(async () => {
    const built = await buildTestingModule(
      AgentInstructionsService,
      moduleOptions,
    );

    service = built.instance;
  });

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      AgentInstructionsService,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(AgentInstructionsService);
  });

  describe("findUnlinkedProjects", () => {
    it("names a project with instructions and no link, a wrong link, or a real file, never a linked or instruction-less one", () => {
      expect.hasAssertions();

      const workspaceRoot = createWorkspace();

      expect(
        service.findUnlinkedProjects(workspaceRoot).toSorted(),
      ).toStrictEqual([
        "missing",
        "projects/domain/real-file",
        "projects/wrong",
      ]);
    });
  });

  describe("linkProjects", () => {
    it("links CLAUDE.md to AGENTS.md, replaces a wrong symlink, and refuses a real file", () => {
      expect.hasAssertions();

      const workspaceRoot = createWorkspace();
      const outcome = service.linkProjects(workspaceRoot, [
        "missing",
        "projects/domain/real-file",
        "projects/wrong",
      ]);

      expect(outcome.refused).toStrictEqual(["projects/domain/real-file"]);
      expect(readlinkSync(path.join(workspaceRoot, "missing/CLAUDE.md"))).toBe(
        "AGENTS.md",
      );
      expect(
        readlinkSync(path.join(workspaceRoot, "projects/wrong/CLAUDE.md")),
      ).toBe("AGENTS.md");
      expect(
        lstatSync(
          path.join(workspaceRoot, "projects/domain/real-file/CLAUDE.md"),
        ).isSymbolicLink(),
      ).toBe(false);
      expect(
        readFileSync(
          path.join(workspaceRoot, "projects/domain/real-file/CLAUDE.md"),
          "utf8",
        ),
      ).toBe("kept\n");
    });

    it("leaves nothing unlinked once every linkable project is linked", () => {
      expect.hasAssertions();

      const workspaceRoot = createWorkspace();

      service.linkProjects(
        workspaceRoot,
        service
          .findUnlinkedProjects(workspaceRoot)
          .filter((projectPath) => projectPath !== "projects/domain/real-file"),
      );

      expect(service.findUnlinkedProjects(workspaceRoot)).toStrictEqual([
        "projects/domain/real-file",
      ]);
    });
  });
});
