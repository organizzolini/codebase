import { describe, expect, it } from "vitest";

import { InputError, missingDirectoryError } from "./input.constants";

describe(missingDirectoryError, () => {
  it("names the generator and the flag to pass", () => {
    const error = missingDirectoryError({ generatorName: "widget" });

    expect(error).toBeInstanceOf(InputError);
    expect(error.message).toBe(
      "Generator widget cannot tell where to write its output. Pass --directory=<parent folder> (the folder the output is created inside).",
    );
  });

  it("still explains the flag when no generator is known", () => {
    expect(missingDirectoryError({ generatorName: undefined }).message).toMatch(
      /^This generator cannot tell where to write its output\. Pass --directory=/u,
    );
  });

  it("appends a remedy only one host has", () => {
    expect(
      missingDirectoryError({
        generatorName: "widget",
        hint: "Or declare a type input.",
      }).message,
    ).toMatch(/ Or declare a type input\.$/u);
  });
});
