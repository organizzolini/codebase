import { describe, expect, it } from "vitest";

import * as core from "./index";
import {
  COINAGERIE_EMOJI,
  COINAGERIE_END_ANCHOR,
  COINAGERIE_HEADING,
  COINAGERIE_START_ANCHOR,
  ConfigurationFileNotFoundError,
  InvalidConfigurationError,
  MalformedGlossaryError,
} from "./index";

describe("coinagerie-core index", () => {
  it("exports the expected constants, module, and errors", () => {
    expect(Object.keys(core).toSorted()).toStrictEqual(
      [
        "COINAGERIE_EMOJI",
        "COINAGERIE_END_ANCHOR",
        "COINAGERIE_HEADING",
        "COINAGERIE_START_ANCHOR",
        "CoinagerieCoreModule",
        "CoinagerieCoreService",
        "ConfigurationFileNotFoundError",
        "InvalidConfigurationError",
        "MalformedGlossaryError",
      ].toSorted(),
    );
  });

  it.each([
    [COINAGERIE_EMOJI, "🪙"],
    [COINAGERIE_START_ANCHOR, "<!-- coinagerie:start -->"],
    [COINAGERIE_END_ANCHOR, "<!-- coinagerie:end -->"],
    [COINAGERIE_HEADING, "## 🪙 Coinagerie"],
  ])("spells the constant %j exactly", (actual, expected) => {
    expect(actual).toBe(expected);
  });

  it("names the file a configuration was looked for in", () => {
    const error = new ConfigurationFileNotFoundError(
      "/repo/coinagerie.config.ts",
    );

    expect(error.name).toBe("ConfigurationFileNotFoundError");
    expect(error.message).toContain("/repo/coinagerie.config.ts");
  });

  it("names the configuration file and the reason it was refused", () => {
    const error = new InvalidConfigurationError(
      "/repo/coinagerie.config.ts",
      "include: expected array",
    );

    expect(error.name).toBe("InvalidConfigurationError");
    expect(error.message).toContain("/repo/coinagerie.config.ts");
    expect(error.message).toContain("include: expected array");
  });

  it("names the glossary file, the line, and why it could not be parsed", () => {
    const error = new MalformedGlossaryError({
      line: 7,
      path: "/repo/README.md",
      reason: "duplicate word",
    });

    expect(error.name).toBe("MalformedGlossaryError");
    expect(error.message).toContain("/repo/README.md:7");
    expect(error.message).toContain("duplicate word");
  });

  it("names only the file when the fault belongs to the whole file", () => {
    const error = new MalformedGlossaryError({
      path: "/repo/README.md",
      reason: "missing end anchor",
    });

    expect(error.message).toContain("/repo/README.md");
    expect(error.message).not.toContain("undefined");
  });
});
