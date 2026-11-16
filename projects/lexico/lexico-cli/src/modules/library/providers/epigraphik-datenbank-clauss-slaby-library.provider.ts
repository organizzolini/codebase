// `obj` is the field name the EDCS API returns, not an abbreviation this code chose.
// cspell:ignore obj

import * as fs from "node:fs/promises";
import path from "node:path";

import { Injectable } from "@nestjs/common";
import _ from "lodash";
import YAML from "yaml";
import { z } from "zod";

import { Author, Text, textCollection } from "@codebase/lexico-db";
import { LoggerService } from "@codebase/observability";

/** An optional attribute; a wrong-shaped value reads as absent. */
const optionalAttribute = <T extends z.ZodType>(
  schema: T,
): z.ZodCatch<z.ZodOptional<z.ZodNullable<T>>> => schema.nullish().catch(null);

// Attribute field names are unverified against the live API (it returned 403), so a wrong name
// nulls that attribute; the run's coverage log and warning expose it.
/** One EDCS record: id and inscriptions required, the rest optional. */
const epigraphikDatenbankRecordSchema = z.object({
  obj: z
    .object({
      datierung_bis: optionalAttribute(z.number().int()),
      datierung_von: optionalAttribute(z.number().int()),
      "edcs-id": z.string().optional(),
      edcsId: z.string().optional(),
      fundort: optionalAttribute(z.string()),
      inschriften: z.array(z.tuple([z.string()]).rest(z.unknown())),
      inschrifttyp: optionalAttribute(z.string()),
      material: optionalAttribute(z.string()),
      provinz: optionalAttribute(z.string()),
    })
    .refine((object) => Boolean(object["edcs-id"] || object.edcsId), {
      message: "EDCS record has no id",
    }),
});

/** Where one run writes, plus its running counts. */
interface EdcsRun {
  author: Author;
  authorDirectory: string;
  authorSlug: string;
  booksMap: Map<string, Text>;
  missing: Record<string, number>;
  options: undefined | { text?: string };
  records: number;
}

/** The validated shape of one EDCS record. */
type EpigraphikDatenbankRecord = z.infer<
  typeof epigraphikDatenbankRecordSchema
>;

/** Missing share of records that warns of a wrong field name. */
const MISSING_SHARE_WARNING = 0.95;

/** Fewer records than this prove nothing about a field name. */
const MINIMUM_RECORDS_FOR_WARNING = 10;

/**
 * Provider for ingesting Epigraphik-Datenbank Clauss-Slaby inscriptions.
 */
@Injectable()
export class EpigraphikDatenbankClaussSlabyLibraryProvider {
  constructor(private readonly logger: LoggerService) {}

  readonly name = "epigraphik-datenbank-clauss-slaby";

  // 🔏 Private Methods

  /**
   * Registers the province book on the author the first time a province appears.
   */
  private addBookText(run: EdcsRun, province: string, bookSlug: string): void {
    const bookText = new Text();
    bookText.type = "book";
    bookText.title = province;
    bookText.slug = bookSlug;
    bookText.childTexts = [];
    run.booksMap.set(province, bookText);
    run.author.texts.push(bookText);
  }

  /**
   * Builds structured data used during EDCS library ingestion.
   */
  private createSourceAuthor(authorSlug: string, host: string): Author {
    const author = new Author();
    author.name = "Epigraphik-Datenbank Clauss-Slaby";
    author.slug = authorSlug;
    author.metadata = { sourceUrl: host };
    author.texts = [];
    return author;
  }

  /**
   * Writes one validated EDCS record straight to its markdown file, so no run holds more than one chunk.
   */
  private async processEdcsRecord(
    record: EpigraphikDatenbankRecord,
    run: EdcsRun,
  ): Promise<void> {
    const object = record.obj;
    const id = object["edcs-id"] || object.edcsId || "";
    const province = object.provinz || "Unknown Province";
    const text = object.inschriften[0]?.[0];
    if (!text) return;
    let cleanedText = text;
    let previousText: string;
    do {
      previousText = cleanedText;
      cleanedText = cleanedText.replaceAll(/<[^>]*>?/gm, "");
    } while (cleanedText !== previousText);
    run.records++;
    const attributes = buildEdcsAttributes(object, province);
    for (const [key, value] of Object.entries(attributes)) {
      if (value === undefined) run.missing[key] = (run.missing[key] ?? 0) + 1;
    }
    await this.saveEdcsInscription({
      attributes,
      id,
      province,
      run,
      text: cleanedText,
    });
  }

  /**
   * Parses one chunk file, skipping invalid records so one bad record never stops the run.
   */
  private async processSourceChunkFile(args: {
    file: string;
    index: number;
    run: EdcsRun;
    sourceDataDirectory: string;
    total: number;
  }): Promise<void> {
    const { file, index, run, sourceDataDirectory, total } = args;
    this.logger.info("📜 Starting processing chunk", undefined, { file });
    try {
      const filePath = path.join(sourceDataDirectory, file);
      const fileContent = await fs.readFile(filePath, "utf8");
      const data = JSON.parse(fileContent) as { data: unknown[] };
      for (const [recordIndex, item] of data.data.entries()) {
        const parsed = epigraphikDatenbankRecordSchema.safeParse(item);
        if (parsed.success) {
          await this.processEdcsRecord(parsed.data, run);
          continue;
        }
        this.logger.warn("📄 Skipped invalid EDCS record", undefined, {
          file,
          index: recordIndex,
          reason: parsed.error.issues.map((issue) => issue.message).join("; "),
        });
      }
      this.logger.info("📜 Completed processing chunk", undefined, {
        current: index + 1,
        file,
        percent: Number((((index + 1) / total) * 100).toFixed(2)),
        total,
      });
    } catch (error) {
      this.logger.warn("📄 Failed reading chunk file", undefined, {
        file,
        reason: String(error),
      });
    }
  }

