import { describe, expect, it } from "vitest";

import { fixtureMeander } from "../../../testing/meanders-api";

import { appendPage, planCardsRead } from "./use-group-cards.utilities";

import type { MeandersPage } from "../../components/gallery/meander-gallery/meanders-api.types";

/** A page of fixture meanders. */
function pageOf(...positions: number[]): MeandersPage {
  return {
    edges: positions.map((position) => ({
      cursor: String(position),
      node: fixtureMeander(position),
    })),
    pageInfo: { endCursor: String(positions.at(-1)), hasNextPage: true },
    totalCount: 10,
  };
}

describe("use group cards utilities", () => {
  describe(appendPage, () => {
    it("adds a page to a group's cards, moving its cursor on", () => {
      const first = appendPage({}, "g", pageOf(0, 1));
      const next = appendPage(first, "g", pageOf(2));

      expect(next["g"]?.meanders).toHaveLength(3);
      expect(next["g"]?.endCursor).toBe("2");
    });

    it("shows a meander read twice once, as a stale cursor would read it", () => {
      const first = appendPage({}, "g", pageOf(0, 1));
      const again = appendPage(first, "g", pageOf(0, 1, 2));

      expect(again["g"]?.meanders.map(({ id }) => id)).toStrictEqual([
        fixtureMeander(0).id,
        fixtureMeander(1).id,
        fixtureMeander(2).id,
      ]);
    });
  });

  describe(planCardsRead, () => {
    it("reads after the cursor of the last page for one sort or none", () => {
      const held = {
        endCursor: "9",
        error: undefined,
        hasMore: true,
        meanders: [],
      };

      expect(planCardsRead(held, 1)).toStrictEqual({ after: "9" });
      expect(planCardsRead(undefined, 0)).toStrictEqual({ after: undefined });
    });

    it("reads past the cards held for several sorts", () => {
      const held = {
        endCursor: "9",
        error: undefined,
        hasMore: true,
        meanders: [fixtureMeander(0), fixtureMeander(1)],
      };

      expect(planCardsRead(held, 2)).toStrictEqual({ offset: 2 });
      expect(planCardsRead(undefined, 3)).toStrictEqual({ offset: 0 });
    });
  });
});
