import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { PullRequestDescendantIssuesService } from "./pull-request-descendant-issues.service";
import { PullRequestGithubService } from "./pull-request-github.service";

import type { GithubCliResult } from "./pull-request-github.types";

function output(standardOutput: string): GithubCliResult {
  return {
    available: true,
    standardError: "",
    standardOutput,
    succeeded: true,
  };
}

describe(PullRequestDescendantIssuesService, () => {
  let service: PullRequestDescendantIssuesService;
  let github: PullRequestGithubService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PullRequestDescendantIssuesService,
        {
          provide: PullRequestGithubService,
          useValue: createMock<PullRequestGithubService>(),
        },
      ],
    }).compile();

    service = await module.resolve(PullRequestDescendantIssuesService);
    github = await module.resolve(PullRequestGithubService);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(github.describeFailure).mockReturnValue("HTTP 500");
  });

  /** Answers each sub-issues request from a map of issue to child lines. */
  function stubChildren(children: Record<string, string>): void {
    vi.mocked(github.run).mockImplementation((arguments_) => {
      const issue = /issues\/(?<number>\d+)\/sub_issues/u.exec(
        arguments_[2] ?? "",
      )?.groups?.["number"];

      return output(children[issue ?? ""] ?? "");
    });
  }

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it("returns nothing when the issues have no sub-issues", () => {
    stubChildren({});

    expect(service.collect([5])).toStrictEqual({ ok: true, value: [] });
  });

  it("walks every level, keeping only open issues without repeats", () => {
    stubChildren({
      "5": "6 open\n7 closed\nnoise\n",
      "6": "8 open\n5 open\n",
      "7": "9 open\n",
    });

    expect(service.collect([5])).toStrictEqual({
      ok: true,
      value: [6, 8, 9],
    });
  });

  it("fails when sub-issues cannot be read", () => {
    vi.mocked(github.run).mockReturnValue({
      available: true,
      standardError: "",
      standardOutput: "",
      succeeded: false,
    });

    expect(service.collect([5])).toStrictEqual({
      failure: "❌ Unable to read sub-issues of issue 5: HTTP 500",
      ok: false,
    });
  });
});
