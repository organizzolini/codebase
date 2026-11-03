import { createMock, type DeepMocked } from "@golevelup/ts-vitest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { expectLoggerContext } from "@codebase/observability/testing";
import { promptsMock } from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { CorpusScriptorumEcclesiasticorumLatinorumCommand } from "../corpus-scriptorum-ecclesiasticorum-latinorum/corpus-scriptorum-ecclesiasticorum-latinorum.command";
import { DictionaryCommand } from "../dictionary/dictionary.command";
import { EpigraphikDatenbankClaussSlabyCommand } from "../epigraphik-datenbank-clauss-slaby/epigraphik-datenbank-clauss-slaby.command";
import { LatinLibraryCommand } from "../latin-library/latin-library.command";
import { LibraryCommand } from "../library/library.command";
import { LiteratureCommand } from "../literature/literature.command";
import { PerseusCommand } from "../perseus/perseus.command";
import { WiktionaryCommand } from "../wiktionary/wiktionary.command";

import { LexicoIngestionCommand } from "./lexico-ingestion.command";

import type { LexicoIngestionCommandOptions } from "./lexico-ingestion.types";
import type { BuiltTestingModule } from "@codebase/testing/nestjs";
import type { Provider } from "@nestjs/common";

vi.mock("prompts", () => ({
  default: promptsMock,
}));

