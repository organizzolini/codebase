import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { IssueMetadataTypeService } from "./issue-metadata-type.service";

describe(IssueMetadataTypeService, () => {
  let service: IssueMetadataTypeService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [IssueMetadataTypeService],
    }).compile();

    service = await module.resolve(IssueMetadataTypeService);
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(service).toBeDefined();
  });

  describe("check", () => {
    it.each([
      ["Feature", false],
      ["Bug", false],
      ["Task", true],
    ])("accepts %s when hasParent is %s", (issueType, hasParent) => {
      expect.hasAssertions();

      const record = vi.fn<(failure: string, ...commands: string[]) => void>();
      service.check("7", { hasParent, issueType }, record);

      expect(record).not.toHaveBeenCalled();
    });

    it.each([[{ hasParent: true }], [{ issueType: "Task" }], [{}]])(
      "skips when the source could not say (%j)",
      (facts) => {
        expect.hasAssertions();

        const record =
          vi.fn<(failure: string, ...commands: string[]) => void>();
        service.check("7", facts, record);

        expect(record).not.toHaveBeenCalled();
      },
    );

    it.each(["Task", null])("rejects a root typed %s", (issueType) => {
      expect.hasAssertions();

      const record = vi.fn<(failure: string, ...commands: string[]) => void>();
      service.check("7", { hasParent: false, issueType }, record);

      expect(record).toHaveBeenCalledWith(
        `❌ A root issue must have the Bug or Feature issue type (found: ${issueType ?? "none"})`,
        "gh issue edit 7 --type Bug",
        "gh issue edit 7 --type Feature",
      );
    });

    it.each(["Feature", "Bug", null])(
      "rejects a sub-issue typed %s",
      (issueType) => {
        expect.hasAssertions();

        const record =
          vi.fn<(failure: string, ...commands: string[]) => void>();
        service.check("7", { hasParent: true, issueType }, record);

        expect(record).toHaveBeenCalledWith(
          `❌ A sub-issue must have the Task issue type (found: ${issueType ?? "none"})`,
          "gh issue edit 7 --type Task",
        );
      },
    );
  });

  describe("readFromDocument", () => {
    it("reads nothing from a document with no issueType field", () => {
      expect.hasAssertions();
      expect(service.readFromDocument({ body: "" }, "")).toStrictEqual({});
    });

    it("reads the type and the native parent", () => {
      expect.hasAssertions();
      expect(
        service.readFromDocument(
          { issueType: { name: "Task" }, parent: { number: 3 } },
          "",
        ),
      ).toStrictEqual({ hasParent: true, issueType: "Task" });
    });

    it("reads an unset type and a parent named only in the body", () => {
      expect.hasAssertions();
      expect(
        service.readFromDocument(
          { issueType: null, parent: null },
          "Part of #3",
        ),
      ).toStrictEqual({ hasParent: true, issueType: null });
    });

    it("reads a root", () => {
      expect.hasAssertions();
      expect(
        service.readFromDocument(
          { issueType: { name: "Bug" }, parent: null },
          "text",
        ),
      ).toStrictEqual({ hasParent: false, issueType: "Bug" });
    });
  });

  describe("readFromSummary", () => {
    const base = { body: "", labels: [], number: 1, title: "t" };

    it("reads nothing from an issue listed without a type field", () => {
      expect.hasAssertions();
      expect(service.readFromSummary(base)).toStrictEqual({});
    });

    it("reads a typed sub-issue", () => {
      expect.hasAssertions();
      expect(
        service.readFromSummary({
          ...base,
          issueType: { name: "Task" },
          parent: { number: 2 },
        }),
      ).toStrictEqual({ hasParent: true, issueType: "Task" });
    });

    it("reads an untyped root", () => {
      expect.hasAssertions();
      expect(
        service.readFromSummary({ ...base, issueType: null, parent: null }),
      ).toStrictEqual({ hasParent: false, issueType: null });
    });
  });
});
