import { getRepositoryToken } from "@nestjs/typeorm";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { Token, Word } from "@codebase/lexico-db";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { createRepositoryMock } from "../../../testing/mocks";

import { LiteratureWordLinkingService } from "./literature-word-linking.service";
import { LiteratureWordNormalizationService } from "./literature-word-normalization.service";

import type { DeepMocked } from "@golevelup/ts-vitest";
import type { Repository } from "typeorm";

const WORDS = new Map(
  [
    "virgo",
    "meus",
    "pumex",
    "puella",
    "solvit",
    "iuvenis",
    "juvenis",
    "fuisse",
    "et",
    "populus",
    "ita",
    "itaque",
    "cesar",
    "caesar",
    "abaestumarer",
    "abæstumatus",
    "me",
    "meae",
    "mene",
    "bene",
  ].map((data) => [data, `id-${data}`]),
);

const providers = [
  LiteratureWordNormalizationService,
  {
    provide: getRepositoryToken(Token),
    useValue: createRepositoryMock<Token>(),
  },
  {
    provide: getRepositoryToken(Word),
    useValue: createRepositoryMock<Word>(),
  },
];

describe(LiteratureWordLinkingService, () => {
  let service: LiteratureWordLinkingService;
  let tokenRepository: DeepMocked<Repository<Token>>;
  let wordRepository: DeepMocked<Repository<Word>>;

  beforeAll(async () => {
    const built = await buildTestingModule(LiteratureWordLinkingService, {
      providers,
    });

    service = built.instance;
    tokenRepository = built.module.get(getRepositoryToken(Token));
    wordRepository = built.module.get(getRepositoryToken(Word));
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      LiteratureWordLinkingService,
      { providers },
    );

    expect(instance).toBeInstanceOf(LiteratureWordLinkingService);
  });

  describe("resolve", () => {
    it("links a word spelled as the dictionary spells it, whatever its case", () => {
      expect(service.resolve("Virgo", WORDS)).toBe("id-virgo");
      expect(service.resolve("pumice", WORDS)).toBeNull();
    });

    it("links u for v and i for j", () => {
      expect(service.resolve("soluit", WORDS)).toBe("id-solvit");
      expect(service.resolve("uirgo", WORDS)).toBe("id-virgo");
      expect(service.resolve("Iuuenis", WORDS)).toBe("id-iuvenis");
    });

    it("prefers the spelling closest to the token among those that fold alike", () => {
      expect(service.resolve("juuenis", WORDS)).toBe("id-juvenis");
      expect(service.resolve("Juvenis", WORDS)).toBe("id-juvenis");
    });

    it("links the ae ligature to ae and to the dictionary's own ligature", () => {
      expect(service.resolve("Cæsar", WORDS)).toBe("id-caesar");
      expect(service.resolve("abaestumatus", WORDS)).toBe("id-abæstumatus");
    });

    it("reads e as ae only after every stricter spelling has failed", () => {
      expect(service.resolve("cesar", WORDS)).toBe("id-cesar");
      expect(service.resolve("abestumarer", WORDS)).toBe("id-abaestumarer");
    });

    it("never reads a word that already has ae or oe as one with e", () => {
      expect(service.resolve("aeneas", WORDS)).toBeNull();
      expect(service.resolve("mae", WORDS)).toBeNull();
    });

    it("strips an enclitic from a word the dictionary lacks", () => {
      expect(service.resolve("populusque", WORDS)).toBe("id-populus");
      expect(service.resolve("meque", WORDS)).toBe("id-me");
      expect(service.resolve("populusue", WORDS)).toBe("id-populus");
      expect(service.resolve("populusve", WORDS)).toBe("id-populus");
      expect(service.resolve("Itane", WORDS)).toBe("id-ita");
    });

    it("keeps a word that carries an enclitic spelling itself", () => {
      expect(service.resolve("itaque", WORDS)).toBe("id-itaque");
      expect(service.resolve("bene", WORDS)).toBe("id-bene");
      expect(service.resolve("mene", WORDS)).toBe("id-mene");
    });

    it("does not strip an enclitic that leaves nothing usable", () => {
      expect(service.resolve("que", WORDS)).toBeNull();
      expect(service.resolve("zzque", WORDS)).toBeNull();
      expect(service.resolve("xne", WORDS)).toBeNull();
    });
  });

  describe("relinkTokens", () => {
    beforeEach(() => {
      wordRepository.find.mockResolvedValue(
        [...WORDS].map(([data, id]) => ({ data, id }) as Word),
      );
    });

    it("links the unlinked token types it can resolve and counts them", async () => {
      tokenRepository.manager.query
        .mockResolvedValueOnce([
          { data: "Virgo" },
          { data: "zzzz" },
          { data: "soluit" },
        ])
        .mockResolvedValueOnce([[], 5]);

      const result = await service.relinkTokens();

      expect(result).toStrictEqual({ linkedTypes: 2, unlinkedTypes: 3 });
      expect(tokenRepository.manager.query).toHaveBeenLastCalledWith(
        expect.stringContaining("recognised_word_count"),
      );
      expect(tokenRepository.manager.query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("UPDATE"),
        [
          ["Virgo", "soluit"],
          ["id-virgo", "id-solvit"],
        ],
      );
    });

    it("writes nothing when no type resolves", async () => {
      tokenRepository.manager.query.mockReset();
      tokenRepository.manager.query.mockResolvedValueOnce([{ data: "zzzz" }]);

      const result = await service.relinkTokens();

      expect(result).toStrictEqual({ linkedTypes: 0, unlinkedTypes: 1 });
      expect(tokenRepository.manager.query).toHaveBeenCalledTimes(1);
    });
  });
});
