import { describe, expect, it } from "vitest";

import { renderPullRequestBody } from "./upgrade-dependencies.utilities";

const URL = "https://example.test/workflow";
const skipped = [
  { exitCode: 1, label: "Upgrade pnpm", tail: "no mature version" },
  { exitCode: 7, label: "Upgrade skills", tail: "boom" },
];

describe(renderPullRequestBody, () => {
  it("writes the four required sections in order", () => {
    expect.hasAssertions();

    const body = renderPullRequestBody([], URL);
    const headings = body.match(/^## .+$/gmu);

    expect(headings).toStrictEqual([
      "## 🌰 Summary",
      "## 📝 Details",
      "## 🧪 Testing",
      "## 🔗 Related",
    ]);
  });

  it("links the workflow that generated it", () => {
    expect.hasAssertions();
    expect(renderPullRequestBody([], URL)).toContain(`(${URL})`);
  });

  it("says nothing about skipped steps when none were", () => {
    expect.hasAssertions();

    const body = renderPullRequestBody([], URL);

    expect(body).not.toContain("Skipped");
    expect(body).not.toContain("⚠️");
  });

  it("warns in the summary and leads the details with each skipped step", () => {
    expect.hasAssertions();

    const body = renderPullRequestBody(skipped, URL);
    const details = body.split("## 📝 Details\n\n")[1] ?? "";

    expect(body).toContain("⚠️ 2 upgrade step(s) were skipped");
    expect(details.startsWith("- ⚠️ Skipped **Upgrade pnpm** (exit 1)")).toBe(
      true,
    );
    expect(details).toContain("- ⚠️ Skipped **Upgrade skills** (exit 7)");
  });

  it("closes with each skipped step's error in a collapsed block", () => {
    expect.hasAssertions();

    const body = renderPullRequestBody(skipped, URL);

    expect(body.indexOf("## ⚠️ Skipped Upgrades")).toBeGreaterThan(
      body.indexOf("## 🔗 Related"),
    );
    expect(body).toContain("<summary>Upgrade pnpm (exit 1)</summary>");
    expect(body).toContain("```text\nno mature version\n```");
  });

  it("does not let an error's own code fence end the block early", () => {
    expect.hasAssertions();

    const body = renderPullRequestBody(
      [{ exitCode: 1, label: "Step", tail: "a\n```\nb" }],
      URL,
    );

    expect(body.match(/```/gu)).toHaveLength(2);
  });
});
