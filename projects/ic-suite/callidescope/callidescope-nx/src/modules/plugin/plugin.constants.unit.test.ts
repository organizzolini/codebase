import { describe, expect, it } from "vitest";

import {
  ProjectConfigurationPathMismatchError,
  ProjectTsconfigPathMismatchError,
  reportUnreadProjects,
} from "./plugin.constants";

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

describe.each([
  ["projectConfigurationPath", ProjectConfigurationPathMismatchError],
  ["projectTsconfigPath", ProjectTsconfigPathMismatchError],
])("the %s mismatch error", (setting, MismatchError) => {
  it("quotes the path the workspace configuration declares", () => {
    const error = new MismatchError({
      configurationPath: "callidescope.config.ts",
      declared: "configuration/a.ts",
      registered: "configuration/b.ts",
    });

    expect(error.message).toBe(
      `The nx.json registration sets ${setting} to "configuration/b.ts", but callidescope.config.ts sets "configuration/a.ts". Both must name the same path.`,
    );
  });

  it("says none when the workspace configuration declares no path", () => {
    const error = new MismatchError({
      configurationPath: "callidescope.config.ts",
      declared: undefined,
      registered: "configuration/b.ts",
    });

    expect(error.message).toContain("callidescope.config.ts sets none.");
  });
});
