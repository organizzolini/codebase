import { describe, expect, it } from "vitest";

import {
  classifyChanges,
  parseChangedPaths,
  renderSummary,
  retryDelay,
  scanOutput,
} from "./refresh-documentation.utilities";

/** The 429 body OpenWiki printed in run 45072817322, trimmed to its reset. */
const RATE_LIMITED = [
  'Rate limit exceeded: free-models-per-min.  | metadata: {"headers":{"X-RateLimit-Limit":"20","X-RateLimit-Reset":"1795383360000"}}',
  String.raw`    "bodyPreview": "{\"error\":{\"metadata\":{\"headers\":{\"X-RateLimit-Reset\":\"1795383840000\"}}}}",`,
].join("\n");

const BOOKKEEPING = [
  "documentation/openwiki/.last-update.json",
  "documentation/openwiki/.page-manifest.json",
];

describe("refresh-documentation utilities", () => {
  describe(scanOutput, () => {
    it("reads the furthest page a single worker reached", () => {
      expect.hasAssertions();
      expect(
        scanOutput(
          "Planning repository wiki\nDocumenting page 1 of 5 · /a.md\nDocumenting page 2 of 5 · /b.md\n",
        ).pages,
      ).toBe(2);
    });

    it("reads the completed count several workers report", () => {
      expect.hasAssertions();
      expect(
        scanOutput("Documenting 3 of 8 · 2 in flight: /a.md, /b.md\n").pages,
      ).toBe(3);
    });

    it("reports no pages when none were documented", () => {
      expect.hasAssertions();
      expect(scanOutput("Finalizing repository wiki\n").pages).toBe(0);
    });

    it("takes the latest reset from plain and escaped JSON", () => {
      expect.hasAssertions();
      expect(scanOutput(RATE_LIMITED).rateLimitResetAt).toBe(1_795_383_840_000);
    });

    it("reports no reset when the output names none", () => {
      expect.hasAssertions();
      expect(scanOutput("all fine").rateLimitResetAt).toBeUndefined();
    });
  });

  describe(retryDelay, () => {
    const now = 1_000_000;

    it.each([
      [1, 120_000],
      [2, 240_000],
      [3, 360_000],
    ])(
      "grows with the attempt when nothing reports a reset: attempt %i",
      (attempt, delay) => {
        expect.hasAssertions();
        expect(retryDelay(attempt, undefined, now)).toBe(delay);
      },
    );

    it("never waits less than the growing wait for a soon reset", () => {
      expect.hasAssertions();
      expect(retryDelay(1, now + 10_000, now)).toBe(120_000);
    });

    it("ignores a reset already past", () => {
      expect.hasAssertions();
      expect(retryDelay(2, now - 60_000, now)).toBe(240_000);
    });

    it("waits for a reset beyond the growing wait, plus a margin", () => {
      expect.hasAssertions();
      expect(retryDelay(1, now + 400_000, now)).toBe(405_000);
    });

    it("waits for a reset at the patience limit", () => {
      expect.hasAssertions();
      expect(retryDelay(1, now + 900_000, now)).toBe(905_000);
    });

    it("gives up on a reset past the patience limit", () => {
      expect.hasAssertions();
      expect(retryDelay(1, now + 900_001, now)).toBeUndefined();
    });
  });

  describe(parseChangedPaths, () => {
    it("lists modified, untracked and renamed paths", () => {
      expect.hasAssertions();
      expect(
        parseChangedPaths(" M a/b.md\n?? c.md\nR  old.md -> new.md\n"),
      ).toStrictEqual(["a/b.md", "c.md", "new.md"]);
    });

    it("lists nothing for a clean tree", () => {
      expect.hasAssertions();
      expect(parseChangedPaths("")).toStrictEqual([]);
    });
  });

  describe(classifyChanges, () => {
    it("reports no change for no paths", () => {
      expect.hasAssertions();
      expect(classifyChanges([])).toBe("none");
    });

    it("reports bookkeeping when only the two bookkeeping files changed", () => {
      expect.hasAssertions();
      expect(classifyChanges(BOOKKEEPING)).toBe("bookkeeping");
    });

    it("reports content when a page changed beside them", () => {
      expect.hasAssertions();
      expect(
        classifyChanges([
          ...BOOKKEEPING,
          "documentation/openwiki/quickstart.md",
        ]),
      ).toBe("content");
    });

    it("reports content for a claims file, which is not bookkeeping", () => {
      expect.hasAssertions();
      expect(
        classifyChanges(["documentation/openwiki/.claims/quickstart.json"]),
      ).toBe("content");
    });
  });

  describe(renderSummary, () => {
    it("lists one row per attempt with its result, pages and reset", () => {
      expect.hasAssertions();

      const summary = renderSummary(
        [
          { pages: 0, rateLimitResetAt: 1_795_383_360_000, succeeded: false },
          { pages: 5, rateLimitResetAt: undefined, succeeded: true },
        ],
        "content",
      );

      expect(summary).toContain(
        "| 1 | ❌ Failed | 0 | 2026-11-22T21:36:00.000Z |",
      );
      expect(summary).toContain("| 2 | ✅ Succeeded | 5 | — |");
      expect(summary).toContain("The wiki's pages changed.");
    });

    it("says so when no attempt succeeded", () => {
      expect.hasAssertions();
      expect(
        renderSummary(
          [{ pages: 0, rateLimitResetAt: undefined, succeeded: false }],
          undefined,
        ),
      ).toContain("No attempt succeeded.");
    });

    it("says no pull request opens for bookkeeping only", () => {
      expect.hasAssertions();
      expect(renderSummary([], "bookkeeping")).toContain(
        "no pull request opens",
      );
    });
  });
});
