import { ConfigurationService } from "@coinagerie/configuration";
import { DeliveryService } from "@coinagerie/output";
import { VocabularyService } from "@coinagerie/vocabulary";
import { Test } from "@nestjs/testing";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { CheckService } from "./check.service";

import type {
  ResolvedCoinagerieConfiguration,
  ResolvedCoinagerieOutput,
} from "@coinagerie/configuration";

const loadConfiguration = vi.fn<ConfigurationService["loadConfiguration"]>();
const collect = vi.fn<VocabularyService["collect"]>();
const check = vi.fn<DeliveryService["check"]>();
const write = vi.fn<DeliveryService["write"]>();

/** A resolved configuration with the given destinations, and nothing else. */
function configurationOf(
  outputs: ResolvedCoinagerieOutput[],
): ResolvedCoinagerieConfiguration {
  return {
    configurationPath: "/workspace/packages/a/coinagerie.config.ts",
    directory: "/workspace/packages/a",
    exclude: { paths: [], patterns: [], words: [] },
    fold: undefined,
    include: [],
    outputs,
  };
}

/** One markdown destination at the given path. */
function destinationAt(path: string): ResolvedCoinagerieOutput {
  return { description: undefined, path, type: "markdown" };
}

describe(CheckService, () => {
  let service: CheckService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CheckService,
        { provide: ConfigurationService, useValue: { loadConfiguration } },
        { provide: VocabularyService, useValue: { collect } },
        { provide: DeliveryService, useValue: { check, write } },
      ],
    }).compile();

    service = await module.resolve(CheckService);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    loadConfiguration.mockReset();
    collect.mockReset();
    check.mockReset();
    write.mockReset();
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(service).toBeDefined();
  });

  const args = {
    directory: "/workspace/packages/a",
    mode: "check",
    workspaceRoot: "/workspace",
  } as const;

  it("loads the configuration from the project's own directory", async () => {
    expect.hasAssertions();

    loadConfiguration.mockResolvedValue(
      configurationOf([destinationAt("/x/README.md")]),
    );
    collect.mockResolvedValue(["alpha"]);
    check.mockReturnValue([
      { missing: [], path: "/x/README.md", stale: [], type: "markdown" },
    ]);

    const verdict = await service.run(args);

    expect(loadConfiguration).toHaveBeenCalledWith({
      configurationPath: undefined,
      overrides: {},
      workingDirectory: "/workspace/packages/a",
    });
    expect(verdict.ok).toBe(true);
  });

  it("names each glossary that disagrees with the code, with its missing and stale words", async () => {
    expect.hasAssertions();

    loadConfiguration.mockResolvedValue(
      configurationOf([destinationAt("/x/README.md")]),
    );
    collect.mockResolvedValue(["alpha"]);
    check.mockReturnValue([
      {
        missing: ["argv", "tick"],
        path: "/workspace/packages/a/README.md",
        stale: ["old"],
        type: "markdown",
      },
      {
        missing: [],
        path: "/workspace/packages/a/GLOSSARY.md",
        stale: [],
        type: "markdown",
      },
    ]);

    const verdict = await service.run(args);

    expect(verdict.ok).toBe(false);
    expect(verdict.report).toContain("packages/a/README.md");
    expect(verdict.report).toContain("missing: argv, tick");
    expect(verdict.report).toContain("stale: old");
    expect(verdict.report).not.toContain("GLOSSARY.md");
  });

  it("fails a configuration that names no glossary destination", async () => {
    expect.hasAssertions();

    loadConfiguration.mockResolvedValue(configurationOf([]));
    collect.mockResolvedValue([]);

    const verdict = await service.run(args);

    expect(verdict.ok).toBe(false);
    expect(verdict.report).toContain("no glossary destination");
  });

  it.each([
    [
      "loading the configuration",
      () => loadConfiguration.mockRejectedValue(new Error("boom")),
    ],
    [
      "collecting the words",
      () => collect.mockRejectedValue(new Error("boom")),
    ],
    [
      "checking a glossary",
      () =>
        check.mockImplementation(() => {
          throw new Error("boom");
        }),
    ],
  ])("fails, never passes, when %s throws", async (_name, breakIt) => {
    expect.hasAssertions();

    loadConfiguration.mockResolvedValue(
      configurationOf([destinationAt("/x/README.md")]),
    );
    collect.mockResolvedValue([]);
    check.mockReturnValue([]);
    breakIt();

    const verdict = await service.run(args);

    expect(verdict.ok).toBe(false);
    expect(verdict.report).toContain("boom");
  });

  it("writes every glossary and says which files changed", async () => {
    expect.hasAssertions();

    loadConfiguration.mockResolvedValue(
      configurationOf([destinationAt("/x/README.md")]),
    );
    collect.mockResolvedValue(["alpha"]);
    write.mockReturnValue([
      {
        missing: ["alpha"],
        path: "/workspace/packages/a/README.md",
        stale: [],
        type: "markdown",
        written: true,
      },
      {
        missing: [],
        path: "/workspace/packages/a/OTHER.md",
        stale: [],
        type: "markdown",
        written: false,
      },
    ]);

    const verdict = await service.run({ ...args, mode: "write" });

    expect(check).not.toHaveBeenCalled();
    expect(verdict.ok).toBe(true);
    expect(verdict.report).toContain("packages/a/README.md");
    expect(verdict.report).not.toContain("OTHER.md");
  });
});
