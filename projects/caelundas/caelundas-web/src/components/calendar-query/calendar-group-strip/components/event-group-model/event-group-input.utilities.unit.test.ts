import { describe, expect, it } from "vitest";

import { toEventGroupingInput } from "./event-group-input.utilities";

describe(toEventGroupingInput, () => {
  it("writes nothing for no grouping", () => {
    expect(toEventGroupingInput([])).toBeNull();
  });

  it("writes the levels in order, a tag root's depth or its picked tags", () => {
    expect(
      toEventGroupingInput([
        { depth: 1, field: "tag:tag-aspect" },
        { field: "tag:tag-body", tags: ["tag-mars", "tag-venus"] },
        { field: "month" },
      ]),
    ).toStrictEqual({
      levels: [
        { depth: 1, field: "tag:tag-aspect" },
        { field: "tag:tag-body", tags: ["tag-mars", "tag-venus"] },
        { field: "month" },
      ],
    });
  });
});
