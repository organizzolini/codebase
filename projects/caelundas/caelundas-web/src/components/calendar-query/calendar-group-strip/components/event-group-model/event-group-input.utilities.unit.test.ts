import { describe, expect, it } from "vitest";

import { toEventGroupingInput } from "./event-group-input.utilities";

describe(toEventGroupingInput, () => {
  it("writes nothing for no grouping and no color", () => {
    expect(toEventGroupingInput([], undefined)).toBeNull();
  });

  it("writes the levels in order, a tag root's depth or its picked tags", () => {
    expect(
      toEventGroupingInput(
        [
          { depth: 1, field: "tag:tag-aspect" },
          { field: "tag:tag-body", tags: ["tag-mars", "tag-venus"] },
          { field: "month" },
        ],
        undefined,
      ),
    ).toStrictEqual({
      levels: [
        { depth: 1, field: "tag:tag-aspect" },
        { field: "tag:tag-body", tags: ["tag-mars", "tag-venus"] },
        { field: "month" },
      ],
    });
  });

  it("writes the level the events are colored by beside the levels", () => {
    expect(
      toEventGroupingInput([{ field: "year" }], {
        depth: 2,
        field: "tag:tag-body",
        tags: [],
      }),
    ).toStrictEqual({
      colorBy: { depth: 2, field: "tag:tag-body" },
      levels: [{ field: "year" }],
    });
  });

  it("writes a color with no grouping at all", () => {
    expect(
      toEventGroupingInput([], { depth: 1, field: "tag:tag-body" }),
    ).toStrictEqual({ colorBy: { depth: 1, field: "tag:tag-body" } });
  });
});
