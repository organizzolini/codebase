import { appendFileSync } from "node:fs";

import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { PullRequestContextService } from "./pull-request-context.service";
import { PullRequestGithubService } from "./pull-request-github.service";

import type { PullRequestContext } from "./pull-request-context.types";
import type { GithubCliResult } from "./pull-request-github.types";

vi.mock("node:fs", () => ({ appendFileSync: vi.fn() }));

const document = {
  assignees: ["owner"],
  author: "someone",
  body: null,
  draft: false,
  labels: ["type: feat"],
  number: 12,
  title: "feat(scope): add",
};

function succeeded(standardOutput: string): GithubCliResult {
  return {
    available: true,
    standardError: "",
    standardOutput,
    succeeded: true,
  };
}

describe(PullRequestContextService, () => {
  let service: PullRequestContextService;
  let github: PullRequestGithubService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PullRequestContextService,
        {
          provide: PullRequestGithubService,
          useValue: createMock<PullRequestGithubService>(),
        },
      ],
    }).compile();

    service = await module.resolve(PullRequestContextService);
    github = await module.resolve(PullRequestGithubService);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(github.describeFailure).mockReturnValue("HTTP 404");
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  describe("fetch", () => {
    it("reads the live context, defaulting a null body", () => {
      vi.mocked(github.run).mockReturnValue(
        succeeded(JSON.stringify(document)),
      );

      expect(service.fetch("12")).toStrictEqual({
        ok: true,
        value: { ...document, body: "" },
      });
    });

    it("fails when gh fails", () => {
      vi.mocked(github.run).mockReturnValue({
        available: true,
        standardError: "",
        standardOutput: "",
        succeeded: false,
      });

      expect(service.fetch("12")).toMatchObject({ ok: false });
    });

    it("fails on malformed output", () => {
      vi.mocked(github.run).mockReturnValue(succeeded("nope"));

      expect(service.fetch("12")).toMatchObject({ ok: false });
    });

    it("fails on a document of the wrong shape", () => {
      vi.mocked(github.run).mockReturnValue(succeeded("{}"));

      expect(service.fetch("12")).toMatchObject({ ok: false });
    });

    it("fails when GitHub returns another pull request", () => {
      vi.mocked(github.run).mockReturnValue(
        succeeded(JSON.stringify(document)),
      );

      expect(service.fetch("13")).toMatchObject({ ok: false });
    });
  });

  describe("resolveInvocation", () => {
    it("is read-only for a number on the command line", () => {
      expect(service.resolveInvocation(["12"], {})).toMatchObject({
        ok: true,
        value: { number: "12", writable: false },
      });
    });

    it("is writable for a number and `write`", () => {
      expect(service.resolveInvocation(["12", "write"], {})).toMatchObject({
        ok: true,
        value: { writable: true },
      });
    });

    it("never writes in a merge group", () => {
      expect(
        service.resolveInvocation(["12", "write"], {
          GITHUB_EVENT_NAME: "merge_group",
        }),
      ).toMatchObject({ ok: true, value: { writable: false } });
    });

    it("rejects surplus or misplaced arguments", () => {
      expect(service.resolveInvocation(["12", "x"], {}).ok).toBe(false);
      expect(service.resolveInvocation(["12", "write", "x"], {}).ok).toBe(
        false,
      );
    });

    it("rejects a number that is not a number", () => {
      expect(service.resolveInvocation(["abc"], {}).ok).toBe(false);
    });

    it("reads a merge group's number from HEAD_REF", () => {
      expect(
        service.resolveInvocation([], {
          GITHUB_EVENT_NAME: "merge_group",
          HEAD_REF: "refs/heads/gh-readonly-queue/main/pr-34-abc123",
        }),
      ).toMatchObject({ ok: true, value: { number: "34", writable: false } });
    });

    it("rejects a merge group without a usable HEAD_REF", () => {
      expect(
        service.resolveInvocation([], { GITHUB_EVENT_NAME: "merge_group" }).ok,
      ).toBe(false);
      expect(
        service.resolveInvocation([], {
          GITHUB_EVENT_NAME: "merge_group",
          HEAD_REF: "main",
        }).ok,
      ).toBe(false);
    });

    it("reads a pull_request event's number and writes", () => {
      expect(
        service.resolveInvocation([], {
          GITHUB_EVENT_NAME: "pull_request",
          PULL_REQUEST_NUMBER: "56",
        }),
      ).toMatchObject({ ok: true, value: { number: "56", writable: true } });
    });

    it("rejects a pull_request event without a number", () => {
      expect(
        service.resolveInvocation([], { GITHUB_EVENT_NAME: "pull_request" }).ok,
      ).toBe(false);
    });

    it("rejects any other event", () => {
      expect(service.resolveInvocation([], {}).ok).toBe(false);
      expect(
        service.resolveInvocation([], { GITHUB_EVENT_NAME: "push" }).ok,
      ).toBe(false);
    });
  });

  describe("writeStepOutputs", () => {
    const context: PullRequestContext = {
      ...document,
      body: "",
    };

    it("appends the number and author when there is an output file", () => {
      service.writeStepOutputs(context, { GITHUB_OUTPUT: "out" });

      expect(appendFileSync).toHaveBeenCalledWith(
        "out",
        "pull-request-number=12\npull-request-author=someone\n",
        "utf8",
      );
    });

    it("does nothing without an output file", () => {
      service.writeStepOutputs(context, {});

      expect(appendFileSync).not.toHaveBeenCalled();
    });
  });
});
