import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { IssuePlanService } from "./issue-plan.service";

describe(IssuePlanService, () => {
  let service: IssuePlanService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [IssuePlanService],
    }).compile();

    service = await module.resolve(IssuePlanService);
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it("is read-only for a number given on the command line", () => {
    const resolution = service.resolve(["12"], undefined, {});

    expect(resolution).toMatchObject({
      ok: true,
      plan: { allIssues: false, number: "12", writable: false },
    });
  });

  it("is writable when `write` is given", () => {
    const resolution = service.resolve(["12", "write"], undefined, {});

    expect(resolution).toMatchObject({ ok: true, plan: { writable: true } });
  });

  it("sweeps every issue for the all option or flag", () => {
    expect(service.resolve([], { all: true }, {})).toMatchObject({
      ok: true,
      plan: { allIssues: true, writable: false },
    });
    expect(service.resolve(["--all"], undefined, {})).toMatchObject({
      ok: true,
      plan: { allIssues: true },
    });
  });

  it("sweeps and writes on a schedule", () => {
    const resolution = service.resolve([], undefined, {
      GITHUB_EVENT_NAME: "schedule",
    });

    expect(resolution).toMatchObject({
      ok: true,
      plan: { allIssues: true, writable: true },
    });
  });

  it("plans a newly opened issue from the event environment", () => {
    const resolution = service.resolve([], undefined, {
      GITHUB_EVENT_NAME: "issues",
      ISSUE_ACTION: "opened",
      ISSUE_ASSIGNEES: "[]",
      ISSUE_BODY: "body",
      ISSUE_LABELS: JSON.stringify([{ name: "bug" }, "docs"]),
      ISSUE_NUMBER: "7",
    });

    expect(resolution).toStrictEqual({
      ok: true,
      plan: {
        allIssues: false,
        body: "body",
        labelNames: ["bug", "docs"],
        needsAssignee: true,
        newlyOpened: true,
        number: "7",
        writable: true,
      },
    });
  });

  it("treats a present assignee as assigned", () => {
    const resolution = service.resolve([], undefined, {
      GITHUB_EVENT_NAME: "issues",
      ISSUE_ASSIGNEES: JSON.stringify([{ login: "someone" }]),
      ISSUE_LABELS: "not json",
      ISSUE_NUMBER: "7",
    });

    expect(resolution).toMatchObject({
      ok: true,
      plan: { labelNames: [], needsAssignee: false },
    });
  });

  it("treats an unusable assignee document as unassigned", () => {
    for (const document of [undefined, "", "not json", "{}"]) {
      const resolution = service.resolve([], undefined, {
        GITHUB_EVENT_NAME: "issues",
        ISSUE_ASSIGNEES: document,
        ISSUE_NUMBER: "7",
      });

      expect(resolution).toMatchObject({
        ok: true,
        plan: { needsAssignee: true },
      });
    }
  });

  it("fails without a number, a sweep, or an event", () => {
    const resolution = service.resolve([], undefined, {});

    expect(resolution).toMatchObject({ ok: false });
  });

  it("fails on more than one name", () => {
    expect(service.resolve(["1", "2"], undefined, {})).toMatchObject({
      ok: false,
    });
    expect(service.resolve(["--all", "2"], undefined, {})).toMatchObject({
      ok: false,
    });
  });

  it("fails on a non-numeric number", () => {
    expect(service.resolve(["abc"], undefined, {})).toMatchObject({
      ok: false,
    });
  });
});
