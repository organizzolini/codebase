import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { createTemporaryDirectory } from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { PullRequestContextService } from "./pull-request-context.service";
import { PullRequestGithubService } from "./pull-request-github.service";

import type { PullRequestContext } from "./pull-request-context.types";
import type { GithubCliResult } from "./pull-request-github.types";
import type { TestingModuleOptions } from "@codebase/testing/nestjs";

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

/** What PullRequestContextService is built with. */
const DEPENDENCIES = {
  mocks: [PullRequestGithubService],
} satisfies TestingModuleOptions;

describe(PullRequestContextService, () => {
  let service: PullRequestContextService;
  let github: PullRequestGithubService;

  beforeAll(async () => {
    const built = await buildTestingModule(
      PullRequestContextService,
      DEPENDENCIES,
    );

    service = built.instance;
    github = built.mock(PullRequestGithubService);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(github.describeFailure).mockReturnValue("HTTP 404");
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      PullRequestContextService,
      DEPENDENCIES,
    );

    expect(instance).toBeInstanceOf(PullRequestContextService);
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
      const outputFile = path.join(
        createTemporaryDirectory("pull-request-context"),
        "out",
      );

      service.writeStepOutputs(context, { GITHUB_OUTPUT: outputFile });

      expect(readFileSync(outputFile, "utf8")).toBe(
        "pull-request-number=12\npull-request-author=someone\n",
      );
    });

    it("appends to what the output file already holds", () => {
      const outputFile = path.join(
        createTemporaryDirectory("pull-request-context"),
        "out",
      );

      writeFileSync(outputFile, "earlier=1\n", "utf8");
      service.writeStepOutputs(context, { GITHUB_OUTPUT: outputFile });

      expect(readFileSync(outputFile, "utf8")).toBe(
        "earlier=1\npull-request-number=12\npull-request-author=someone\n",
      );
    });

    it("does nothing without an output file", () => {
      const directory = createTemporaryDirectory("pull-request-context");

      service.writeStepOutputs(context, {});

      expect(readdirSync(directory)).toStrictEqual([]);
    });
  });
});
