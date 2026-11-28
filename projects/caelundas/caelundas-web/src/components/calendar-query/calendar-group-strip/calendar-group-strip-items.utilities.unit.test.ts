import { describe, expect, it } from "vitest";

import {
  dropListedRows,
  isOfferedRow,
  nestTagItems,
  toRowValues,
  toTaggedIds,
} from "./calendar-group-strip-items.utilities";
import { createGroupItems } from "./calendar-group-strip.utilities";
import { createEventGroupFields } from "./components/event-group-model/event-group-fields.utilities";

import type { EventFacetValue } from "../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type { CascaderNode } from "@codebase/presentation";

const BODY: EventFacetValue[] = [
  { count: 3, depth: 1, id: "planet", name: "Planet", path: "Planet" },
  {
    count: 2,
    depth: 2,
    id: "personal",
    isGroupable: false,
    name: "Personal",
    path: "Planet / Personal",
  },
  {
    alsoUnder: ["Body / Benefic"],
    count: 1,
    depth: 3,
    id: "venus",
    name: "Venus",
    path: "Planet / Personal / Venus",
  },
  { count: 1, depth: 1, id: "benefic", name: "Benefic", path: "Benefic" },
  {
    alsoUnder: ["Body / Planet / Personal"],
    count: 1,
    depth: 2,
    id: "venus",
    name: "Venus",
    note: "Love",
    path: "Benefic / Venus",
  },
  {
    count: 1,
    depth: 1,
    id: "point",
    isGroupable: false,
    name: "Point",
    path: "Point",
  },
];
const GROUP = { flag: "isGroupable", leaves: true } as const;
const NO_NODE: CascaderNode = { label: "", value: "" };

/** The rows a menu lists beneath the Body root. */
function bodyRows(
  menu: Parameters<typeof createGroupItems>[1],
): CascaderNode[] {
  const fields = createEventGroupFields([
    { id: "body", name: "Body", values: BODY },
  ]);
  const [tag] = createGroupItems(fields, menu);

  return tag?.children?.[0]?.children ?? [];
}

