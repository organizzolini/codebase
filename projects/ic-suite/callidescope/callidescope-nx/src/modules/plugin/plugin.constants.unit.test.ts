import { describe, expect, it } from "vitest";

import { reportUnreadProjects } from "./plugin.constants";

describe(reportUnreadProjects, () => {
  it("names one unread project in the singular", () => {
    const report = reportUnreadProjects(["alpha"]);

    expect(report).toContain("judged a project whose own code");
    expect(report).toContain("- `alpha`");
  });

  it("names several unread projects in the plural", () => {
    const report = reportUnreadProjects(["alpha", "beta"]);

    expect(report).toContain("judged projects whose own code");
    expect(report).toContain("- `beta`");
  });
});
