import { setTimeout as sleep } from "node:timers/promises";

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Not } from "typeorm";

import { Author, Text } from "@codebase/lexico-db";
import { LoggerService } from "@codebase/observability";

import {
  CATALOGUE_IDENTIFIER_PATTERN,
  FALLBACK_AUTHOR_YEARS,
  WIKIDATA_QUERY_URL,
  WIKIDATA_REQUEST_DELAY_MILLISECONDS,
  WIKIDATA_TIMEOUT_MILLISECONDS,
  WIKIDATA_USER_AGENT,
  wikidataResponseSchema,
} from "./literature.constants";
import { deriveEra, pickWikidataYears } from "./literature.utilities";

import type { AuthorYears } from "./literature.types";
import type { Repository } from "typeorm";

/** Dates each author from the source, Wikidata or a committed table, and derives its era. */
@Injectable()
export class LiteratureAuthorEraService {
  // 🏗 Dependency Injection

  constructor(
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
    @InjectRepository(Text)
    private readonly textRepository: Repository<Text>,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(LiteratureAuthorEraService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Finds the catalogue folder of one of the author's texts, such as `phi0959`. */
  private async findCatalogueIdentifier(
    author: Author,
  ): Promise<string | undefined> {
    const text = await this.textRepository.findOne({
      select: { metadata: true },
      where: { author: { id: author.id }, metadata: Not(IsNull()) },
    });
    const sourceUrl = text?.metadata?.["source_url"];
    return typeof sourceUrl === "string"
      ? CATALOGUE_IDENTIFIER_PATTERN.exec(sourceUrl)?.[1]
      : undefined;
  }

  /** Looks the author up on Wikidata by PHI number; a failure is logged and skipped. */
  private async lookupAuthor(author: Author): Promise<AuthorYears | undefined> {
    const identifier = await this.findCatalogueIdentifier(author);
    if (!identifier?.startsWith("phi")) return undefined;
    try {
      await sleep(WIKIDATA_REQUEST_DELAY_MILLISECONDS);
      // Wikidata stores the PHI number without its leading zeros.
      return await this.queryWikidata(String(Number(identifier.slice(3))));
    } catch (error) {
      this.logger.warn(
        "📅 Failed looking up an author on Wikidata",
        undefined,
        {
          reason: error instanceof Error ? error.message : String(error),
          slug: author.slug,
        },
      );
      return undefined;
    }
  }

  /** Asks Wikidata for the years of the author with this PHI number; nothing if it has none. */
  private async queryWikidata(
    phiNumber: string,
  ): Promise<AuthorYears | undefined> {
    const query = `SELECT (MIN(?b) AS ?birth) (MIN(?d) AS ?death) (MIN(?f) AS ?floruit) WHERE { ?a wdt:P6941 "${phiNumber}" . OPTIONAL { ?a wdt:P569 ?b } OPTIONAL { ?a wdt:P570 ?d } OPTIONAL { ?a wdt:P1317 ?f } }`;
    const response = await fetch(
      `${WIKIDATA_QUERY_URL}?format=json&query=${encodeURIComponent(query)}`,
      {
        headers: { "User-Agent": WIKIDATA_USER_AGENT },
        signal: AbortSignal.timeout(WIKIDATA_TIMEOUT_MILLISECONDS),
      },
    );
    if (!response.ok) throw new Error(`Wikidata answered ${response.status}`);
    const { results } = wikidataResponseSchema.parse(await response.json());
    return results.bindings[0] && pickWikidataYears(results.bindings[0]);
  }

  /** Keeps the years the source gave, else Wikidata's, else the committed table's. */
  private async resolveYears(author: Author): Promise<Partial<AuthorYears>> {
    const given: Partial<AuthorYears> = {};
    if (typeof author.endYear === "number") given.endYear = author.endYear;
    if (typeof author.startYear === "number")
      given.startYear = author.startYear;
    if (Object.keys(given).length > 0) return given;
    const fallback = FALLBACK_AUTHOR_YEARS[author.slug];
    return (
      (await this.lookupAuthor(author)) ??
      (fallback ? { endYear: fallback[1], startYear: fallback[0] } : given)
    );
  }

  // 🌎 Public Methods

  /** Dates each author that has no years, then derives every dated author's era. */
  public async dateAuthors(): Promise<void> {
    const undated: string[] = [];
    for (const author of await this.authorRepository.find()) {
      const years = await this.resolveYears(author);
      const era = deriveEra(years.startYear, years.endYear);
      if (era)
        await this.authorRepository.update(
          { id: author.id },
          { ...years, era },
        );
      else undated.push(author.slug);
    }
    if (undated.length > 0)
      this.logger.warn("📅 Left authors without dates", undefined, {
        authors: undated,
      });
  }
}
