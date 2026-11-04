import { describe, expect, it } from "vitest";

import * as configuration from "./index";

describe("coinagerie-configuration index", () => {
  it("exports the configuration module, its service, and its defaults", () => {
    expect(Object.keys(configuration).toSorted()).toStrictEqual(
      [
        "CONFIGURATION_FILE_NAMES",
        "ConfigurationModule",
        "ConfigurationService",
        "DEFAULT_INCLUDE",
      ].toSorted(),
    );
  });
});