describe("tag items", () => {
  it("lists a tag under two parents as a row under each, with one id and an also-under cue", () => {
    const [planet, benefic] = bodyRows(GROUP);
    const venusUnderPlanet = planet?.children?.[0]?.children?.[0];
    const venusUnderBenefic = benefic?.children?.[0];

    expect(venusUnderPlanet?.value).toBe("venus@@Planet / Personal / Venus");
    expect(venusUnderBenefic?.value).toBe("venus@@Benefic / Venus");
    expect(venusUnderPlanet?.description).toBe("1 event · also Benefic");
    expect(venusUnderBenefic?.description).toBe(
      "Love · 1 event · also Personal",
    );
    expect(toRowValues(["venus"], [{ values: BODY }])).toStrictEqual([
      "venus@@Planet / Personal / Venus",
      "venus@@Benefic / Venus",
    ]);
  });

  it("keeps a tag the menu leaves out as a folder that only opens, when tags beneath it are offered", () => {
    const [planet] = bodyRows(GROUP);
    const personal = planet?.children?.[0];

    expect(personal?.label).toBe("Personal");
    expect(isOfferedRow(personal ?? NO_NODE)).toBe(false);
    expect(isOfferedRow(planet ?? NO_NODE)).toBe(true);
  });

  it("drops a tag the menu leaves out when nothing beneath it is offered, so no folder is empty", () => {
    expect(bodyRows(GROUP).map((item) => item.label)).toStrictEqual([
      "Planet",
      "Benefic",
    ]);
  });

  it("lists only the tags with tags beneath them, each once, when leaves are not listed", () => {
    const rows = bodyRows({ flag: "isGroupable", leaves: false });

    expect(rows.map((item) => item.label)).toStrictEqual(["Planet", "Benefic"]);
    expect(rows[0]?.children).toBeUndefined();
    expect(
      bodyRows({ flag: "isSortable", leaves: false })[0]?.children?.map(
        (item) => item.label,
      ),
    ).toStrictEqual(["Personal"]);
  });

  it("offers every tag whose flag is absent", () => {
    const fields = createEventGroupFields([
      {
        id: "body",
        name: "Body",
        values: [{ count: 1, depth: 1, id: "a", name: "A", path: "A" }],
      },
    ]);
    const [tag] = createGroupItems(fields, {
      flag: "isSortable",
      leaves: true,
    });

    expect(
      tag?.children?.[0]?.children?.map((item) => item.value),
    ).toStrictEqual(["a"]);
  });

  it("leaves a root out of a menu that offers neither it nor a tag in it, and keeps one that offers a tag as a folder", () => {
    const hidden = createEventGroupFields([
      {
        id: "body",
        isGroupable: false,
        name: "Body",
        values: [
          {
            count: 1,
            depth: 1,
            id: "a",
            isGroupable: false,
            name: "A",
            path: "A",
          },
        ],
      },
      {
        id: "sign",
        isGroupable: false,
        name: "Sign",
        values: [{ count: 1, depth: 1, id: "b", name: "B", path: "B" }],
      },
    ]);
    const [tag] = createGroupItems(hidden, GROUP);
    const [sign] = tag?.children ?? [];

    expect(tag?.children).toHaveLength(1);
    expect(sign?.label).toBe("Sign");
    expect(isOfferedRow(sign ?? NO_NODE)).toBe(false);
  });

  describe(toTaggedIds, () => {
    const both = ["venus@@Planet / Personal / Venus", "venus@@Benefic / Venus"];

    it("ticks a shared tag everywhere when one of its rows is ticked", () => {
      expect(toTaggedIds([both[0] ?? ""], [])).toStrictEqual(["venus"]);
    });

    it("clears it everywhere when one of its rows is cleared", () => {
      expect(toTaggedIds([both[1] ?? ""], both)).toStrictEqual([]);
    });

    it("keeps the other ticked tags", () => {
      expect(toTaggedIds(["sun", ...both], [...both])).toStrictEqual([
        "sun",
        "venus",
      ]);
      expect(toTaggedIds([], ["sun"])).toStrictEqual([]);
    });
  });

  describe(toRowValues, () => {
    it("passes the ids of unshared tags through", () => {
      expect(toRowValues(["benefic"], [{ values: BODY }])).toStrictEqual([
        "benefic",
      ]);
    });
  });

  it("never promotes the rows beneath a repeated tag to the level above it", () => {
    const node = (label: string): CascaderNode => ({ label, value: label });
    const rows = [
      { depth: 1, id: "a", node: node("A") },
      { depth: 2, id: "s", node: node("S") },
      { depth: 1, id: "b", node: node("B") },
      { depth: 2, id: "s", node: node("S again") },
      { depth: 3, id: "t", node: node("T") },
    ];
    const nested = nestTagItems(dropListedRows(rows, false));

    expect(nested.map((item) => item.label)).toStrictEqual(["A", "B"]);
    expect(nested[0]?.children?.map((item) => item.label)).toStrictEqual(["S"]);
    expect(nested[1]?.children).toBeUndefined();
  });

  it("holds the units of a root the menu leaves out in its folder, listing none at the top level", () => {
    const fields = createEventGroupFields([
      {
        id: "duration",
        isGroupable: false,
        name: "Duration",
        values: [
          { count: 2, depth: 1, id: "hours", name: "Hours", path: "Hours" },
          { count: 1, depth: 1, id: "days", name: "Days", path: "Days" },
        ],
      },
    ]);
    const [tag] = createGroupItems(fields, GROUP);
    const [duration] = tag?.children ?? [];

    expect(tag?.children).toHaveLength(1);
    expect(duration?.label).toBe("Duration");
    expect(isOfferedRow(duration ?? NO_NODE)).toBe(false);
    expect(duration?.children?.map((item) => item.label)).toStrictEqual([
      "Hours",
      "Days",
    ]);
  });
});
