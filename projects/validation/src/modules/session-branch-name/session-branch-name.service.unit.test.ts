import path from "node:path";

import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { SessionBranchNameGitService } from "./session-branch-name-git.service";
import { SessionBranchNameService } from "./session-branch-name.service";

/** The repository this suite runs in, whose real branch rules are read. */
const REPOSITORY_ROOT = path.resolve(import.meta.dirname, "../../../../..");

describe(SessionBranchNameService, () => {
  let service: SessionBranchNameService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SessionBranchNameService,
        {
          provide: SessionBranchNameGitService,
          useValue: createMock<SessionBranchNameGitService>(),
        },
      ],
    }).compile();

    service = await module.resolve(SessionBranchNameService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it("reads the pattern the pre-push hook enforces from the workspace root", () => {
    vi.spyOn(process, "cwd").mockReturnValue(REPOSITORY_ROOT);

    const rules = service.readBranchNameRules();

    expect(rules.pattern.test("refactor/validation-session-checks")).toBe(true);
    expect(rules.pattern.test("dependabot/npm/zod")).toBe(true);
    expect(rules.pattern.test("Refactor/validation")).toBe(false);
  });
});
