import { describe, expect, it } from "vitest";

import { fieldRule, filterGroup } from "../../../testing/event-filters";
import { EMPTY_EVENT_FILTER } from "../../components/calendar-filters/event-filter-tree.constants";
import { DEFAULT_PRESET_ID } from "../../components/calendar-filters/presets.constants";

import { getDefaultFilter } from "./use-filter-query.utilities";

describe(getDefaultFilter, () => {
  it("answers the default preset's filter", () => {
    const filter = filterGroup("and", fieldRule("hour", "between", [22, 23]));

    expect(
      getDefaultFilter([
        {
          description: "The events most worth a look.",
          filter,
          id: DEFAULT_PRESET_ID,
          name: "Highlights",
        },
      ]),
    ).toBe(filter);
  });

  it("answers no filter when the data has no default preset", () => {
    expect(getDefaultFilter([])).toBe(EMPTY_EVENT_FILTER);
  });
});