describe(LexicoIngestionCommand, () => {
  let command: LexicoIngestionCommand;
  let logger: BuiltTestingModule<LexicoIngestionCommand>["logger"];
  let corpusScriptorumEcclesiasticorumLatinorumCommand: DeepMocked<CorpusScriptorumEcclesiasticorumLatinorumCommand>;
  let dictionaryCommand: DeepMocked<DictionaryCommand>;
  let epigraphikDatenbankClaussSlabyCommand: DeepMocked<EpigraphikDatenbankClaussSlabyCommand>;
  let latinLibraryCommand: DeepMocked<LatinLibraryCommand>;
  let libraryCommand: DeepMocked<LibraryCommand>;
  let literatureCommand: DeepMocked<LiteratureCommand>;
  let perseusCommand: DeepMocked<PerseusCommand>;
  let wiktionaryCommand: DeepMocked<WiktionaryCommand>;

  const createProviders = (): Provider[] => [
    {
      provide: CorpusScriptorumEcclesiasticorumLatinorumCommand,
      useValue: createMock<CorpusScriptorumEcclesiasticorumLatinorumCommand>(),
    },
    {
      provide: DictionaryCommand,
      useValue: createMock<DictionaryCommand>(),
    },
    {
      provide: EpigraphikDatenbankClaussSlabyCommand,
      useValue: createMock<EpigraphikDatenbankClaussSlabyCommand>(),
    },
    {
      provide: LatinLibraryCommand,
      useValue: createMock<LatinLibraryCommand>(),
    },
    { provide: LibraryCommand, useValue: createMock<LibraryCommand>() },
    {
      provide: LiteratureCommand,
      useValue: createMock<LiteratureCommand>(),
    },
    { provide: PerseusCommand, useValue: createMock<PerseusCommand>() },
    {
      provide: WiktionaryCommand,
      useValue: createMock<WiktionaryCommand>(),
    },
  ];

  beforeAll(async () => {
    promptsMock.mockResolvedValue({ value: true });

    const built = await buildTestingModule(LexicoIngestionCommand, {
      providers: createProviders(),
    });

    command = built.instance;
    logger = built.logger;
    corpusScriptorumEcclesiasticorumLatinorumCommand = built.module.get(
      CorpusScriptorumEcclesiasticorumLatinorumCommand,
    );
    dictionaryCommand = built.module.get(DictionaryCommand);
    epigraphikDatenbankClaussSlabyCommand = built.module.get(
      EpigraphikDatenbankClaussSlabyCommand,
    );
    latinLibraryCommand = built.module.get(LatinLibraryCommand);
    libraryCommand = built.module.get(LibraryCommand);
    literatureCommand = built.module.get(LiteratureCommand);
    perseusCommand = built.module.get(PerseusCommand);
    wiktionaryCommand = built.module.get(WiktionaryCommand);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    promptsMock.mockResolvedValue({ value: true });
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(LexicoIngestionCommand, {
      providers: createProviders(),
    });

    expect(instance).toBeInstanceOf(LexicoIngestionCommand);
  });

  it("sets logger context", async () => {
    await expectLoggerContext(LexicoIngestionCommand, {
      providers: createProviders(),
    });
  });

  it("should parse all boolean options", () => {
    expect(command.parseWikipedia(undefined)).toBe(true);
    expect(command.parseWikipedia("false")).toBe(false);
    expect(command.parseWikipedia("0")).toBe(false);

    expect(command.parseDictionary(undefined)).toBe(true);
    expect(command.parseDictionary("false")).toBe(false);
    expect(command.parseDictionary("0")).toBe(false);

    expect(command.parseLibrarySources(undefined)).toBe(true);
    expect(command.parseLibrarySources("0")).toBe(false);

    expect(command.parseLibrary(undefined)).toBe(true);
    expect(command.parseLibrary("false")).toBe(false);
    expect(command.parseLibrary("0")).toBe(false);

    expect(command.parseLiterature(undefined)).toBe(true);
    expect(command.parseLiterature("0")).toBe(false);
  });

  it("should return provided prompt option values without prompting", async () => {
    const result = await (
      command as unknown as {
        promptOption: (
          currentValue: boolean | undefined,
          message: string,
          name: string,
        ) => Promise<boolean>;
      }
    ).promptOption(true, "message", "name");

    expect(result).toBe(true);
    expect(promptsMock).not.toHaveBeenCalled();
  });

  it("should prompt when option value is missing", async () => {
    promptsMock.mockResolvedValue({ wikipedia: false });

    const result = await (
      command as unknown as {
        promptOption: (
          currentValue: boolean | undefined,
          message: string,
          name: string,
        ) => Promise<boolean>;
      }
    ).promptOption(undefined, "Run wikipedia?", "wikipedia");

    expect(result).toBe(false);
    expect(promptsMock).toHaveBeenCalledTimes(1);
  });

  it("should run selected stages in order", async () => {
    const options: LexicoIngestionCommandOptions = {
      dictionary: true,
      library: true,
      librarySources: true,
      literature: true,
      wikipedia: true,
    };

    const promptForMissingOptionsSpy = vi
      .spyOn(
        command as unknown as {
          promptForMissingOptions: (
            optionsToPrompt: LexicoIngestionCommandOptions,
          ) => Promise<void>;
        },
        "promptForMissingOptions",
      )
      .mockResolvedValue(undefined);

    await command.run([], options);

    expect(promptForMissingOptionsSpy).toHaveBeenCalledWith(options);
    expect(wiktionaryCommand.run).toHaveBeenCalledTimes(1);
    expect(dictionaryCommand.ingestAll).toHaveBeenCalledTimes(1);
    expect(perseusCommand.run).toHaveBeenCalledTimes(1);
    expect(latinLibraryCommand.run).toHaveBeenCalledTimes(1);
    expect(
      corpusScriptorumEcclesiasticorumLatinorumCommand.run,
    ).toHaveBeenCalledTimes(1);
    expect(epigraphikDatenbankClaussSlabyCommand.run).toHaveBeenCalledTimes(1);
    expect(libraryCommand.run).toHaveBeenCalledWith([], {});
    expect(literatureCommand.run).toHaveBeenCalledWith([], {});

    const completionCall = logger.info.mock.calls.find(
      (call) => call[0] === "🎉 Completed the full ingestion pipeline",
    ) as [string, undefined, { durationSeconds: string }] | undefined;

    expect(completionCall).toBeDefined();
    expect(typeof completionCall?.[2].durationSeconds).toBe("string");
  });

  it("should skip disabled stages", async () => {
    const options: LexicoIngestionCommandOptions = {
      dictionary: false,
      library: false,
      librarySources: false,
      literature: false,
      wikipedia: false,
    };

    const promptForMissingOptionsSpy = vi
      .spyOn(
        command as unknown as {
          promptForMissingOptions: (
            optionsToPrompt: LexicoIngestionCommandOptions,
          ) => Promise<void>;
        },
        "promptForMissingOptions",
      )
      .mockResolvedValue(undefined);

    await command.run([], options);

    expect(promptForMissingOptionsSpy).toHaveBeenCalledWith(options);
    expect(wiktionaryCommand.run).not.toHaveBeenCalled();
    expect(dictionaryCommand.ingestAll).not.toHaveBeenCalled();
    expect(perseusCommand.run).not.toHaveBeenCalled();
    expect(libraryCommand.run).not.toHaveBeenCalled();
    expect(literatureCommand.run).not.toHaveBeenCalled();
  });

  it("should prompt for missing options and run only prompted stages", async () => {
    vi.restoreAllMocks();
    promptsMock.mockResolvedValue({
      dictionary: false,
      library: false,
      librarySources: true,
      literature: true,
      wikipedia: false,
    });

    await command.run([], {});

    expect(promptsMock).toHaveBeenCalledTimes(5);
    expect(wiktionaryCommand.run).not.toHaveBeenCalled();
    expect(dictionaryCommand.ingestAll).not.toHaveBeenCalled();
    expect(perseusCommand.run).toHaveBeenCalledTimes(1);
    expect(latinLibraryCommand.run).toHaveBeenCalledTimes(1);
    expect(
      corpusScriptorumEcclesiasticorumLatinorumCommand.run,
    ).toHaveBeenCalledTimes(1);
    expect(epigraphikDatenbankClaussSlabyCommand.run).toHaveBeenCalledTimes(1);
    expect(libraryCommand.run).not.toHaveBeenCalled();
    expect(literatureCommand.run).toHaveBeenCalledWith([], {});
  });

  it("should run only library sources stage helper", async () => {
    await (
      command as unknown as {
        runLibrarySourcesStage: () => Promise<void>;
      }
    ).runLibrarySourcesStage();

    expect(perseusCommand.run).toHaveBeenCalledTimes(1);
    expect(latinLibraryCommand.run).toHaveBeenCalledTimes(1);
    expect(
      corpusScriptorumEcclesiasticorumLatinorumCommand.run,
    ).toHaveBeenCalledTimes(1);
    expect(epigraphikDatenbankClaussSlabyCommand.run).toHaveBeenCalledTimes(1);
  });
});
