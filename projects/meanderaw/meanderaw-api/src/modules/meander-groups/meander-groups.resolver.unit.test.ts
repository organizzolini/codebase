import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { MeanderGroupsResolver } from "./meander-groups.resolver";
import { MeanderGroupsService } from "./meander-groups.service";

describe(MeanderGroupsResolver, () => {
  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(MeanderGroupsResolver, {
      mocks: [MeanderGroupsService],
    });

    expect(instance).toBeInstanceOf(MeanderGroupsResolver);
  });

  it("hands its arguments to the service and returns the groups", async () => {
    expect.hasAssertions();

    const { instance, mock } = await buildTestingModule(MeanderGroupsResolver, {
      mocks: [MeanderGroupsService],
    });
    const groups = [{ count: 1, field: "rows", groups: [], value: "1" }];
    const arguments_ = { groupBy: [{ field: "rowsColumns" }] };

    mock(MeanderGroupsService).group.mockResolvedValue(groups);

    await expect(instance.meanderGroups(arguments_)).resolves.toBe(groups);
    expect(mock(MeanderGroupsService).group).toHaveBeenCalledWith(arguments_);
  });
});
