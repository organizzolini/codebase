import { describe, expect, it } from "vitest";

import { ConfigurationPathRequiredError } from "./configuration.constants";

describe(ConfigurationPathRequiredError, () => {
  it("names the surface that left the path out, and that nothing is searched", () => {
    const error = new ConfigurationPathRequiredError("--config");

    expect(error.name).toBe("ConfigurationPathRequiredError");
    expect(error.message).toBe(
      "--config is required: coinagerie never searches for or assumes a configuration file. Pass the path to a coinagerie configuration file, such as coinagerie.config.ts.",
    );
  });
});
