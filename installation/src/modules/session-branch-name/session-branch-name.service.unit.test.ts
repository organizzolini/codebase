import path from "node:path";

import { beforeAll, describe, expect, it } from "vitest";

import { useWorkingDirectory } from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { SessionBranchNameGitService } from "./session-branch-name-git.service";
import { SessionBranchNameService } from "./session-branch-name.service";

/** The repository this suite runs in, whose real branch rules are read. */
const REPOSITORY_ROOT = path.resolve(import.meta.dirname, "../../../..");

const moduleOptions = { mocks: [SessionBranchNameGitService] };

describe(SessionBranchNameService, () => {
  let service: SessionBranchNameService;

  beforeAll(async () => {
    const built = await buildTestingModule(
      SessionBranchNameService,
      moduleOptions,
    );

    service = built.instance;
  });

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      SessionBranchNameService,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(SessionBranchNameService);
  });

  it("reads the pattern the pre-push hook enforces from the workspace root", () => {
    useWorkingDirectory(REPOSITORY_ROOT);

    const rules = service.readBranchNameRules();

    expect(rules.pattern.test("refactor/validation-session-checks")).toBe(true);
    expect(rules.pattern.test("dependabot/npm/zod")).toBe(true);
    expect(rules.pattern.test("Refactor/validation")).toBe(false);
  });

  // validate-branch-name compiles the pattern without the unicode flag, under
  // which an escape it accepts, such as \-, would be a syntax error here.
  it("compiles the pattern as validate-branch-name does, without flags", () => {
    useWorkingDirectory(REPOSITORY_ROOT);

    expect(service.readBranchNameRules().pattern.flags).toBe("");
  });
});
