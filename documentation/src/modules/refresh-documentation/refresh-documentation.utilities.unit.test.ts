import { describe, expect, it } from "vitest";

import {
  classifyChanges,
  countPages,
  isComplete,
  madeProgress,
  parseChangedPaths,
  renderSummary,
  retryDelay,
  scanOutput,
} from "./refresh-documentation.utilities";

import type { OpenWikiAttempt } from "./refresh-documentation.types";

/** An attempt that ended as given, for the page-count tests. */
function attempt(overrides: Partial<OpenWikiAttempt> = {}): OpenWikiAttempt {
  return {
    pages: 0,
    rateLimitResetAt: undefined,
    skipped: 0,
    succeeded: true,
    total: 0,
    ...overrides,
  };
}

const SKIPPED_PAGES = [
  "Documenting page 1 of 3 · /a.md",
  "Documenting page 2 of 3 · /b.md",
  "/b.md was restored after its worker exited without submitting. It was skipped for this update and will be reconsidered on the next update.",
  "Documenting page 3 of 3 · /c.md",
  "/c.md was restored after its worker exited without submitting. It was skipped for this update and will be reconsidered on the next update.",
  "",
].join("\n");

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

    it("reads how many pages the run set out to document", () => {
      expect.hasAssertions();
      expect(scanOutput(SKIPPED_PAGES).total).toBe(3);
    });

    it("counts each page whose worker ended without submitting once", () => {
      expect.hasAssertions();
      expect(scanOutput(`${SKIPPED_PAGES}${SKIPPED_PAGES}`).skipped).toBe(2);
    });

    it("reports no skipped pages when every worker submitted", () => {
      expect.hasAssertions();
      expect(scanOutput("Documenting page 1 of 1 · /a.md\n").skipped).toBe(0);
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

  describe(countPages, () => {
    it("counts every page of the first attempt less those the last clean one skipped", () => {
      expect.hasAssertions();
      expect(
        countPages([
          attempt({ skipped: 30, total: 35 }),
          attempt({ skipped: 10, total: 30 }),
        ]),
      ).toStrictEqual({ refreshed: 25, skipped: 10, total: 35 });
    });

    it("ignores a failed attempt after a clean one", () => {
      expect.hasAssertions();
      expect(
        countPages([
          attempt({ skipped: 2, total: 5 }),
          attempt({ succeeded: false }),
        ]),
      ).toStrictEqual({ refreshed: 3, skipped: 2, total: 5 });
    });

    it("counts every page as skipped when no attempt was clean", () => {
      expect.hasAssertions();
      expect(
        countPages([attempt({ succeeded: false, total: 4 })]),
      ).toStrictEqual({ refreshed: 0, skipped: 4, total: 4 });
    });

    it("counts nothing when there were no attempts", () => {
      expect.hasAssertions();
      expect(countPages([])).toStrictEqual({
        refreshed: 0,
        skipped: 0,
        total: 0,
      });
    });
  });

  describe(isComplete, () => {
    it.each([
      [true, 0, true],
      [true, 3, false],
      [false, 0, false],
    ])(
      "is %s for a clean=%s run that skipped %s pages",
      (succeeded, skipped, expected) => {
        expect.hasAssertions();
        expect(isComplete(attempt({ skipped, succeeded }))).toBe(expected);
      },
    );
  });

  describe(madeProgress, () => {
    it("holds when a clean run documented some pages", () => {
      expect.hasAssertions();
      expect(madeProgress([attempt({ skipped: 30, total: 35 })])).toBe(true);
    });

    it("fails when every page was skipped", () => {
      expect.hasAssertions();
      expect(madeProgress([attempt({ skipped: 35, total: 35 })])).toBe(false);
    });

    it("holds when a clean run named no pages", () => {
      expect.hasAssertions();
      expect(madeProgress([attempt()])).toBe(true);
    });

    it("fails when no attempt was clean", () => {
      expect.hasAssertions();
      expect(madeProgress([attempt({ succeeded: false })])).toBe(false);
    });
  });

  describe(renderSummary, () => {
    it("lists one row per attempt with its result, pages, skips and reset", () => {
      expect.hasAssertions();

      const summary = renderSummary(
        [
          attempt({
            rateLimitResetAt: 1_795_383_360_000,
            succeeded: false,
          }),
          attempt({ pages: 5, total: 5 }),
        ],
        "content",
      );

      expect(summary).toContain(
        "| 1 | ❌ Failed | 0 | 0 | 2026-11-22T21:36:00.000Z |",
      );
      expect(summary).toContain("| 2 | ✅ Succeeded | 5 | 0 | — |");
      expect(summary).toContain("The wiki's pages changed.");
      expect(summary).toContain("Refreshed 5 of 5 pages.");
    });

    it("marks a clean run that skipped pages as partial and counts what is left", () => {
      expect.hasAssertions();

      const summary = renderSummary(
        [attempt({ pages: 35, skipped: 30, total: 35 })],
        "content",
      );

      expect(summary).toContain("| 1 | ⚠️ Partial | 35 | 30 | — |");
      expect(summary).toContain(
        "Refreshed 5 of 35 pages. 30 skipped, to be reconsidered on the next run.",
      );
    });

    it("says so when no attempt succeeded", () => {
      expect.hasAssertions();
      expect(
        renderSummary([attempt({ succeeded: false })], undefined),
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
