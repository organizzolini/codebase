import { beforeAll, describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { ComparisonService } from "./comparison.service";

describe(ComparisonService, () => {
  let service: ComparisonService;

  beforeAll(async () => {
    ({ instance: service } = await buildTestingModule(ComparisonService));
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(ComparisonService);

    expect(instance).toBeInstanceOf(ComparisonService);
  });

  it.each([
    ["agreement", ["alpha", "beta"], ["alpha", "beta"], [], []],
    [
      "missing words",
      ["alpha", "beta", "gamma"],
      ["beta"],
      ["alpha", "gamma"],
      [],
    ],
    ["stale words", ["beta"], ["zeta", "beta", "alpha"], [], ["alpha", "zeta"]],
    ["an empty glossary", ["alpha"], [], ["alpha"], []],
    ["an empty vocabulary", [], ["alpha"], [], ["alpha"]],
  ])("compares %s", (_case, words, listed, missing, stale) => {
    const glossary = new Map(listed.map((word) => [word, "defined"]));

    expect(service.compare(words, glossary)).toStrictEqual({ missing, stale });
  });

  it("never counts an empty definition as a disagreement", () => {
    expect(service.compare(["alpha"], new Map([["alpha", ""]]))).toStrictEqual({
      missing: [],
      stale: [],
    });
  });

  it("reconciles a glossary to the vocabulary, keeping every definition still in use", () => {
    // Listed out of order on purpose: reconciling sorts.
    const unsorted: [string, string][] = [
      ["gamma", "Gone."],
      ["beta", "Second.\n  Continued."],
      ["alpha", ""],
    ];
    const reconciled = service.reconcile(
      ["alpha", "beta", "delta"],
      new Map(unsorted),
    );

    expect([...reconciled]).toStrictEqual([
      ["alpha", ""],
      ["beta", "Second.\n  Continued."],
      ["delta", ""],
    ]);
  });
});
