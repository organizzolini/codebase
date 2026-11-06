import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { IssueGithubService } from "./issue-github.service";
import { IssueLabelingService } from "./issue-labeling.service";
import { IssueLabelsService } from "./issue-labels.service";

describe(IssueLabelingService, () => {
  let service: IssueLabelingService;
  let github: IssueGithubService;
  let labels: IssueLabelsService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        IssueLabelingService,
        {
          provide: IssueGithubService,
          useValue: createMock<IssueGithubService>(),
        },
        {
          provide: IssueLabelsService,
          useValue: createMock<IssueLabelsService>(),
        },
      ],
    }).compile();

    service = await module.resolve(IssueLabelingService);
    github = await module.resolve(IssueGithubService);
    labels = await module.resolve(IssueLabelsService);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(github.isAvailable).mockReturnValue(true);
    vi.mocked(github.describeFailure).mockReturnValue("HTTP 403");
  });

  const options = { body: "", existingLabelNames: [], issueNumber: "9" };

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it("says nothing when no label is missing", () => {
    vi.mocked(labels.missingLabels).mockReturnValue([]);

    expect(service.label(options)).toStrictEqual([]);
  });

  it("skips labels when gh is missing", () => {
    vi.mocked(labels.missingLabels).mockReturnValue(["bug"]);
    vi.mocked(github.isAvailable).mockReturnValue(false);

    expect(service.label(options)).toStrictEqual([
      "⚠️ Skipping labels: gh is not available",
    ]);
  });

  it("reports each label added or failed", () => {
    vi.mocked(labels.missingLabels).mockReturnValue(["bug", "docs"]);
    vi.mocked(github.addLabel)
      .mockReturnValueOnce({
        available: true,
        standardError: "",
        standardOutput: "",
        succeeded: true,
      })
      .mockReturnValueOnce({
        available: true,
        standardError: "",
        standardOutput: "",
        succeeded: false,
      });

    expect(service.label(options)).toStrictEqual([
      "🏷️ Added bug to issue 9",
      "⚠️ Failed to add docs to issue 9: HTTP 403",
    ]);
  });
});
