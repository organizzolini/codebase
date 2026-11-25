import { describe, expect, it } from "vitest";

import { clipUnderStickyStack, planStickyRows } from "./table-sticky.utilities";

import type { StickyPlan, StickyRow } from "./calendar-table.types";

const HEIGHT = 36;
const SHOWN: StickyPlan = { clip: "", line: "", shift: "" };
const GONE: StickyPlan = {
  clip: "inset(100%)",
  line: "transparent",
  shift: "",
};

function body(top: number): StickyRow {
  return { bottom: top + HEIGHT, depth: undefined, stuck: false, top };
}

function group(depth: number, top: number): StickyRow {
  return {
    bottom: top + HEIGHT,
    depth,
    stuck: top <= depth * HEIGHT,
    top,
  };
}

describe("table sticky utilities", () => {
  describe(planStickyRows, () => {
    it("leaves rows alone when nothing is stuck", () => {
      expect(planStickyRows([group(0, 40), body(76)], 0)).toStrictEqual([
        SHOWN,
        SHOWN,
      ]);
    });

    it("keeps the stack, hides its inner dividers and the rows under it", () => {
      const rows = [group(0, 0), group(1, HEIGHT), body(HEIGHT), body(80)];

      expect(planStickyRows(rows, 0)).toStrictEqual([
        { clip: "", line: "transparent", shift: "" },
        SHOWN,
        GONE,
        SHOWN,
      ]);
    });

    it("cuts only the part of a row that is under the stack", () => {
      const rows = [group(0, 0), body(18)];

      expect(planStickyRows(rows, 0)[1]).toStrictEqual({
        clip: "inset(50% 0 0 0)",
        line: "",
        shift: "",
      });
    });

    it("hides a stuck group once a sibling after it has stuck", () => {
      const rows = [group(0, 0), group(1, HEIGHT), group(1, HEIGHT), body(80)];

      expect(planStickyRows(rows, 0).map((plan) => plan.clip)).toStrictEqual([
        "",
        "inset(100%)",
        "",
        "",
      ]);
    });

    it("hides deeper groups once a shallower group sticks", () => {
      const rows = [
        group(0, 0),
        group(1, HEIGHT),
        group(2, HEIGHT * 2),
        group(1, HEIGHT),
      ];

      expect(planStickyRows(rows, 0).map((plan) => plan.clip)).toStrictEqual([
        "",
        "inset(100%)",
        "inset(100%)",
        "",
      ]);
    });

    it("pushes the last stuck group up as the next section nears", () => {
      const rows = [group(0, 0), group(1, HEIGHT), group(1, 54)];

      expect(planStickyRows(rows, 0)[1]).toStrictEqual({
        clip: "inset(50% 0 0 0)",
        line: "transparent",
        shift: "translateY(-50%)",
      });
    });

    it("leaves the last stuck group in place while the next is far", () => {
      const rows = [group(0, 0), group(1, HEIGHT), group(1, 200)];

      expect(planStickyRows(rows, 0)[1]).toStrictEqual(SHOWN);
    });

    it("measures from the top of the scroller", () => {
      const rows = [
        { bottom: 136, depth: 0, stuck: true, top: 100 },
        { bottom: 172, depth: undefined, stuck: false, top: 136 },
      ];

      expect(planStickyRows(rows, 100)).toStrictEqual([SHOWN, SHOWN]);
    });
  });

  describe(clipUnderStickyStack, () => {
    function mount(): { container: HTMLElement; rows: HTMLElement[] } {
      const container = document.createElement("div");
      const table = document.createElement("table");
      const tbody = document.createElement("tbody");
      const edges: [number, number, string | undefined][] = [
        [0, 36, "0"],
        [2, 30, undefined],
        [18, 54, undefined],
        [100, 136, undefined],
      ];
      const rows = edges.map(([top, bottom, depth]) => {
        const row = document.createElement("tr");

        if (depth !== undefined) {
          row.dataset["depth"] = depth;
        }

        row.getBoundingClientRect = (): DOMRect => ({ bottom, top }) as DOMRect;
        tbody.append(row);

        return row;
      });

      container.getBoundingClientRect = (): DOMRect => ({ top: 0 }) as DOMRect;
      table.append(tbody);
      container.append(table);

      return { container, rows };
    }

    it("clips each row and hides the dividers the stack covers", () => {
      const { container, rows } = mount();

      clipUnderStickyStack(container);

      expect(rows.map((row) => row.style.clipPath)).toStrictEqual([
        "",
        "inset(100%)",
        "inset(50% 0px 0px)",
        "",
      ]);
      expect(rows.map((row) => row.style.borderBottomColor)).toStrictEqual([
        "",
        "transparent",
        "",
        "",
      ]);
    });

    it("does nothing without a scroller", () => {
      expect(() => {
        clipUnderStickyStack(null);
      }).not.toThrow();
    });
  });
});
