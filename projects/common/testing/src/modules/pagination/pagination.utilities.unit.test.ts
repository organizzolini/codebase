import { describe, expect, it } from "vitest";

import { toCursor } from "@codebase/interface";

import {
  expectedPage,
  paginateArray,
  paginationMatrix,
  summarize,
} from "./pagination.utilities";

// 🧪 Tests

/** The ids of the members a matrix test pages over. */
const IDS = ["a", "b", "c", "d", "e"];

describe("pagination, the oracle SQL paging agrees with", () => {
  describe(paginateArray, () => {
    const items = [
      { id: "1", name: "one" },
      { id: "2", name: "two" },
      { id: "3", name: "three" },
      { id: "4", name: "four" },
    ];
    const getCursor = (item: { id: string }): string => `cursor-${item.id}`;

    it("paginates from the beginning with first limit", () => {
      expect.hasAssertions();

      const result = paginateArray(items, {
        first: 2,
        getCursor,
      });

      expect(result.edges).toHaveLength(2);
      expect(result.edges[0]?.node).toStrictEqual({ id: "1", name: "one" });
      expect(result.edges[1]?.node).toStrictEqual({ id: "2", name: "two" });
      expect(result.hasNextPage).toBe(true);
      expect(result.hasPreviousPage).toBe(false);
    });

    it("paginates after a cursor", () => {
      expect.hasAssertions();

      const result = paginateArray(items, {
        after: "cursor-2",
        first: 2,
        getCursor,
      });

      expect(result.edges).toHaveLength(2);
      expect(result.edges[0]?.node).toStrictEqual({ id: "3", name: "three" });
      expect(result.edges[1]?.node).toStrictEqual({ id: "4", name: "four" });
      expect(result.hasNextPage).toBe(false);
      expect(result.hasPreviousPage).toBe(true);
    });

    it("handles after cursor not found in list", () => {
      expect.hasAssertions();

      const result = paginateArray(items, {
        after: "cursor-missing",
        first: 2,
        getCursor,
      });

      expect(result.edges).toHaveLength(2);
      expect(result.edges[0]?.node).toStrictEqual({ id: "1", name: "one" });
      expect(result.hasNextPage).toBe(true);
      expect(result.hasPreviousPage).toBe(false);
    });

    it("returns all items when first is not specified", () => {
      expect.hasAssertions();

      const result = paginateArray(items, {
        getCursor,
      });

      expect(result.edges).toHaveLength(4);
      expect(result.hasNextPage).toBe(false);
      expect(result.hasPreviousPage).toBe(false);
    });

    it("paginates backwards with last and before parameters", () => {
      expect.hasAssertions();

      const result = paginateArray(items, {
        before: "cursor-4",
        getCursor,
        last: 2,
      });

      expect(result.edges).toHaveLength(2);
      expect(result.edges[0]?.node).toStrictEqual({ id: "2", name: "two" });
      expect(result.edges[1]?.node).toStrictEqual({ id: "3", name: "three" });
      expect(result.hasNextPage).toBe(true);
      expect(result.hasPreviousPage).toBe(true);
    });

    it("handles before cursor not found in list", () => {
      expect.hasAssertions();

      const result = paginateArray(items, {
        before: "cursor-missing",
        getCursor,
        last: 2,
      });

      expect(result.edges).toHaveLength(2);
      expect(result.edges[0]?.node).toStrictEqual({ id: "3", name: "three" });
      expect(result.edges[1]?.node).toStrictEqual({ id: "4", name: "four" });
    });

    it("paginates within both after and before bounds", () => {
      expect.hasAssertions();

      const result = paginateArray(items, {
        after: "cursor-1",
        before: "cursor-4",
        first: 1,
        getCursor,
      });

      expect(result.edges).toHaveLength(1);
      expect(result.edges[0]?.node).toStrictEqual({ id: "2", name: "two" });
      expect(result.hasNextPage).toBe(true);
      expect(result.hasPreviousPage).toBe(true);
    });

    it("handles first and last larger than array length or negative values", () => {
      expect.hasAssertions();

      const largeFirstResult = paginateArray(items, {
        first: 100,
        getCursor,
      });

      expect(largeFirstResult.edges).toHaveLength(4);
      expect(largeFirstResult.hasNextPage).toBe(false);

      const largeLastResult = paginateArray(items, {
        getCursor,
        last: 100,
      });

      expect(largeLastResult.edges).toHaveLength(4);
      expect(largeLastResult.hasPreviousPage).toBe(false);

      const negativeResult = paginateArray(items, {
        first: -5,
        getCursor,
        last: -5,
      });

      expect(negativeResult.edges).toHaveLength(4);

      const crossedCursorsResult = paginateArray(items, {
        after: "cursor-3",
        before: "cursor-2",
        getCursor,
      });

      expect(crossedCursorsResult.edges).toHaveLength(0);
    });
  });

  describe(expectedPage, () => {
    it("summarizes the page in-memory slicing gives, cursors encoded as { id }", () => {
      expect(
        expectedPage(IDS, { after: toCursor({ id: "b" }), first: 2 }),
      ).toStrictEqual({
        endCursor: toCursor({ id: "d" }),
        hasNextPage: true,
        hasPreviousPage: true,
        ids: ["c", "d"],
        startCursor: toCursor({ id: "c" }),
        totalCount: 5,
      });
    });

    it("encodes cursors the way it is told", () => {
      const cursorOf = (id: string): string => `cursor-${id}`;

      expect(expectedPage(IDS, { last: 1 }, cursorOf)).toMatchObject({
        endCursor: "cursor-e",
        ids: ["e"],
        startCursor: "cursor-e",
      });
    });

    it("reports no cursors for an empty page", () => {
      expect(expectedPage(IDS, { first: 0 })).toMatchObject({
        endCursor: undefined,
        ids: [],
        startCursor: undefined,
      });
    });
  });

  describe(paginationMatrix, () => {
    it("crosses every bound with every count", () => {
      const matrix = paginationMatrix(IDS, "z");

      // One unbounded entry, seven cursors as after and as before, and four pairs.
      expect(matrix).toHaveLength((1 + 7 + 7 + 4) * 8);
      expect(matrix).toContainEqual({ after: "not-a-cursor", first: 2 });
      expect(matrix).toContainEqual({
        before: toCursor({ id: "z" }),
        last: -1,
      });
      expect(matrix).toContainEqual({
        after: toCursor({ id: "e" }),
        before: toCursor({ id: "a" }),
        first: 2,
        last: 1,
      });
    });

    it("keeps a quick matrix to the middle member, the outsider, and one pair", () => {
      const matrix = paginationMatrix(IDS, "z", { quick: true });

      expect(matrix).toHaveLength((1 + 2 + 2 + 1) * 3);
      expect(matrix).toContainEqual({ after: toCursor({ id: "c" }), last: 2 });
    });

    it("encodes member cursors the way it is told", () => {
      const matrix = paginationMatrix(IDS, "z", {
        cursorOf: (id) => `cursor-${id}`,
        quick: true,
      });

      expect(matrix).toContainEqual({ before: "cursor-z" });
    });

    it("still builds a matrix over no members at all", () => {
      expect(paginationMatrix([], "z", { quick: true })).toContainEqual({
        after: toCursor({ id: undefined }),
        before: toCursor({ id: undefined }),
      });
    });
  });

  describe(summarize, () => {
    it("reduces a connection to what a client can observe of it", () => {
      expect(
        summarize({
          edges: [{ cursor: "cursor-a", node: { id: "a" } }],
          pageInfo: {
            endCursor: "cursor-a",
            hasNextPage: false,
            hasPreviousPage: true,
            startCursor: "cursor-a",
          },
          totalCount: 4,
        }),
      ).toStrictEqual({
        endCursor: "cursor-a",
        hasNextPage: false,
        hasPreviousPage: true,
        ids: ["a"],
        startCursor: "cursor-a",
        totalCount: 4,
      });
    });
  });
});
