import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { IssueGithubService } from "./issue-github.service";
import { IssueLabelingService } from "./issue-labeling.service";
import { IssueLabelsService } from "./issue-labels.service";

import type { TestingModuleOptions } from "@codebase/testing/nestjs";

/** What IssueLabelingService is built with. */
const DEPENDENCIES = {
  mocks: [IssueGithubService, IssueLabelsService],
} satisfies TestingModuleOptions;

describe(IssueLabelingService, () => {
  let service: IssueLabelingService;
  let github: IssueGithubService;
  let labels: IssueLabelsService;

  beforeAll(async () => {
    const built = await buildTestingModule(IssueLabelingService, DEPENDENCIES);

    service = built.instance;
    github = built.mock(IssueGithubService);
    labels = built.mock(IssueLabelsService);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(github.isAvailable).mockReturnValue(true);
    vi.mocked(github.describeFailure).mockReturnValue("HTTP 403");
  });

  const options = { body: "", existingLabelNames: [], issueNumber: "9" };

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      IssueLabelingService,
      DEPENDENCIES,
    );

    expect(instance).toBeInstanceOf(IssueLabelingService);
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
