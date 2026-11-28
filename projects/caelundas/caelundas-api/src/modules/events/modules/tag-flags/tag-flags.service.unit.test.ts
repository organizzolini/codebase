import { getEntityManagerToken } from "@nestjs/typeorm";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { TagFlagsService } from "./tag-flags.service";

const query = vi.fn<(sql: string) => Promise<unknown[]>>();

describe(TagFlagsService, () => {
  let service: TagFlagsService;

  beforeEach(async () => {
    query.mockReset();
    ({ instance: service } = await buildTestingModule(TagFlagsService, {
      providers: [{ provide: getEntityManagerToken(), useValue: { query } }],
    }));
  });

  it("reads no flag when there is nothing to clean", async () => {
    await expect(service.sanitize({})).resolves.toStrictEqual({});
    expect(query).not.toHaveBeenCalled();
  });

  it("drops silently what the flags keep out of the filter, the levels and the color", async () => {
    query.mockResolvedValue([
      { id: "no-filter", is_filterable: false, is_groupable: true },
      { id: "no-group", is_filterable: true, is_groupable: false },
    ]);

    await expect(
      service.sanitize({
        colorBy: { field: "tag:root", parent: "no-group" },
        filter: {
          combinator: "and",
          rules: [
            {
              operator: "is_any_of",
              path: ["tag:root"],
              values: ["no-filter", "no-group"],
            },
          ],
        } as never,
        levels: [
          { field: "tag:root", parent: "no-filter" },
          { field: "tag:root", parent: "no-group" },
        ],
      }),
    ).resolves.toStrictEqual({
      colorBy: null,
      filter: {
        combinator: "and",
        groups: [],
        rules: [
          {
            operator: "is_any_of",
            path: ["tag:root"],
            values: ["no-group"],
          },
        ],
      },
      levels: [{ field: "tag:root", parent: "no-filter" }],
    });
  });
});
