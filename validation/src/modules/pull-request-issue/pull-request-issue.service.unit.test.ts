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
        exempt: false,
        issueNumbers: [12, 34],
        resolved: true,
      });
    });

    it("reads an empty list as no issues", () => {
      expect.hasAssertions();

      expect(
        service.resolveFromDocument('{"closingIssuesReferences":[]}'),
      ).toStrictEqual({ exempt: false, issueNumbers: [], resolved: true });
    });

    it("reads a missing or malformed field as no issues", () => {
      expect.hasAssertions();

      expect(service.resolveFromDocument("{}")).toStrictEqual({
        exempt: false,
        issueNumbers: [],
        resolved: true,
      });
      expect(
        service.resolveFromDocument('{"closingIssuesReferences":"nope"}'),
      ).toStrictEqual({ exempt: false, issueNumbers: [], resolved: true });
    });

    it.each(["app/dependabot", "dependabot[bot]", "dependabot"])(
      "exempts a pull request authored by %s",
      (login) => {
        expect.hasAssertions();

        expect(
          service.resolveFromDocument(JSON.stringify({ author: { login } })),
        ).toStrictEqual(expect.objectContaining({ exempt: true }));
      },
    );

    it.each(["JimmyPaolini", "app/claude", "not-dependabot"])(
      "does not exempt a pull request authored by %s",
      (login) => {
        expect.hasAssertions();

        expect(
          service.resolveFromDocument(JSON.stringify({ author: { login } })),
        ).toStrictEqual(expect.objectContaining({ exempt: false }));
      },
    );

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
