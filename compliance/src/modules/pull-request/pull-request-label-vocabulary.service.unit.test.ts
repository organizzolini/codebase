import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { PullRequestGithubService } from "./pull-request-github.service";
import { PullRequestLabelVocabularyService } from "./pull-request-label-vocabulary.service";
import { PullRequestLabelsService } from "./pull-request-labels.service";

import type { GithubCliResult } from "./pull-request-github.types";

const label = { color: "ffffff", description: "d", name: "type: feat" };

function result(succeeded: boolean): GithubCliResult {
  return {
    available: true,
    standardError: "",
    standardOutput: "[]",
    succeeded,
  };
}

describe(PullRequestLabelVocabularyService, () => {
  let service: PullRequestLabelVocabularyService;
  let github: PullRequestGithubService;
  let labels: PullRequestLabelsService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PullRequestLabelVocabularyService,
        {
          provide: PullRequestGithubService,
          useValue: createMock<PullRequestGithubService>(),
        },
        {
          provide: PullRequestLabelsService,
          useValue: createMock<PullRequestLabelsService>(),
        },
      ],
    }).compile();

    service = await module.resolve(PullRequestLabelVocabularyService);
    github = await module.resolve(PullRequestGithubService);
    labels = await module.resolve(PullRequestLabelsService);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(github.run).mockReturnValue(result(true));
    vi.mocked(github.describeFailure).mockReturnValue("HTTP 403");
    vi.mocked(labels.planReconciliation).mockReturnValue({
      creations: [],
      staleNames: [],
      updates: [],
    });
  });

  const options = { write: false, writeHint: "hint" };

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it("warns, without failing, when the labels cannot be listed", () => {
    vi.mocked(github.run).mockReturnValue(result(false));

    const outcome = service.reconcile(options);

    expect(outcome.failures).toStrictEqual([]);
    expect(outcome.lines[0]).toContain("gh label list failed");
  });

  it("warns when the comparison throws", () => {
    vi.mocked(labels.planReconciliation).mockImplementation(() => {
      throw new Error("bad config");
    });

    expect(service.reconcile(options).lines[0]).toContain("bad config");
  });

  it("warns when the comparison throws a non-error", () => {
    const thrown: unknown = "bad string";

    vi.mocked(labels.planReconciliation).mockImplementation(() => {
      throw thrown;
    });

    expect(service.reconcile(options).lines[0]).toContain("bad string");
  });

  it("confirms a vocabulary that matches, naming stale labels", () => {
    vi.mocked(labels.planReconciliation).mockReturnValue({
      creations: [],
      staleNames: ["type: old"],
      updates: [],
    });

    const { lines } = service.reconcile(options);

    expect(lines[0]).toContain("All conventional labels are present");
    expect(lines[1]).toContain("type: old");
  });

  it("describes drift without writing", () => {
    vi.mocked(labels.planReconciliation).mockReturnValue({
      creations: [label],
      staleNames: [],
      updates: [{ ...label, name: "type: fix" }],
    });

    const { lines } = service.reconcile(options);

    expect(lines.join("\n")).toContain("Missing label: type: feat");
    expect(lines.join("\n")).toContain("Drifted label: type: fix");
    expect(lines.at(-1)).toContain("hint");
    expect(github.run).toHaveBeenCalledExactlyOnceWith([
      "label",
      "list",
      "--limit",
      "500",
      "--json",
      "name,color,description",
    ]);
  });

  it("creates and updates labels when writing", () => {
    vi.mocked(labels.planReconciliation).mockReturnValue({
      creations: [label],
      staleNames: [],
      updates: [{ ...label, name: "type: fix" }],
    });

    const { lines } = service.reconcile({ ...options, write: true });

    expect(lines).toStrictEqual([
      "- ✅ Created label: type: feat",
      "- ✅ Updated label: type: fix",
    ]);
  });

  it("reports a label that cannot be written", () => {
    vi.mocked(labels.planReconciliation).mockReturnValue({
      creations: [label],
      staleNames: [],
      updates: [],
    });
    vi.mocked(github.run)
      .mockReturnValueOnce(result(true))
      .mockReturnValueOnce(result(false));

    expect(service.reconcile({ ...options, write: true }).lines[0]).toContain(
      "gh label create failed for type: feat",
    );
  });
});
