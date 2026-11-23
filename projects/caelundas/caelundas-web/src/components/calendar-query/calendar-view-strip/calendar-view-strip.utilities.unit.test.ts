import { describe, expect, it } from "vitest";

import { EMPTY_EVENT_FILTER } from "../calendar-filters/components/event-filter-model/event-filter-tree.constants";

import {
  findActiveViewId,
  getViewFilter,
  listViewChoices,
} from "./calendar-view-strip.utilities";

const PRESET = {
  description: "Every ingress.",
  filter: {
    combinator: "and" as const,
    id: "ingress-0",
    rules: [
      {
        id: "ingress-0-0",
        operator: "is_any_of",
        path: ["tag:tag-type"],
        type: "rule" as const,
        value: ["tag-ingress"],
      },
    ],
    type: "group" as const,
  },
  id: "ingress",
  name: "Ingress",
};

describe("calendar-view-strip utilities", () => {
  describe(listViewChoices, () => {
    it("lists each preset, then every event", () => {
      expect(
        listViewChoices([PRESET]).map((choice) => choice.id),
      ).toStrictEqual(["ingress", "all-events"]);
    });
  });

  describe(findActiveViewId, () => {
    it("names all events for no filter, a preset for its filter, and custom for any other", () => {
      expect(findActiveViewId([PRESET], EMPTY_EVENT_FILTER)).toBe("all-events");
      expect(findActiveViewId([PRESET], PRESET.filter)).toBe("ingress");
      expect(
        findActiveViewId([PRESET], {
          ...PRESET.filter,
          rules: [{ ...PRESET.filter.rules[0], value: ["tag-other"] }],
        } as never),
      ).toBe("custom");
    });
  });

  describe(getViewFilter, () => {
    it("gives a preset's filter, and none for all events, nothing picked or a preset the data lost", () => {
      expect(getViewFilter([PRESET], "ingress")).toBe(PRESET.filter);
      expect(getViewFilter([PRESET], "all-events")).toBe(EMPTY_EVENT_FILTER);
      expect(getViewFilter([PRESET], undefined)).toBe(EMPTY_EVENT_FILTER);
      expect(getViewFilter([PRESET], "retired")).toBe(EMPTY_EVENT_FILTER);
    });
  });
});
