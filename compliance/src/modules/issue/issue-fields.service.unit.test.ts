import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { EFFORT_FIELD } from "./issue-fields.constants";
import { IssueFieldsService } from "./issue-fields.service";

describe(IssueFieldsService, () => {
  let service: IssueFieldsService;
  const record = vi.fn<(failure: string, ...commands: string[]) => void>();

  beforeAll(async () => {
    const { instance } = await buildTestingModule(IssueFieldsService);

    service = instance;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(IssueFieldsService);

    expect(instance).toBeInstanceOf(IssueFieldsService);
  });

  it("records an empty field with the command that sets it", () => {
    service.checkField(
      { fieldNames: ["Priority"], issueNumber: "9" },
      EFFORT_FIELD,
      record,
    );

    expect(record).toHaveBeenCalledExactlyOnceWith(
      "❌ No Effort issue field",
      `echo '{"issue_field_values":[{"field_id":46460698,"value":"<Low|Medium|High>"}]}' | gh api -X PUT repos/{owner}/{repo}/issues/9/issue-field-values --input -`,
    );
  });

  it("records nothing for a filled field", () => {
    service.checkField(
      { fieldNames: ["Effort"], issueNumber: "9" },
      EFFORT_FIELD,
      record,
    );

    expect(record).not.toHaveBeenCalled();
  });

  it("wants a Priority on a root issue", () => {
    service.checkPriority("9", { fieldNames: [], hasParent: false }, record);

    expect(record).toHaveBeenCalledWith(
      "❌ No Priority issue field",
      expect.stringContaining('"field_id":46460695'),
    );
  });

  it("passes a root issue that has a Priority", () => {
    service.checkPriority(
      "9",
      { fieldNames: ["Priority"], hasParent: false },
      record,
    );

    expect(record).not.toHaveBeenCalled();
  });

  it.each([
    { facts: { fieldNames: [], hasParent: true }, reason: "a sub-issue" },
    { facts: { hasParent: false }, reason: "unread fields" },
    { facts: { fieldNames: [] }, reason: "an unread parent" },
  ])("skips the Priority rule for $reason", ({ facts }) => {
    service.checkPriority("9", facts, record);

    expect(record).not.toHaveBeenCalled();
  });
});
