import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { PullRequestIssueService } from "./pull-request-issue.service";

describe(PullRequestIssueService, () => {
  let service: PullRequestIssueService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [PullRequestIssueService],
    }).compile();

    service = await module.resolve(PullRequestIssueService);
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(service).toBeDefined();
  });

  describe("resolveFromDocument", () => {
    it("reads every closing issue number", () => {
      expect.hasAssertions();

      const document = JSON.stringify({
        closingIssuesReferences: [{ number: 12 }, { number: 34 }],
      });

      expect(service.resolveFromDocument(document)).toStrictEqual({
        issueNumbers: [12, 34],
        resolved: true,
      });
    });

    it("reads an empty list as no issues", () => {
      expect.hasAssertions();

      expect(
        service.resolveFromDocument('{"closingIssuesReferences":[]}'),
      ).toStrictEqual({ issueNumbers: [], resolved: true });
    });

    it("reads a missing or malformed field as no issues", () => {
      expect.hasAssertions();

      expect(service.resolveFromDocument("{}")).toStrictEqual({
        issueNumbers: [],
        resolved: true,
      });
      expect(
        service.resolveFromDocument('{"closingIssuesReferences":"nope"}'),
      ).toStrictEqual({ issueNumbers: [], resolved: true });
    });

    it("fails on output that is not JSON", () => {
      expect.hasAssertions();

      const resolution = service.resolveFromDocument("not json");

      expect(resolution.resolved).toBe(false);
      expect(resolution).toStrictEqual(
        expect.objectContaining({
          failure: expect.stringContaining(
            "Unable to parse the gh pr view output",
          ) as unknown,
        }),
      );
    });
  });
});