  /**
   * Processes the chunk files one at a time.
   */
  private async processSourceChunkStage(
    chunkFiles: string[],
    run: EdcsRun,
    sourceDataDirectory: string,
  ): Promise<void> {
    for (const [index, file] of chunkFiles.entries()) {
      await this.processSourceChunkFile({
        file,
        index,
        run,
        sourceDataDirectory,
        total: chunkFiles.length,
      });
    }
  }

  /**
   * Loads source data required by EDCS library ingestion.
   */
  private async readSourceChunkFiles(
    sourceDataDirectory: string,
  ): Promise<null | string[]> {
    try {
      const files = await fs.readdir(sourceDataDirectory);
      return files.filter((file) => file.endsWith(".json"));
    } catch {
      this.logger.error(
        "📁 Failed reading the source directory. Did you run the epigraphik-datenbank-clauss-slaby command first?",
        undefined,
        { sourceDataDirectory },
      );
      return null;
    }
  }

  /**
   * Logs how many records lacked each attribute, and warns when one is missing almost everywhere.
   */
  private reportAttributeCoverage(run: EdcsRun): void {
    this.logger.info("📊 Measured EDCS attribute coverage", undefined, {
      missing: run.missing,
      records: run.records,
    });
    if (run.records < MINIMUM_RECORDS_FOR_WARNING) return;
    const affected = Object.entries(run.missing)
      .filter(([, count]) => count / run.records >= MISSING_SHARE_WARNING)
      .map(([key]) => key);
    if (affected.length === 0) return;
    this.logger.warn(
      "⚠️ Found EDCS attributes missing on nearly every record; the API field names may be wrong",
      undefined,
      { affected, records: run.records },
    );
  }

  /**
   * Persists one inscription as a markdown file under its province book; a second record that
   * lands on the same slug is logged and left out, never allowed to overwrite the first.
   */
  private async saveEdcsInscription(args: {
    attributes: Record<string, number | string | undefined>;
    id: string;
    province: string;
    run: EdcsRun;
    text: string;
  }): Promise<void> {
    const { attributes, id, province, run, text } = args;
    const { authorDirectory, authorSlug, options } = run;
    const bookSlug = _.kebabCase(province);
    const titleSlug = _.kebabCase(id);
    const textSlug = `${authorSlug}/${bookSlug}/${titleSlug}`;
    if (options?.text && textSlug !== options.text) return;
    const bookDirectory = path.join(authorDirectory, bookSlug);
    if (!run.booksMap.has(province)) {
      await fs.mkdir(bookDirectory, { recursive: true });
      this.addBookText(run, province, bookSlug);
    }
    const frontmatterObject = {
      author: authorSlug,
      collection: textCollection.edcs,
      ..._.omitBy(attributes, (value) => value === undefined),
      text_metadata: { source_url: "https://db.edcs.eu" },
      title: id,
      type: "text",
    };
    const markdown = `---\n${YAML.stringify(frontmatterObject)}---\n\n# ${id}\n\n**${id}** ${text}\n`;
    try {
      await fs.writeFile(
        path.join(bookDirectory, `${titleSlug}.md`),
        markdown,
        {
          encoding: "utf8",
          flag: options?.text ? "w" : "wx",
        },
      );
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      this.logger.warn("📄 Skipped duplicate EDCS id", undefined, {
        id,
        slug: textSlug,
      });
    }
  }

  // 🌎 Public Methods

  /**
   * Parse inscriptions from Epigraphik-Datenbank Clauss-Slaby JSON files and group them by province.
   */
  async ingest(options?: {
    author?: string;
    text?: string;
  }): Promise<Author[]> {
    this.logger.info(
      "🗂️ Ingesting Epigraphik-Datenbank Clauss-Slaby from local data",
    );
    const authorSlug = "epigraphik-datenbank-clauss-slaby";
    if (options?.author && authorSlug !== options.author) return [];
    const authorDirectory = path.join(
      path.resolve("data", "library", this.name),
      authorSlug,
    );
    const sourceDataDirectory = path.resolve(
      "data",
      "epigraphik-datenbank-clauss-slaby-source",
    );
    this.logger.info(
      "🗂️ Reading Epigraphik-Datenbank Clauss-Slaby chunks",
      undefined,
      { sourceDataDirectory },
    );
    const chunkFiles = await this.readSourceChunkFiles(sourceDataDirectory);
    if (!chunkFiles) return [];
    if (!options?.text) {
      await fs.rm(authorDirectory, { force: true, recursive: true });
    }
    await fs.mkdir(authorDirectory, { recursive: true });
    const author = this.createSourceAuthor(
      authorSlug,
      "https://edcs.hist.uzh.ch/api/query",
    );
    const run: EdcsRun = {
      author,
      authorDirectory,
      authorSlug,
      booksMap: new Map(),
      missing: {},
      options,
      records: 0,
    };
    await this.processSourceChunkStage(chunkFiles, run, sourceDataDirectory);
    this.reportAttributeCoverage(run);
    return [author];
  }
}

/** Frontmatter keys for the province and each attribute; a missing one is undefined. */
function buildEdcsAttributes(
  object: EpigraphikDatenbankRecord["obj"],
  province: string,
): Record<string, number | string | undefined> {
  return {
    end_year: object.datierung_bis ?? undefined,
    find_spot: object.fundort ?? undefined,
    inscription_type: object.inschrifttyp ?? undefined,
    material: object.material ?? undefined,
    province,
    start_year: object.datierung_von ?? undefined,
  };
}
