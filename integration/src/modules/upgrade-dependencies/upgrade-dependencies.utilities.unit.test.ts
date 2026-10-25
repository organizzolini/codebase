import { describe, expect, it } from "vitest";

import {
  renderPullRequestBody,
  summaryOf,
  warningsOf,
} from "./upgrade-dependencies.utilities";

const URL = "https://example.test/run/1";
const updated = {
  changes: "2 files changed, 3 insertions(+)",
  label: "Upgrade pnpm",
  summary: "pnpm 12.14.0",
  warnings: [],
};
const unchanged = { changes: "", label: "Upgrade skills", warnings: [] };
const skipped = [
  {
    changes: "",
    label: "Upgrade node",
    skipped: { exitCode: 1, tail: "first\nno mature version" },
    warnings: [],
  },
  {
    changes: "",
    label: "Upgrade Impeccable",
    skipped: { exitCode: 7, tail: "boom" },
    warnings: [],
  },
];

describe("upgrade-dependencies utilities", () => {
  describe(summaryOf, () => {
    it("takes the last summary line", () => {
      expect.hasAssertions();
      expect(summaryOf("a\nsummary: one\nsummary: two \nb")).toBe("two");
    });

    it("finds nothing when there is none", () => {
      expect.hasAssertions();
      expect(summaryOf("no summary here")).toBeUndefined();
    });
  });

  describe(warningsOf, () => {
    it("keeps distinct warning lines", () => {
      expect.hasAssertions();
      expect(warningsOf("ok\n⚠ stale\n  ⚠ stale\n⚠ other")).toStrictEqual([
        "⚠ stale",
        "⚠ other",
      ]);
    });

    it("ignores a line that only mentions a warning", () => {
      expect.hasAssertions();
      expect(
        warningsOf('. postinstall$ echo "⚠️  could not run"'),
      ).toStrictEqual([]);
    });

    it("caps how many it keeps", () => {
      expect.hasAssertions();
      expect(
        warningsOf(
          Array.from({ length: 30 }, (_, n) => `⚠ ${String(n)}`).join("\n"),
        ),
      ).toHaveLength(10);
    });
  });

  describe(renderPullRequestBody, () => {
    it("writes the four required sections in order", () => {
      expect.hasAssertions();

      const body = renderPullRequestBody([updated], URL);

      expect(body.match(/^## .+$/gmu)).toStrictEqual([
        "## 🌰 Summary",
        "## 📝 Details",
        "## 🧪 Testing",
        "## 🔗 Related",
      ]);
    });

    it("links the run that generated it", () => {
      expect.hasAssertions();
      expect(renderPullRequestBody([updated], URL)).toContain(`(${URL})`);
    });

    it("says what each step came to", () => {
      expect.hasAssertions();

      const body = renderPullRequestBody([updated, unchanged], URL);

      expect(body).toContain(
        "- ✅ **Upgrade pnpm**: pnpm 12.14.0, 2 files changed, 3 insertions(+)",
      );
      expect(body).toContain("- ➖ **Upgrade skills**: already up to date");
    });

    it("reports a change without a version", () => {
      expect.hasAssertions();
      expect(
        renderPullRequestBody([{ ...updated, summary: undefined }], URL),
      ).toContain("- ✅ **Upgrade pnpm**: 2 files changed");
    });

    it("keeps the version of a step that changed nothing", () => {
      expect.hasAssertions();
      expect(
        renderPullRequestBody([{ ...unchanged, summary: "pnpm 1" }], URL),
      ).toContain("already up to date (pnpm 1)");
    });

    it("says nothing about skips or warnings when there were none", () => {
      expect.hasAssertions();

      const body = renderPullRequestBody([updated], URL);

      expect(body).not.toContain("Skipped");
      expect(body).not.toContain("⚠️");
    });

    it("warns in the summary and leads the details with each skipped step", () => {
      expect.hasAssertions();

      const body = renderPullRequestBody([updated, ...skipped], URL);
      const details = body.split("## 📝 Details\n\n")[1] ?? "";

      expect(body).toContain("⚠️ 2 upgrade step(s) were skipped");
      expect(
        details.startsWith(
          "- ⚠️ **Upgrade node** skipped (exit 1) and undone: `no mature version`",
        ),
      ).toBe(true);
      expect(details).toContain("**Upgrade Impeccable** skipped (exit 7)");
    });

    it("closes with each skipped step's error in a collapsed block", () => {
      expect.hasAssertions();

      const body = renderPullRequestBody(skipped, URL);

      expect(body.indexOf("## ⚠️ Skipped Upgrades")).toBeGreaterThan(
        body.indexOf("## 🔗 Related"),
      );
      expect(body).toContain("<summary>Upgrade node (exit 1)</summary>");
      expect(body).toContain("```text\nfirst\nno mature version\n```");
    });

    it("does not let an error's own code fence end the block early", () => {
      expect.hasAssertions();

      const body = renderPullRequestBody(
        [
          {
            changes: "",
            label: "Step",
            skipped: { exitCode: 1, tail: "a\n```\nb" },
            warnings: [],
          },
        ],
        URL,
      );

      expect(body.match(/```/gu)).toHaveLength(2);
    });

    it("lists warnings after the related section", () => {
      expect.hasAssertions();

      const body = renderPullRequestBody(
        [{ ...updated, warnings: ["⚠ a `skill` is stale"] }],
        URL,
      );

      expect(body.indexOf("## ⚠️ Warnings")).toBeGreaterThan(
        body.indexOf("## 🔗 Related"),
      );
      expect(body).toContain("- **Upgrade pnpm**: `⚠ a 'skill' is stale`");
    });
  });
});
