# 🚰 Lexico Ingestion

**Where the dictionary comes from.** A NestJS command-line application that
scrapes, parses, and loads the sources behind
[Lexico](../lexico-web/README.md) into the schema defined by
[lexico-entities](../lexico-entities/README.md).

## Quick Start

```bash
cp .env.default .env      # Database connection
nx run lexico-cli:start
```

The default command is the root pipeline, which prompts for any stage flags it
was not given and then runs the selected stages in order.

```bash
nx run lexico-cli:start -- --dictionary --literature
```

| Stage flag | Ingests |
| ---------- | ------- |
| `--dictionary` | Dictionary entries, forms, and inflections |
| `--library` | The library of works |
| `--library-sources` | The upstream sources each work came from |
| `--literature` | Lines and tokens of each text |
| `--wikipedia` | Wiktionary pages |

## Individual stages

Every stage is also its own command, addressable as a `start` configuration:

```bash
nx run lexico-cli:start:dictionary -- --startLemma=a --endLemma=c
nx run lexico-cli:start:wiktionary
nx run lexico-cli:start:clear
```

| Command | Source |
| ------- | ------ |
| `dictionary` | Dictionary entries, resumable with `--startLemma` / `--endLemma` |
| `wiktionary` | Wiktionary page dumps |
| `perseus` | The Perseus Digital Library |
| `latin-library` | The Latin Library |
| `corpus-scriptorum-ecclesiasticorum-latinorum` | CSEL, the ecclesiastical Latin corpus |
| `epigraphik-datenbank-clauss-slaby` | EDCS, the Latin inscription database |
| `library` | Library and work metadata |
| `literature` | Lines and tokens for loaded texts |
| `clear` | Empties ingested tables so a run can start clean |

The lemma range on `dictionary` is what makes a long scrape restartable: a run
that stops partway is resumed by pointing `--startLemma` at where it left off
rather than starting over.

A value given to a flag is validated, and an unknown one fails the run. A
missing value — a bare `--startLemma`, or an omitted `--provider`, `--author`,
or `--text` on `library` and `literature` — is asked for only when standard
input is a terminal; otherwise the command takes its default of no bound or
"All". A cancelled prompt, like any error a command throws, exits non-zero.

## Moving data between databases

This application does not copy tables between databases. The database
package's command line does, with `nx run persistence:start:postgresql-export` and
`nx run persistence:start:postgresql-import`. It has no default schema, so name the Lexico
schema with `--schema lexico`, or qualify each table as `lexico.words`.
A relative `--file` resolves from `projects/common/persistence`, so this keeps the dump
in this project's `data/` directory, where `*.dump` is gitignored:

```bash
nx run persistence:start:postgresql-export --args="--source-uri postgresql://user:password@localhost:5432/lexico_development --schema lexico --table words --data --ddl --file ../lexico/lexico-cli/data/lexico.dump"
```

`import --clean` runs without asking, so run `import --dry-run` with the same
options first to see what it would drop or truncate. See the
[persistence README](../../common/persistence/README.md#moving-data-between-databases) for
every option.

## How it works

Each source has its own module under `src/modules/`, holding the fetcher, the
parser for that source's markup, and the mapping into entities. HTML is parsed
with [cheerio](https://cheerio.js.org) and wiki markup through mdast, so a
change to one site's layout is contained to one module.

Nothing here defines the schema. Entities and migrations come from
[`@codebase/lexico-entities`](../lexico-entities/README.md), so the
shape ingestion writes and the shape the application reads cannot drift.

## Start

```bash
nx run lexico-cli:start
```

## Test

```bash
nx run lexico-cli:vitest
```

## Development

```bash
nx run lexico-cli:typecheck
nx run lexico-cli:lint-codebase --configuration=write
```

Run migrations before a first ingestion:

```bash
nx run lexico-entities:migration:run
```

## Related

- 🐺 [lexico-web](../lexico-web/README.md) — the web application
- 📖 [lexico-entities](../lexico-entities/README.md) — the schema this writes to
- 🎨 [presentation](../../common/presentation/README.md) — the interface

## License

MIT — see [LICENSE](../../../LICENSE).

## 👔 Conformetry

This project was generated from the [nestjs-command-project](../../../configuration/conformetry-templates/nestjs-command-project) conformetry template.

<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/lexico/lexico-cli`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 578 |
| Files | 112 |
| Calls traced | 645 |
| Call stacks | 26 |
| Deepest stack | 17 |
| Stacks through recursion | 3 |
| Unfollowable calls | 103 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 17 |
| `maximumBreadth` | 8 |

### Call stacks (depth)

**1. `LexicoIngestionCommand.run`** — depth ≥ 17 · decorated-method

```text
🚀 LexicoIngestionCommand.run(…): Promise<void> [projects/lexico/lexico-cli/src/modules/lexico-ingestion/lexico-ingestion.command.ts:219]
   ↳ Executes the selected stage sequence after prompting for any unspecified toggles.
  └─> LexicoIngestionCommand.executeStages(options: LexicoIngestionCommandOptions): Promise<void> [projects/lexico/lexico-cli/src/modules/lexico-ingestion/lexico-ingestion.command.ts:54]
     ↳ Processes one workflow step for root ingestion pipeline execution.
    └─> DictionaryCommand.ingestAll(startLemma?: string, endLemma?: string): Promise<void> [projects/lexico/lexico-cli/src/modules/dictionary/dictionary.command.ts:381]
       ↳ Iterates cached `data/wiktionary/*.json` pages within an optional lemma range and ingests each file into persisted…
      └─> DictionaryCommand.processFile(file: string, current: number, total: number): Promise<void> [projects/lexico/lexico-cli/src/modules/dictionary/dictionary.command.ts:230]
         ↳ Processes one workflow step for dictionary ingestion.
        └─> DictionaryCommand.ingestLexeme(…): Promise<void> (cycle) [projects/lexico/lexico-cli/src/modules/dictionary/dictionary.command.ts:415]
           ↳ Ingests one lemma by parsing its Wiktionary HTML into lexemes, saving relations, and recursively resolving…
          └─> DictionaryCommand.processTranslationReferences(saved: Lexeme): Promise<void> (cycle) [projects/lexico/lexico-cli/src/modules/dictionary/dictionary.command.ts:290]
             ↳ Processes one workflow step for dictionary ingestion.
            └─> LexemesService.parseLexemes(wiktionaryPage: WiktionaryPage): Promise<Lexeme[]> [projects/lexico/lexico-cli/src/modules/lexemes/lexemes.service.ts:307]
               ↳ Parses one Wiktionary page into lexemes by iterating `p:has(strong.Latn.headword)` sections and enriching each accepted…
              └─> LexemesService.parseLexemeFromElement(…): Promise<Lexeme | null> [projects/lexico/lexico-cli/src/modules/lexemes/lexemes.service.ts:146]
                 ↳ Parses and normalizes inputs for lexeme parsing and persistence.
                └─> LexemesService.enrichLexeme(…): Promise<void> [projects/lexico/lexico-cli/src/modules/lexemes/lexemes.service.ts:73]
                   ↳ Handles an internal workflow step for lexeme parsing and persistence.
                  └─> PronunciationService.parse($: cheerio.CheerioAPI, elt: AnyNode, macronizedWord: string): Pronunciation[] [projects/lexico/lexico-cli/src/modules/pronunciation/pronunciation.service.ts:181]
                     ↳ Parses pronunciation data from the Wiktionary HTML element context.
                    └─> PronunciationService.getEcclesiasticalPronunciations(word: string): string[] [projects/lexico/lexico-cli/src/modules/pronunciation/pronunciation.service.ts:150]
                       ↳ Gets ecclesiastical pronunciations used by pronunciation parsing.
                      └─> PronunciationService.getEcclesiasticalPhonemes(wordString: string): PronunciationPhoneme[] [projects/lexico/lexico-cli/src/modules/pronunciation/pronunciation.service.ts:124]
                         ↳ Gets ecclesiastical phonemes used by pronunciation parsing.
                        └─> PronunciationClassifierService.processEcclesiasticalCharacter(args: PronunciationEcclesiasticalCharacterContext): number [projects/lexico/lexico-cli/src/modules/pronunciation/pronunciation-classifier.service.ts:130]
                           ↳ Processes one ecclesiastical-character position and returns the next index.
                          └─> PronunciationEcclesiasticalService.processEcclesiasticalCharacter(args: PronunciationEcclesiasticalCharacterContext): number [projects/lexico/lexico-cli/src/modules/pronunciation/pronunciation-ecclesiastical.service.ts:305]
                             ↳ Processes one ecclesiastical-character position and returns the next index.
                            └─> PronunciationEcclesiasticalService.classifyEcclesiasticalI(…): void [projects/lexico/lexico-cli/src/modules/pronunciation/pronunciation-ecclesiastical.service.ts:188]
                               ↳ Classifies ecclesiastical i for pronunciation parsing.
                              └─> PronunciationEcclesiasticalService.isEcclesiasticalVocalI(index: number, word: string[], isVowel: (letter: string) => boolean): boolean [projects/lexico/lexico-cli/src/modules/pronunciation/pronunciation-ecclesiastical.service.ts:41]
                                 ↳ Checks whether ecclesiastical vocal i in pronunciation parsing logic.
                                └─> PronunciationEcclesiasticalService.isInitialVocalI(index: number, word: string[], isVowel: (letter: string) => boolean): boolean [projects/lexico/lexico-cli/src/modules/pronunciation/pronunciation-ecclesiastical.service.ts:55]
                                   ↳ Checks whether initial vocal i in pronunciation parsing logic.
```

**2. `DictionaryCommand.run`** — depth ≥ 16 · decorated-method

```text
🚀 DictionaryCommand.run(_arguments: string[], options: DictionaryCommandOptions): Promise<void> [projects/lexico/lexico-cli/src/modules/dictionary/dictionary.command.ts:485]
   ↳ Runs full dictionary ingestion for the selected lemma range, then applies manual entries.
  └─> DictionaryCommand.ingestAll(startLemma?: string, endLemma?: string): Promise<void> [projects/lexico/lexico-cli/src/modules/dictionary/dictionary.command.ts:381]
     ↳ Iterates cached `data/wiktionary/*.json` pages within an optional lemma range and ingests each file into persisted…
    └─> DictionaryCommand.processFile(file: string, current: number, total: number): Promise<void> [projects/lexico/lexico-cli/src/modules/dictionary/dictionary.command.ts:230]
       ↳ Processes one workflow step for dictionary ingestion.
      └─> DictionaryCommand.ingestLexeme(…): Promise<void> (cycle) [projects/lexico/lexico-cli/src/modules/dictionary/dictionary.command.ts:415]
         ↳ Ingests one lemma by parsing its Wiktionary HTML into lexemes, saving relations, and recursively resolving…
        └─> DictionaryCommand.processTranslationReferences(saved: Lexeme): Promise<void> (cycle) [projects/lexico/lexico-cli/src/modules/dictionary/dictionary.command.ts:290]
           ↳ Processes one workflow step for dictionary ingestion.
          └─> LexemesService.parseLexemes(wiktionaryPage: WiktionaryPage): Promise<Lexeme[]> [projects/lexico/lexico-cli/src/modules/lexemes/lexemes.service.ts:307]
             ↳ Parses one Wiktionary page into lexemes by iterating `p:has(strong.Latn.headword)` sections and enriching each accepted…
            └─> LexemesService.parseLexemeFromElement(…): Promise<Lexeme | null> [projects/lexico/lexico-cli/src/modules/lexemes/lexemes.service.ts:146]
               ↳ Parses and normalizes inputs for lexeme parsing and persistence.
              └─> LexemesService.enrichLexeme(…): Promise<void> [projects/lexico/lexico-cli/src/modules/lexemes/lexemes.service.ts:73]
                 ↳ Handles an internal workflow step for lexeme parsing and persistence.
                └─> PronunciationService.parse($: cheerio.CheerioAPI, elt: AnyNode, macronizedWord: string): Pronunciation[] [projects/lexico/lexico-cli/src/modules/pronunciation/pronunciation.service.ts:181]
                   ↳ Parses pronunciation data from the Wiktionary HTML element context.
                  └─> PronunciationService.getEcclesiasticalPronunciations(word: string): string[] [projects/lexico/lexico-cli/src/modules/pronunciation/pronunciation.service.ts:150]
                     ↳ Gets ecclesiastical pronunciations used by pronunciation parsing.
                    └─> PronunciationService.getEcclesiasticalPhonemes(wordString: string): PronunciationPhoneme[] [projects/lexico/lexico-cli/src/modules/pronunciation/pronunciation.service.ts:124]
                       ↳ Gets ecclesiastical phonemes used by pronunciation parsing.
                      └─> PronunciationClassifierService.processEcclesiasticalCharacter(args: PronunciationEcclesiasticalCharacterContext): number [projects/lexico/lexico-cli/src/modules/pronunciation/pronunciation-classifier.service.ts:130]
                         ↳ Processes one ecclesiastical-character position and returns the next index.
                        └─> PronunciationEcclesiasticalService.processEcclesiasticalCharacter(args: PronunciationEcclesiasticalCharacterContext): number [projects/lexico/lexico-cli/src/modules/pronunciation/pronunciation-ecclesiastical.service.ts:305]
                           ↳ Processes one ecclesiastical-character position and returns the next index.
                          └─> PronunciationEcclesiasticalService.classifyEcclesiasticalI(…): void [projects/lexico/lexico-cli/src/modules/pronunciation/pronunciation-ecclesiastical.service.ts:188]
                             ↳ Classifies ecclesiastical i for pronunciation parsing.
                            └─> PronunciationEcclesiasticalService.isEcclesiasticalVocalI(index: number, word: string[], isVowel: (letter: string) => boolean): boolean [projects/lexico/lexico-cli/src/modules/pronunciation/pronunciation-ecclesiastical.service.ts:41]
                               ↳ Checks whether ecclesiastical vocal i in pronunciation parsing logic.
                              └─> PronunciationEcclesiasticalService.isInitialVocalI(index: number, word: string[], isVowel: (letter: string) => boolean): boolean [projects/lexico/lexico-cli/src/modules/pronunciation/pronunciation-ecclesiastical.service.ts:55]
                                 ↳ Checks whether initial vocal i in pronunciation parsing logic.
```

**3. `LibraryCommand.run`** — depth ≥ 15 · decorated-method

```text
🚀 LibraryCommand.run(_arguments: string[], options: LibraryCommandOptions): Promise<void> [projects/lexico/lexico-cli/src/modules/library/library.command.ts:428]
   ↳ Orchestrates provider execution with optional author/text scoping and progress logging.
  └─> LibraryCommand.processProvider(…): Promise<void> [projects/lexico/lexico-cli/src/modules/library/library.command.ts:181]
     ↳ Processes one workflow step for library provider orchestration.
    └─> PerseusLibraryProvider.ingest(options?: { author?: string; text?: string; }): Promise<Author[]> [projects/lexico/lexico-cli/src/modules/library/providers/perseus-library.provider.ts:371]
       ↳ Fetch authors, works, and output markdown files to the data directory.
      └─> PerseusLibraryProvider.processPerseusFile(…): Promise<void> [projects/lexico/lexico-cli/src/modules/library/providers/perseus-library.provider.ts:175]
         ↳ Processes one workflow step for Perseus XML ingestion.
        └─> PerseusLibraryProvider.processSourceXmlFile(…): Promise<void> [projects/lexico/lexico-cli/src/modules/library/providers/perseus-library.provider.ts:219]
           ↳ Processes one workflow step for Perseus XML ingestion.
          └─> PerseusLibraryProvider.writeSourceTextForAuthor(…): Promise<void> [projects/lexico/lexico-cli/src/modules/library/providers/perseus-library.provider.ts:311]
             ↳ Persists generated output for Perseus XML ingestion.
            └─> PerseusLibraryProvider.writeSourceMarkdownFiles(…): Promise<void> [projects/lexico/lexico-cli/src/modules/library/providers/perseus-library.provider.ts:263]
               ↳ Persists generated output for Perseus XML ingestion.
              └─> PerseusLibraryTextExtractionProvider.extractTextNodes(…): void (cycle) [projects/lexico/lexico-cli/src/modules/library/providers/perseus-library-text-extraction.provider.ts:206]
                 ↳ Builds markdown file payloads from nested Perseus `textpart` elements.
                └─> PerseusLibraryTextExtractionProvider.processTextPartChildren(…): void (cycle) [projects/lexico/lexico-cli/src/modules/library/providers/perseus-library-text-extraction.provider.ts:150]
                   ↳ Recurses into child text parts and writes direct child paragraphs.
                  └─> PerseusLibraryTextExtractionProvider.extractChildTextParts(…): void (cycle) [projects/lexico/lexico-cli/src/modules/library/providers/perseus-library-text-extraction.provider.ts:57]
                     ↳ Visits nested Perseus `textpart` children and extracts eligible sections.
                    └─> PerseusLibraryTextExtractionProvider.each(…)(_index: number, child: AnyNode): void (cycle) [projects/lexico/lexico-cli/src/modules/library/providers/perseus-library-text-extraction.provider.ts:66]
                      └─> PerseusLibraryTextExtractionProvider.processLeafTextPart(…): void [projects/lexico/lexico-cli/src/modules/library/providers/perseus-library-text-extraction.provider.ts:110]
                         ↳ Handles leaf nodes that write one markdown text file.
                        └─> PerseusLibraryTextExtractionProvider.collectParagraphsFromElements(elements: cheerio.Cheerio<AnyNode>, $: cheerio.CheerioAPI): string[] [projects/lexico/lexico-cli/src/modules/library/providers/perseus-library-text-extraction.provider.ts:26]
                           ↳ Collects normalized paragraph text from Perseus XML elements.
                          └─> PerseusLibraryTextExtractionProvider.each(…)(_index: number, paragraphElement: AnyNode): void [projects/lexico/lexico-cli/src/modules/library/providers/perseus-library-text-extraction.provider.ts:32]
                            └─> formatLineNumber(line: string): string [projects/lexico/lexico-cli/src/modules/library/library.utilities.ts:18]
                               ↳ Format line numbers consistently.
```

<details>
<summary>23 more call stacks</summary>

**4. `LatinLibraryCommand.run`** — depth ≥ 10 · decorated-method

```text
🚀 LatinLibraryCommand.run(): Promise<void> [projects/lexico/lexico-cli/src/modules/latin-library/latin-library.command.ts:381]
   ↳ Crawls The Latin Library and caches discovered HTML pages locally.
  └─> LatinLibraryCommand.from(…)(): Promise<void> [projects/lexico/lexico-cli/src/modules/latin-library/latin-library.command.ts:428]
    └─> LatinLibraryCommand.worker(): Promise<void> [projects/lexico/lexico-cli/src/modules/latin-library/latin-library.command.ts:419]
      └─> LatinLibraryCommand.processQueueUrl(urlString: string, host: string, enqueue: (url: string) => void): Promise<void> [projects/lexico/lexico-cli/src/modules/latin-library/latin-library.command.ts:345]
         ↳ Processes one workflow step for Latin Library source crawling.
        └─> LatinLibraryCommand.parseHtmlForLinks(html: string, baseUrl: string, enqueue: (url: string) => void): void [projects/lexico/lexico-cli/src/modules/latin-library/latin-library.command.ts:272]
           ↳ Parses and normalizes inputs for Latin Library source crawling.
          └─> LatinLibraryCommand.each(…)(this: Element, _index: number, a: Element): void [projects/lexico/lexico-cli/src/modules/latin-library/latin-library.command.ts:279]
            └─> LatinLibraryCommand.processLink(href: string, baseUrl: string, enqueue: (url: string) => void): void [projects/lexico/lexico-cli/src/modules/latin-library/latin-library.command.ts:324]
               ↳ Processes one workflow step for Latin Library source crawling.
              └─> LatinLibraryCommand.shouldSkipLink(href: string): boolean [projects/lexico/lexico-cli/src/modules/latin-library/latin-library.command.ts:370]
                 ↳ Handles an internal workflow step for Latin Library source crawling.
                └─> LatinLibraryCommand.isIgnoredLinkFileName(href: string): boolean [projects/lexico/lexico-cli/src/modules/latin-library/latin-library.command.ts:190]
                   ↳ Returns whether the current input should proceed in Latin Library source crawling.
                  └─> LatinLibraryCommand.some(…)(f: string): boolean [projects/lexico/lexico-cli/src/modules/latin-library/latin-library.command.ts:200]
```

**5. `WiktionaryCommand.run`** — depth ≥ 9 · decorated-method

```text
🚀 WiktionaryCommand.run(): Promise<void> [projects/lexico/lexico-cli/src/modules/wiktionary/wiktionary.command.ts:317]
   ↳ Runs the Wiktionary ingestion pipeline.
  └─> WiktionaryCommand.ingestWiktionary(): Promise<void> [projects/lexico/lexico-cli/src/modules/wiktionary/wiktionary.command.ts:302]
     ↳ Scrapes every configured Latin category from Wiktionary, stores each article's HTML as a JSON file under…
    └─> WiktionaryCommand.ingestCategory(category?: Category, startPath?: string): Promise<void> [projects/lexico/lexico-cli/src/modules/wiktionary/wiktionary.command.ts:150]
       ↳ Ingests category in the Wiktionary ingestion pipeline.
      └─> WiktionaryCommand.processWiktionaryCategoryLink(a: Element, $: cheerio.CheerioAPI, category: string): Promise<void> [projects/lexico/lexico-cli/src/modules/wiktionary/wiktionary.command.ts:246]
         ↳ Processes wiktionary category link during Wiktionary ingestion.
        └─> WiktionaryCommand.ingestWord(word: string, urlPath: string, category: string): Promise<void> [projects/lexico/lexico-cli/src/modules/wiktionary/wiktionary.command.ts:187]
           ↳ Ingests word in the Wiktionary ingestion pipeline.
          └─> WiktionaryCommand.saveWiktionaryEntry(…): void [projects/lexico/lexico-cli/src/modules/wiktionary/wiktionary.command.ts:281]
             ↳ Save wiktionary entry for Wiktionary ingestion.
            └─> WiktionaryCommand.getEntryFilePath(word: string): string [projects/lexico/lexico-cli/src/modules/wiktionary/wiktionary.command.ts:123]
               ↳ Resolves the cached JSON path for a word so a resumed crawl can skip it.
              └─> WiktionaryCommand.escapeCapitals(word: string): string [projects/lexico/lexico-cli/src/modules/wiktionary/wiktionary.command.ts:62]
                 ↳ Escape capitals for Wiktionary ingestion.
                └─> WiktionaryCommand.replaceAll(…)(character: string): string [projects/lexico/lexico-cli/src/modules/wiktionary/wiktionary.command.ts:65]
```

**6. `LiteratureService.ingestText`** — depth 8 · orphan-root

```text
🚀 LiteratureService.ingestText(ingestArguments: IngestTextArguments): Promise<void> [projects/lexico/lexico-cli/src/modules/literature/literature.service.ts:313]
  └─> LiteratureService.ingestText(args: IngestTextArguments): Promise<void> [projects/lexico/lexico-cli/src/modules/literature/literature.service.ts:270]
     ↳ Ingests text in the literature ingestion pipeline.
    └─> LiteratureService.ingestLines(text: Text, ast: Root): Promise<void> [projects/lexico/lexico-cli/src/modules/literature/literature.service.ts:241]
       ↳ Ingests lines in the literature ingestion pipeline.
      └─> LiteratureService.map(…)(paragraph: Paragraph, index: number): _QueryDeepPartialEntity<Line> [projects/lexico/lexico-cli/src/modules/literature/literature.service.ts:254]
        └─> LiteratureService.buildLineEntityFromParagraph(paragraph: Paragraph, index: number, text: Text): QueryDeepPartialEntity<Line> [projects/lexico/lexico-cli/src/modules/literature/literature.service.ts:91]
           ↳ Builds line entity from paragraph for literature ingestion.
          └─> LiteratureService.parseLabelFromStrongNode(strongNode: Strong, lineNodes: PhrasingContent[]): ParsedLabelResult [projects/lexico/lexico-cli/src/modules/literature/literature.service.ts:355]
             ↳ Parses label from strong node during literature ingestion.
            └─> LiteratureService.parseStandardLabel(labelMatch: RegExpExecArray, lineNodes: PhrasingContent[]): ParsedLabelResult [projects/lexico/lexico-cli/src/modules/literature/literature.service.ts:391]
               ↳ Parses standard label during literature ingestion.
              └─> NumeralsService.toDecimal(roman: string): number [projects/lexico/lexico-cli/src/modules/numerals/numerals.service.ts:25]
                 ↳ Parses a Roman numeral string into its decimal integer value.
```

**7. `LiteratureCommand.run`** — depth ≥ 6 · decorated-method

```text
🚀 LiteratureCommand.run(_arguments: string[], options: LiteratureCommandOptions): Promise<void> [projects/lexico/lexico-cli/src/modules/literature/literature.command.ts:218]
   ↳ Runs literature ingestion for the selected provider/author/text scope.
  └─> LiteratureService.ingestAllAuthors(textsToIngest: LibraryEntry[]): Promise<void> [projects/lexico/lexico-cli/src/modules/literature/literature.service.ts:489]
     ↳ Ingests all selected texts grouped by author.
    └─> LiteratureService.ingestAuthorGroup(authorSlug: string, texts: LibraryEntry[]): Promise<void> [projects/lexico/lexico-cli/src/modules/literature/literature.service.ts:211]
       ↳ Ingests author group in the literature ingestion pipeline.
      └─> LiteratureService.ingestTextChunks(…): Promise<void> [projects/lexico/lexico-cli/src/modules/literature/literature.service.ts:298]
         ↳ Ingests text chunks in the literature ingestion pipeline.
        └─> LiteratureTextIngestionService.ingestTextWithLogging(…): Promise<void> [projects/lexico/lexico-cli/src/modules/literature/literature-text-ingestion.service.ts:57]
           ↳ Runs ingestion for one text entry with standardized start, error, and completion logs.
          └─> LiteratureTextIngestionService.resolveParentText(…): Text | undefined [projects/lexico/lexico-cli/src/modules/literature/literature-text-ingestion.service.ts:40]
             ↳ Resolves the parent text for the current entry path, if present.
```

**8. `PartOfSpeechService.generic`** — depth ≥ 6 · orphan-root

```text
🚀 PartOfSpeechService.generic(): unknown [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:445]
  └─> PartOfSpeechFormsService.parseGenericForms(args: { $: cheerio.CheerioAPI; elt: AnyNode; lexeme: Lexeme; }): unknown [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech-forms.service.ts:358]
     ↳ Parses non-verb inflection table forms into nested identifiers.
    └─> PartOfSpeechFormsService.findGenericIdentifiers(…): string[] [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech-forms.service.ts:58]
       ↳ Finds generic identifiers for part-of-speech parsing workflows.
      └─> PartOfSpeechFormsService.collectTableIdentifiers(index: number, index_: number, table_: string[][]): Set<string> [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech-forms.service.ts:35]
         ↳ Collects table identifiers required by part-of-speech parsing.
        └─> PartOfSpeechFormsService.scanTableAxis(…): { finalIndex: number; identifiers: Set<string>; } [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech-forms.service.ts:299]
           ↳ Scans table axis for part-of-speech parsing context.
          └─> PartOfSpeechFormsService.isGenericFormCell(cell: string): boolean [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech-forms.service.ts:127]
             ↳ Checks whether generic form cell in part-of-speech parsing logic.
```

**9. `PartOfSpeechService.verb`** — depth ≥ 6 · orphan-root

```text
🚀 PartOfSpeechService.verb(): unknown [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:447]
  └─> PartOfSpeechFormsService.parseVerbForms(args: { $: cheerio.CheerioAPI; elt: AnyNode; }): unknown [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech-forms.service.ts:404]
     ↳ Parses verb inflection table forms into nested identifiers.
    └─> PartOfSpeechFormsService.processVerbFormRow(…): void [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech-forms.service.ts:225]
       ↳ Processes verb form row during part-of-speech parsing.
      └─> PartOfSpeechFormsService.findVerbIdentifiers(index: number, index_: number, table_: string[][]): string[] [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech-forms.service.ts:83]
         ↳ Finds verb identifiers for part-of-speech parsing workflows.
        └─> PartOfSpeechFormsService.scanVerbHeader(…): { finalIndex: number; identifiers: Set<string>; } [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech-forms.service.ts:317]
           ↳ Scans verb header for part-of-speech parsing context.
          └─> PartOfSpeechFormsService.isVerbFormCell(cell: string): boolean [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech-forms.service.ts:146]
             ↳ Checks whether verb form cell in part-of-speech parsing logic.
```

**10. `EpigraphikDatenbankClaussSlabyCommand.run`** — depth 5 · decorated-method

```text
🚀 EpigraphikDatenbankClaussSlabyCommand.run(): Promise<void> [projects/lexico/lexico-cli/src/modules/epigraphik-datenbank-clauss-slaby/epigraphik-datenbank-clauss-slaby.command.ts:137]
   ↳ Runs the ingestion of epigraphs by downloading chunks to the filesystem
  └─> EpigraphikDatenbankClaussSlabyCommand.downloadChunkIfMissing(start: number): Promise<boolean> [projects/lexico/lexico-cli/src/modules/epigraphik-datenbank-clauss-slaby/epigraphik-datenbank-clauss-slaby.command.ts:75]
     ↳ Handles an internal workflow step for EDCS chunk ingestion.
    └─> EpigraphikDatenbankClaussSlabyCommand.downloadChunkData(start: number, chunkFile: string): Promise<boolean> [projects/lexico/lexico-cli/src/modules/epigraphik-datenbank-clauss-slaby/epigraphik-datenbank-clauss-slaby.command.ts:50]
       ↳ Handles an internal workflow step for EDCS chunk ingestion.
      └─> EpigraphikDatenbankClaussSlabyCommand.saveChunkData(start: number, chunkFile: string): Promise<boolean> [projects/lexico/lexico-cli/src/modules/epigraphik-datenbank-clauss-slaby/epigraphik-datenbank-clauss-slaby.command.ts:97]
         ↳ Persists generated output for EDCS chunk ingestion.
        └─> EpigraphikDatenbankClaussSlabyCommand.anonymous(resolve: (value: unknown) => void): void [projects/lexico/lexico-cli/src/modules/epigraphik-datenbank-clauss-slaby/epigraphik-datenbank-clauss-slaby.command.ts:128]
```

**11. `PartOfSpeechService.adjective`** — depth ≥ 5 · orphan-root

```text
🚀 PartOfSpeechService.adjective(): Inflection [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:418]
  └─> PartOfSpeechService.ingestAdjectiveInflection($: cheerio.CheerioAPI, elt: AnyNode): Inflection [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:187]
     ↳ Ingests adjective inflection in the part-of-speech parsing pipeline.
    └─> PartOfSpeechService.buildAdjectiveInflection(declension: string): AdjectiveInflection [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:142]
       ↳ Builds adjective inflection for part-of-speech parsing.
      └─> PartOfSpeechService.findTypedValue(…): ValueType | undefined [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:129]
         ↳ Returns the first matching typed value from the provided candidate list.
        └─> PartOfSpeechService.find(…)(value: ValueType): value is ValueType [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:133]
```

**12. `PartOfSpeechService.noun`** — depth ≥ 5 · orphan-root

```text
🚀 PartOfSpeechService.noun(): Inflection [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:420]
  └─> PartOfSpeechService.ingestNounInflection($: cheerio.CheerioAPI, elt: AnyNode): Inflection [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:249]
     ↳ Ingests noun inflection in the part-of-speech parsing pipeline.
    └─> PartOfSpeechService.buildNounInflection(declension: string, gender: string): NounInflection [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:161]
       ↳ Builds noun inflection for part-of-speech parsing.
      └─> PartOfSpeechService.findTypedValue(…): ValueType | undefined [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:129]
         ↳ Returns the first matching typed value from the provided candidate list.
        └─> PartOfSpeechService.find(…)(value: ValueType): value is ValueType [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:133]
```

**13. `CorpusScriptorumEcclesiasticorumLatinorumCommand.run`** — depth 4 · decorated-method

```text
🚀 CorpusScriptorumEcclesiasticorumLatinorumCommand.run(): Promise<void> [projects/lexico/lexico-cli/src/modules/corpus-scriptorum-ecclesiasticorum-latinorum/corpus-scriptorum-ecclesiasticorum-latinorum.command.ts:127]
   ↳ Downloads all eligible CSEL Latin XML source files into the local cache.
  └─> CorpusScriptorumEcclesiasticorumLatinorumCommand.downloadSourceXmlFileIfMissing(xmlPath: string): Promise<void> [projects/lexico/lexico-cli/src/modules/corpus-scriptorum-ecclesiasticorum-latinorum/corpus-scriptorum-ecclesiasticorum-latinorum.command.ts:47]
     ↳ Downloads one XML file unless it is already present in the local source cache.
    └─> CorpusScriptorumEcclesiasticorumLatinorumCommand.fetchAndWriteXmlFile(fileUrl: string, targetPath: string): Promise<void> [projects/lexico/lexico-cli/src/modules/corpus-scriptorum-ecclesiasticorum-latinorum/corpus-scriptorum-ecclesiasticorum-latinorum.command.ts:76]
       ↳ Loads source data required by CSEL source ingestion.
      └─> CorpusScriptorumEcclesiasticorumLatinorumCommand.anonymous(resolve: (value: unknown) => void): void [projects/lexico/lexico-cli/src/modules/corpus-scriptorum-ecclesiasticorum-latinorum/corpus-scriptorum-ecclesiasticorum-latinorum.command.ts:88]
```

**14. `PerseusCommand.run`** — depth 4 · decorated-method

```text
🚀 PerseusCommand.run(): Promise<void> [projects/lexico/lexico-cli/src/modules/perseus/perseus.command.ts:133]
   ↳ Discovers eligible Perseus XML files and stores missing files in the local cache.
  └─> PerseusCommand.downloadSourceXmlFileIfMissing(xmlPath: string): Promise<void> [projects/lexico/lexico-cli/src/modules/perseus/perseus.command.ts:58]
     ↳ Download source xml file if missing for Perseus source ingestion.
    └─> PerseusCommand.fetchAndWriteXmlFile(fileUrl: string, targetPath: string): Promise<void> [projects/lexico/lexico-cli/src/modules/perseus/perseus.command.ts:81]
       ↳ Fetch and write xml file for Perseus source ingestion.
      └─> PerseusCommand.anonymous(resolve: (value: unknown) => void): void [projects/lexico/lexico-cli/src/modules/perseus/perseus.command.ts:92]
```

**15. `PartOfSpeechService.preposition`** — depth ≥ 4 · orphan-root

```text
🚀 PartOfSpeechService.preposition(): Inflection [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:422]
  └─> PartOfSpeechService.ingestPrepositionInflection($: cheerio.CheerioAPI, elt: AnyNode): Inflection [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:293]
     ↳ Ingests preposition inflection in the part-of-speech parsing pipeline.
    └─> PartOfSpeechService.findTypedValue(…): ValueType | undefined [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:129]
       ↳ Returns the first matching typed value from the provided candidate list.
      └─> PartOfSpeechService.find(…)(value: ValueType): value is ValueType [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:133]
```

**16. `PartOfSpeechService.pronoun`** — depth ≥ 4 · orphan-root

```text
🚀 PartOfSpeechService.pronoun(): Inflection [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:423]
  └─> PartOfSpeechService.ingestPronounInflection($: cheerio.CheerioAPI, elt: AnyNode): Inflection [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:318]
     ↳ Ingests pronoun inflection in the part-of-speech parsing pipeline.
    └─> PartOfSpeechService.findTypedValue(…): ValueType | undefined [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:129]
       ↳ Returns the first matching typed value from the provided candidate list.
      └─> PartOfSpeechService.find(…)(value: ValueType): value is ValueType [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:133]
```

**17. `PartOfSpeechService.verb`** — depth ≥ 4 · orphan-root

```text
🚀 PartOfSpeechService.verb(): Inflection [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:425]
  └─> PartOfSpeechService.ingestVerbInflection($: cheerio.CheerioAPI, elt: AnyNode): Inflection [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:350]
     ↳ Ingests verb inflection in the part-of-speech parsing pipeline.
    └─> PartOfSpeechService.findTypedValue(…): ValueType | undefined [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:129]
       ↳ Returns the first matching typed value from the provided candidate list.
      └─> PartOfSpeechService.find(…)(value: ValueType): value is ValueType [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:133]
```

**18. `PartOfSpeechService.adverb`** — depth 3 · orphan-root

```text
🚀 PartOfSpeechService.adverb(): unknown [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:444]
  └─> PartOfSpeechService.ingestAdverbForms(principalParts: PrincipalPart[]): unknown [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:221]
     ↳ Ingests adverb forms in the part-of-speech parsing pipeline.
    └─> PartOfSpeechService.getTextOrEmpty(part: PrincipalPart | undefined): string[] [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:182]
       ↳ Gets text or empty used by part-of-speech parsing.
```

**19. `ClearCommand.run`** — depth 2 · decorated-method

```text
🚀 ClearCommand.run(_passedParameters: string[], options: ClearCommandOptions): Promise<void> [projects/lexico/lexico-cli/src/modules/clear/clear.command.ts:138]
   ↳ Runs the clear pipeline for the options provided. If no options are specified, it prompts the user.
  └─> ClearCommand.parsePromptResponse(response: unknown): ClearPromptResponse [projects/lexico/lexico-cli/src/modules/clear/clear.command.ts:88]
     ↳ Parses prompt output into strongly typed clear options.
```

**20. `normalizeStringArray`** — depth 2 · orphan-root

```text
🚀 normalizeStringArray(…): string[] [projects/lexico/lexico-cli/src/modules/forms/forms.constants.ts:21]
  └─> isNormalizableStringArray(…): boolean [projects/lexico/lexico-cli/src/modules/forms/forms.constants.ts:17]
```

**21. `FormsService.setTransientWords`** — depth 2 · orphan-root

```text
🚀 FormsService.setTransientWords(form: Form, words: string[]): void [projects/lexico/lexico-cli/src/modules/forms/forms.service.ts:159]
   ↳ Sets transient word strings for a Form instance.
  └─> FormsTransientWordsService.setTransientWords(form: Form, words: string[]): void [projects/lexico/lexico-cli/src/modules/forms/forms-transient-words.service.ts:34]
     ↳ Associates a list of transient words with a given Form entity.
```

**22. `compactStringValues`** — depth 2 · orphan-root

```text
🚀 compactStringValues(…): string[] [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.constants.ts:17]
  └─> isCompactStringArray(…): boolean [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.constants.ts:13]
```

**23. `PartOfSpeechService.adverb`** — depth 2 · orphan-root

```text
🚀 PartOfSpeechService.adverb(): Inflection [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:419]
  └─> PartOfSpeechService.ingestAdverbInflection(principalParts: PrincipalPart[]): Inflection [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:235]
     ↳ Ingests adverb inflection in the part-of-speech parsing pipeline.
```

**24. `PartOfSpeechService.prefix`** — depth 2 · orphan-root

```text
🚀 PartOfSpeechService.prefix(): Inflection [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:421]
  └─> PartOfSpeechService.ingestPrefixInflection(): Inflection [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:288]
     ↳ Ingests prefix inflection in the part-of-speech parsing pipeline.
```

**25. `PartOfSpeechService.uninflected`** — depth 2 · orphan-root

```text
🚀 PartOfSpeechService.uninflected(): Inflection [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:424]
  └─> PartOfSpeechService.ingestConjunctionInflection(): Inflection [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:244]
     ↳ Ingests conjunction inflection in the part-of-speech parsing pipeline.
```

**26. `PartOfSpeechService.anonymous`** — depth 2 · orphan-root

```text
🚀 PartOfSpeechService.anonymous(): Inflection [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:427]
  └─> PartOfSpeechService.ingestConjunctionInflection(): Inflection [projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:244]
     ↳ Ingests conjunction inflection in the part-of-speech parsing pipeline.
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `PronunciationEcclesiasticalService.processEcclesiasticalCharacter` | 8 | `PronunciationEcclesiasticalService.classifyEcclesiasticalC`, `PronunciationEcclesiasticalService.classifyEcclesiasticalG`, `PronunciationEcclesiasticalService.classifyEcclesiasticalH`, `PronunciationEcclesiasticalService.classifyEcclesiasticalI`, `PronunciationEcclesiasticalService.classifyEcclesiasticalS`, `PronunciationEcclesiasticalService.classifyEcclesiasticalT`, `PronunciationEcclesiasticalService.classifyEcclesiasticalX`, `PronunciationEcclesiasticalService.lookupMultiCharacterPhoneme` | `projects/lexico/lexico-cli/src/modules/pronunciation/pronunciation-ecclesiastical.service.ts:305` |
| `LatinLibraryProvider.ingest` | 8 | `LatinLibraryProvider.readSourceCacheFile`, `LatinLibraryProvider.buildRootAuthors`, `LatinLibraryProvider.expandCategoryAuthors`, `LatinLibraryProvider.sort(…)`, `LatinLibraryProvider.filter(…)`, `LatinLibraryProvider.processAuthorPage`, `LatinLibraryProvider.writeAuthorTexts`, `LatinLibraryProvider.forEach(…)` | `projects/lexico/lexico-cli/src/modules/library/providers/latin-library.provider.ts:407` |
| `LexemesService.enrichLexeme` | 7 | `PrincipalPartsService.parsePrincipalParts`, `PartOfSpeechService.ingestInflection`, `TranslationsService.parseTranslations`, `EtymologyService.parse`, `PronunciationService.parse`, `PartOfSpeechService.parseForms`, `FormsBuilderService.buildFormsForPartOfSpeech` | `projects/lexico/lexico-cli/src/modules/lexemes/lexemes.service.ts:73` |

<details>
<summary>278 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `ManualService.ingestManual` | 7 | `ManualService.deleteManual`, `ManualService.createManual`, `buildHicTemplate`, `buildIlleTemplate`, `buildOmnisTemplate`, `ManualService.ingestPraenomenAbbreviations`, `ManualService.ingestRomanNumerals` | `projects/lexico/lexico-cli/src/modules/manual/manual.service.ts:191` |
| `LiteratureCommand.run` | 7 | `LiteratureService.scanLibrary`, `LiteratureCommand.resolveFilter`, `LiteratureCommand.getProviderChoices`, `LiteratureCommand.getAuthorChoices`, `LiteratureCommand.getTextChoices`, `LiteratureCommand.selectTextsToIngest`, `LiteratureService.ingestAllAuthors` | `projects/lexico/lexico-cli/src/modules/literature/literature.command.ts:218` |
| `FormsService.ingestLexemeForms` | 6 | `FormsService.findExistingFormsByLexemeId`, `FormsService.preserveMatchingExistingFormIdentity`, `FormsService.map(…)`, `FormsService.saveFormsForLexeme`, `FormsService.buildFormsByNormalizedWordMap`, `WordsService.upsertWordsAndJunctions` | `projects/lexico/lexico-cli/src/modules/forms/forms.service.ts:129` |
| `PronunciationClassicalService.processClassicalCharacter` | 6 | `PronunciationClassicalService.classifyClassicalH`, `PronunciationClassicalService.classifyClassicalI`, `PronunciationClassicalService.classifyClassicalJ`, `PronunciationClassicalService.classifyClassicalN`, `PronunciationClassicalService.lookupClassicalDevocalizeCharacter`, `PronunciationClassicalService.lookupMultiCharacterPhoneme` | `projects/lexico/lexico-cli/src/modules/pronunciation/pronunciation-classical.service.ts:140` |
| `LexemesService.saveLexemeRelations` | 6 | `LexemesService.saveInflection`, `PrincipalPartsService.ingestLexemePrincipalParts`, `PronunciationService.ingestLexemePronunciations`, `LexemesService.saveTranslations`, `FormsService.ingestLexemeForms`, `WordsService.ingestLexemeWords` | `projects/lexico/lexico-cli/src/modules/lexemes/lexemes.service.ts:218` |
| `LibraryCommand.parseIngestOptions` | 6 | `LibraryCommand.getProviderChoices`, `getOptionText`, `requireChoice`, `selectChoice`, `LibraryCommand.getAuthorChoices`, `LibraryCommand.getTextChoices` | `projects/lexico/lexico-cli/src/modules/library/library.command.ts:143` |
| `LatinLibraryProvider.processTextLink` | 6 | `LatinLibraryBuilder.isSkippedHref`, `LatinLibraryBuilder.isTextFileHref`, `LatinLibraryBuilder.isExternalOrSelfLink`, `LatinLibraryBuilder.findRawBookHeading`, `LatinLibraryBuilder.buildTextEntityForLink`, `LatinLibraryProvider.addTextToBook` | `projects/lexico/lexico-cli/src/modules/library/providers/latin-library.provider.ts:211` |
| `LatinLibraryProvider.writeWorkText` | 6 | `LatinLibraryProvider.getMetadataString`, `LatinLibraryProvider.readSourceCacheFile`, `LatinLibraryBuilder.parseWorkParagraphs`, `hasValidTextContent`, `LatinLibraryBuilder.buildWorkMarkdownContent`, `LatinLibraryProvider.saveWorkTextMarkdown` | `projects/lexico/lexico-cli/src/modules/library/providers/latin-library.provider.ts:368` |
| `LiteratureService.ingestLines` | 6 | `LiteratureService.getWordsCache`, `LiteratureService.filter(…)`, `LiteratureService.map(…)`, `LiteratureService.upsertAndFetchLines`, `LiteratureService.extractTokensFromLine`, `LiteratureService.upsertTokens` | `projects/lexico/lexico-cli/src/modules/literature/literature.service.ts:241` |
| `WordsService.ingestLexemeWords` | 5 | `WordsService.getLexemeWords`, `WordsService.filter(…)`, `WordsService.map(…)`, `WordsService.map(…)`, `WordsService.map(…)` | `projects/lexico/lexico-cli/src/modules/words/words.service.ts:127` |
| `WordsService.upsertWordsAndJunctions` | 5 | `WordsService.map(…)`, `WordsService.map(…)`, `WordsService.map(…)`, `WordsService.insertWordFormChunks`, `WordsService.buildWordFormValues` | `projects/lexico/lexico-cli/src/modules/words/words.service.ts:175` |
| `FormsBuilderService.buildVerbFormsFromRaw` | 5 | `FormsBuilderGuardsService.isRecord`, `FormsBuilderGuardsService.isFormMood`, `FormsBuilderService.buildFiniteVoiceForms`, `FormsBuilderService.buildVerbNonFiniteForms`, `FormsBuilderService.buildVerbNounForms` | `projects/lexico/lexico-cli/src/modules/forms/forms-builder.service.ts:394` |
| `DictionaryCommand.processTranslationReferences` | 5 | `TranslationsService.extractTranslationReferences`, `LexemesService.existsByLemma`, `DictionaryCommand.ingestLexeme`, `TranslationsService.findTranslationsWithReferences`, `DictionaryCommand.ingestTranslationReference` | `projects/lexico/lexico-cli/src/modules/dictionary/dictionary.command.ts:290` |
| `DictionaryCommand.resolveEndLemma` | 5 | `DictionaryCommand.filter(…)`, `DictionaryCommand.getLemmaChoices`, `getOptionText`, `requireChoice`, `selectChoice` | `projects/lexico/lexico-cli/src/modules/dictionary/dictionary.command.ts:328` |
| `LatinLibraryCommand.run` | 5 | `LatinLibraryCommand.fetchAndCachePage`, `LatinLibraryCommand.getAuthorUrls`, `LatinLibraryCommand.getFinalAuthorUrls`, `LatinLibraryCommand.enqueueAuthorUrls`, `LatinLibraryCommand.from(…)` | `projects/lexico/lexico-cli/src/modules/latin-library/latin-library.command.ts:381` |
| `LibraryCommand.getTextChoices` | 5 | `LibraryCommand.scanLibrary`, `LibraryCommand.filter(…)`, `LibraryCommand.filter(…)`, `LibraryCommand.map(…)`, `LibraryCommand.map(…)` | `projects/lexico/lexico-cli/src/modules/library/library.command.ts:107` |
| `CorpusScriptorumEcclesiasticorumLatinorumLibraryProvider.processSourceXmlFile` | 5 | `CorpusScriptorumEcclesiasticorumLatinorumLibraryProvider.parseSourceXmlFile`, `CorpusScriptorumEcclesiasticorumLatinorumLibraryProvider.getOrCreateAuthor`, `CorpusScriptorumEcclesiasticorumLatinorumLibraryProvider.writeSourceTextForAuthor`, `CorpusScriptorumEcclesiasticorumLatinorumLibraryProvider.anonymous`, `CorpusScriptorumEcclesiasticorumLatinorumLibraryProvider.logSourceProgress` | `projects/lexico/lexico-cli/src/modules/library/providers/corpus-scriptorum-ecclesiasticorum-latinorum-library.provider.ts:238` |
| `PerseusLibraryProvider.processSourceXmlFile` | 5 | `PerseusLibraryProvider.loadSourceXmlFile`, `PerseusLibraryProvider.isFilteredOut`, `PerseusLibraryProvider.extractPerseusMetadata`, `PerseusLibraryProvider.getOrCreatePerseusAuthor`, `PerseusLibraryProvider.writeSourceTextForAuthor` | `projects/lexico/lexico-cli/src/modules/library/providers/perseus-library.provider.ts:219` |
| `LiteratureCommand.getTextChoices` | 5 | `LiteratureService.scanLibrary`, `LiteratureCommand.filter(…)`, `LiteratureCommand.filter(…)`, `LiteratureCommand.map(…)`, `LiteratureCommand.map(…)` | `projects/lexico/lexico-cli/src/modules/literature/literature.command.ts:109` |
| `LexicoIngestionCommand.executeStages` | 5 | `WiktionaryCommand.run`, `DictionaryCommand.ingestAll`, `LexicoIngestionCommand.runLibrarySourcesStage`, `LibraryCommand.run`, `LiteratureCommand.run` | `projects/lexico/lexico-cli/src/modules/lexico-ingestion/lexico-ingestion.command.ts:54` |
| `CorpusScriptorumEcclesiasticorumLatinorumCommand.run` | 4 | `CorpusScriptorumEcclesiasticorumLatinorumCommand.fetchTree`, `CorpusScriptorumEcclesiasticorumLatinorumCommand.map(…)`, `CorpusScriptorumEcclesiasticorumLatinorumCommand.filter(…)`, `CorpusScriptorumEcclesiasticorumLatinorumCommand.downloadSourceXmlFileIfMissing` | `projects/lexico/lexico-cli/src/modules/corpus-scriptorum-ecclesiasticorum-latinorum/corpus-scriptorum-ecclesiasticorum-latinorum.command.ts:127` |
| `FormsBuilderService.buildAdjectivalNumberForms` | 4 | `FormsBuilderGuardsService.isFormCase`, `FormsBuilderGuardsService.isFormNumber`, `FormsBuilderGuardsService.isStringArray`, `FormsBuilderService.createAdjectivalForm` | `projects/lexico/lexico-cli/src/modules/forms/forms-builder.service.ts:112` |
| `FormsBuilderService.buildNominalNumberForms` | 4 | `FormsBuilderGuardsService.isFormCase`, `FormsBuilderGuardsService.isFormNumber`, `FormsBuilderGuardsService.isStringArray`, `FormsTransientWordsService.setTransientWords` | `projects/lexico/lexico-cli/src/modules/forms/forms-builder.service.ts:330` |
| `FormsBuilderService.buildFormsForPartOfSpeech` | 4 | `FormsBuilderService.buildAdjectivalFormsFromRaw`, `FormsBuilderService.buildAdverbFormsFromRaw`, `FormsBuilderService.buildNominalFormsFromRaw`, `FormsBuilderService.buildVerbFormsFromRaw` | `projects/lexico/lexico-cli/src/modules/forms/forms-builder.service.ts:483` |
| `PartOfSpeechFormsService.findGenericIdentifiers` | 4 | `PartOfSpeechFormsService.collectTableIdentifiers`, `PartOfSpeechFormsService.find(…)`, `PartOfSpeechFormsService.find(…)`, `PartOfSpeechFormsService.find(…)` | `projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech-forms.service.ts:58` |
| `PartOfSpeechFormsService.findVerbIdentifiers` | 4 | `PartOfSpeechFormsService.scanVerbHeader(…)`, `PartOfSpeechFormsService.scanVerbHeader`, `PartOfSpeechFormsService.scanVerbHeader(…)`, `PartOfSpeechFormsService.map(…)` | `projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech-forms.service.ts:83` |
| `PartOfSpeechFormsService.parseGenericForms` | 4 | `PartOfSpeechFormsService.parseFormTable`, `PartOfSpeechFormsService.map(…)`, `PartOfSpeechFormsService.findGenericIdentifiers`, `PartOfSpeechFormsService.sortIdentifiers` | `projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech-forms.service.ts:358` |
| `PronunciationService.parse` | 4 | `PronunciationService.buildDefaultPronunciation`, `PronunciationService.getClassicalPhonemes`, `PronunciationService.getEcclesiasticalPronunciations`, `PronunciationClassifierService.applyWiktionaryPronunciations` | `projects/lexico/lexico-cli/src/modules/pronunciation/pronunciation.service.ts:181` |
| `TranslationsService.parseTranslations` | 4 | `TranslationsService.capitalizeFirstLetter`, `TranslationsService.map(…)`, `Translation.constructor`, `TranslationsService.filter(…)` | `projects/lexico/lexico-cli/src/modules/translations/translations.service.ts:96` |
| `LexemesService.parseLexemeFromElement` | 4 | `PartOfSpeechService.getPartOfSpeech`, `PartOfSpeechService.getFirstPrincipalPartName`, `LexemesService.buildLexeme`, `LexemesService.enrichLexeme` | `projects/lexico/lexico-cli/src/modules/lexemes/lexemes.service.ts:146` |
| `ManualService.ingestRomanNumerals` | 4 | `NumeralsService.toRoman`, `buildRomanNumeralTemplate`, `Translation.constructor`, `ManualService.createManual` | `projects/lexico/lexico-cli/src/modules/manual/manual.service.ts:117` |
| `DictionaryCommand.processTranslationMatch` | 4 | `LexemesService.findLexemesByLemmaWithTranslations`, `DictionaryCommand.normalize`, `DictionaryCommand.find(…)`, `DictionaryCommand.map(…)` | `projects/lexico/lexico-cli/src/modules/dictionary/dictionary.command.ts:255` |
| `DictionaryCommand.resolveStartLemma` | 4 | `DictionaryCommand.getLemmaChoices`, `getOptionText`, `requireChoice`, `selectChoice` | `projects/lexico/lexico-cli/src/modules/dictionary/dictionary.command.ts:356` |
| `DictionaryCommand.ingestLexeme` | 4 | `DictionaryCommand.getPageForLexeme`, `LexemesService.parseLexemes`, `LexemesService.saveParsedLexeme`, `DictionaryCommand.processTranslationReferences` | `projects/lexico/lexico-cli/src/modules/dictionary/dictionary.command.ts:415` |
| `DictionaryCommand.run` | 4 | `DictionaryCommand.resolveStartLemma`, `DictionaryCommand.resolveEndLemma`, `DictionaryCommand.ingestAll`, `ManualService.ingestManual` | `projects/lexico/lexico-cli/src/modules/dictionary/dictionary.command.ts:485` |
| `LatinLibraryCommand.processQueueUrl` | 4 | `LatinLibraryCommand.fetchAndCachePage`, `LatinLibraryCommand.isParsableHtmlExtension`, `LatinLibraryCommand.getBaseUrl`, `LatinLibraryCommand.parseHtmlForLinks` | `projects/lexico/lexico-cli/src/modules/latin-library/latin-library.command.ts:345` |
| `LibraryCommand.getAuthorChoices` | 4 | `LibraryCommand.scanLibrary`, `LibraryCommand.filter(…)`, `LibraryCommand.map(…)`, `LibraryCommand.map(…)` | `projects/lexico/lexico-cli/src/modules/library/library.command.ts:85` |
| `LibraryCommand.processProvider` | 4 | `CorpusScriptorumEcclesiasticorumLatinorumLibraryProvider.ingest`, `EpigraphikDatenbankClaussSlabyLibraryProvider.ingest`, `LatinLibraryProvider.ingest`, `PerseusLibraryProvider.ingest` | `projects/lexico/lexico-cli/src/modules/library/library.command.ts:181` |
| `EpigraphikDatenbankClaussSlabyLibraryProvider.ingest` | 4 | `EpigraphikDatenbankClaussSlabyLibraryProvider.createSourceAuthor`, `EpigraphikDatenbankClaussSlabyLibraryProvider.readSourceChunkFiles`, `EpigraphikDatenbankClaussSlabyLibraryProvider.processSourceChunkPhase`, `EpigraphikDatenbankClaussSlabyLibraryProvider.saveEdcsProvincePhase` | `projects/lexico/lexico-cli/src/modules/library/providers/epigraphik-datenbank-clauss-slaby-library.provider.ts:305` |
| `LatinLibraryProvider.processAuthorPage` | 4 | `LatinLibraryProvider.getMetadataString`, `LatinLibraryProvider.readSourceCacheFile`, `LatinLibraryBuilder.extractAuthorPageMetadata`, `LatinLibraryProvider.collectAuthorTexts` | `projects/lexico/lexico-cli/src/modules/library/providers/latin-library.provider.ts:180` |
| `LiteratureService.ingestText` | 4 | `LiteratureService.parseFrontmatter`, `LiteratureService.getMetadataRecord`, `LiteratureService.saveTextToDatabase`, `LiteratureService.ingestLines` | `projects/lexico/lexico-cli/src/modules/literature/literature.service.ts:270` |
| `LiteratureCommand.getAuthorChoices` | 4 | `LiteratureService.scanLibrary`, `LiteratureCommand.filter(…)`, `LiteratureCommand.map(…)`, `LiteratureCommand.map(…)` | `projects/lexico/lexico-cli/src/modules/literature/literature.command.ts:82` |
| `LiteratureCommand.selectTextsToIngest` | 4 | `LiteratureCommand.filter(…)`, `LiteratureCommand.filter(…)`, `LiteratureCommand.filter(…)`, `LiteratureCommand.deduplicateByProvider` | `projects/lexico/lexico-cli/src/modules/literature/literature.command.ts:155` |
| `LexicoIngestionCommand.runLibrarySourcesStage` | 4 | `PerseusCommand.run`, `LatinLibraryCommand.run`, `CorpusScriptorumEcclesiasticorumLatinorumCommand.run`, `EpigraphikDatenbankClaussSlabyCommand.run` | `projects/lexico/lexico-cli/src/modules/lexico-ingestion/lexico-ingestion.command.ts:149` |
| `ClearCommand.run` | 3 | `ClearCommand.parsePromptResponse`, `ClearCommand.clearLiterature`, `ClearCommand.clearDictionary` | `projects/lexico/lexico-cli/src/modules/clear/clear.command.ts:138` |
| `FormsBuilderVerbService.collectParticipleFormsForTense` | 3 | `FormsBuilderGuardsService.isFormNonFiniteTense`, `FormsBuilderGuardsService.isRecord`, `FormsBuilderGuardsService.isFormGender` | `projects/lexico/lexico-cli/src/modules/forms/forms-builder-verb.service.ts:77` |
| `FormsBuilderVerbService.buildFinitePersonForms` | 3 | `FormsBuilderGuardsService.isFormPerson`, `FormsBuilderGuardsService.isStringArray`, `FormsBuilderVerbService.buildFiniteVerbForm` | `projects/lexico/lexico-cli/src/modules/forms/forms-builder-verb.service.ts:121` |
| `FormsBuilderVerbService.buildParticipleFormsFromRaw` | 3 | `FormsBuilderGuardsService.isFormNonFiniteTense`, `FormsBuilderVerbService.collectParticipleFormsForTense`, `FormsBuilderVerbService.applyTenseToParticipleForms` | `projects/lexico/lexico-cli/src/modules/forms/forms-builder-verb.service.ts:149` |
| `FormsBuilderService.buildAdjectivalCaseForms` | 3 | `FormsBuilderGuardsService.isFormCase`, `FormsBuilderGuardsService.isRecord`, `FormsBuilderService.buildAdjectivalNumberForms` | `projects/lexico/lexico-cli/src/modules/forms/forms-builder.service.ts:62` |
| `FormsBuilderService.buildAdjectivalFormsFromRaw` | 3 | `FormsBuilderGuardsService.isRecord`, `FormsBuilderGuardsService.isFormGender`, `FormsBuilderService.buildAdjectivalCaseForms` | `projects/lexico/lexico-cli/src/modules/forms/forms-builder.service.ts:91` |
| `FormsBuilderService.buildAdverbFormsFromRaw` | 3 | `FormsBuilderGuardsService.isRecord`, `FormsBuilderGuardsService.isStringArray`, `FormsTransientWordsService.setTransientWords` | `projects/lexico/lexico-cli/src/modules/forms/forms-builder.service.ts:146` |
| `FormsBuilderService.buildFiniteNumberForms` | 3 | `FormsBuilderGuardsService.isFormNumber`, `FormsBuilderGuardsService.isRecord`, `FormsBuilderVerbService.buildFinitePersonForms` | `projects/lexico/lexico-cli/src/modules/forms/forms-builder.service.ts:168` |
| `FormsBuilderService.buildFiniteTenseForms` | 3 | `FormsBuilderGuardsService.isFormTense`, `FormsBuilderGuardsService.isRecord`, `FormsBuilderService.buildFiniteNumberForms` | `projects/lexico/lexico-cli/src/modules/forms/forms-builder.service.ts:204` |
| `FormsBuilderService.buildFiniteVoiceForms` | 3 | `FormsBuilderGuardsService.isFormVoice`, `FormsBuilderGuardsService.isRecord`, `FormsBuilderService.buildFiniteTenseForms` | `projects/lexico/lexico-cli/src/modules/forms/forms-builder.service.ts:238` |
| `FormsBuilderService.buildGerundForms` | 3 | `FormsBuilderGuardsService.isGerundCase`, `FormsBuilderGuardsService.isStringArray`, `FormsTransientWordsService.setTransientWords` | `projects/lexico/lexico-cli/src/modules/forms/forms-builder.service.ts:264` |
| `FormsBuilderService.buildInfinitiveForms` | 3 | `FormsBuilderGuardsService.isFormNonFiniteTense`, `FormsBuilderGuardsService.isStringArray`, `FormsTransientWordsService.setTransientWords` | `projects/lexico/lexico-cli/src/modules/forms/forms-builder.service.ts:285` |
| `FormsBuilderService.buildNominalFormsFromRaw` | 3 | `FormsBuilderGuardsService.isRecord`, `FormsBuilderGuardsService.isFormCase`, `FormsBuilderService.buildNominalNumberForms` | `projects/lexico/lexico-cli/src/modules/forms/forms-builder.service.ts:307` |
| `FormsBuilderService.buildSupineForms` | 3 | `FormsBuilderGuardsService.isSupineCase`, `FormsBuilderGuardsService.isStringArray`, `FormsTransientWordsService.setTransientWords` | `projects/lexico/lexico-cli/src/modules/forms/forms-builder.service.ts:373` |
| `FormsBuilderService.buildVerbNonFiniteForms` | 3 | `FormsBuilderGuardsService.isRecord`, `FormsBuilderService.buildInfinitiveForms`, `FormsBuilderService.buildParticipleFormsFromRaw` | `projects/lexico/lexico-cli/src/modules/forms/forms-builder.service.ts:419` |
| `FormsBuilderService.buildVerbNounForms` | 3 | `FormsBuilderGuardsService.isRecord`, `FormsBuilderService.buildGerundForms`, `FormsBuilderService.buildSupineForms` | `projects/lexico/lexico-cli/src/modules/forms/forms-builder.service.ts:439` |
| `PartOfSpeechFormsService.collectTableIdentifiers` | 3 | `PartOfSpeechFormsService.scanTableAxis(…)`, `PartOfSpeechFormsService.scanTableAxis`, `PartOfSpeechFormsService.scanTableAxis(…)` | `projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech-forms.service.ts:35` |
| `PartOfSpeechFormsService.parseFormTable` | 3 | `PartOfSpeechFormsService.filter(…)`, `PartOfSpeechFormsService.map(…)`, `PartOfSpeechFormsService.map(…)` | `projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech-forms.service.ts:169` |
| `PartOfSpeechFormsService.parseVerbForms` | 3 | `PartOfSpeechFormsService.parseFormTable`, `PartOfSpeechFormsService.processVerbFormRow`, `PartOfSpeechFormsService.sortIdentifiers` | `projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech-forms.service.ts:404` |
| `LexemesService.saveParsedLexeme` | 3 | `LexemesService.upsertLexeme`, `LexemesService.fetchSavedLexeme`, `LexemesService.saveLexemeRelations` | `projects/lexico/lexico-cli/src/modules/lexemes/lexemes.service.ts:335` |
| `buildHicTemplate` | 3 | `buildGenderedPrincipalParts`, `Translation.constructor`, `buildAdjectivalForms` | `projects/lexico/lexico-cli/src/modules/manual/manual.utilities.ts:66` |
| `buildIlleTemplate` | 3 | `buildGenderedPrincipalParts`, `Translation.constructor`, `buildAdjectivalForms` | `projects/lexico/lexico-cli/src/modules/manual/manual.utilities.ts:116` |
| `buildOmnisTemplate` | 3 | `buildGenderedPrincipalParts`, `Translation.constructor`, `buildAdjectivalForms` | `projects/lexico/lexico-cli/src/modules/manual/manual.utilities.ts:169` |
| `ManualService.buildPraenomenLexeme` | 3 | `buildPraenomenAbbreviationTemplate`, `ManualService.buildPraenomenTranslations`, `ManualService.resolvePraenomenGender` | `projects/lexico/lexico-cli/src/modules/manual/manual.service.ts:52` |
| `DictionaryCommand.ingestAll` | 3 | `DictionaryCommand.filter(…)`, `DictionaryCommand.getLemmaFileRange`, `DictionaryCommand.processFile` | `projects/lexico/lexico-cli/src/modules/dictionary/dictionary.command.ts:381` |
| `LatinLibraryCommand.shouldSkipLink` | 3 | `LatinLibraryCommand.isIgnoredLinkFileName`, `LatinLibraryCommand.isIgnoredProtocol`, `LatinLibraryCommand.isInvalidExtension` | `projects/lexico/lexico-cli/src/modules/latin-library/latin-library.command.ts:370` |
| `LibraryCommand.run` | 3 | `LibraryCommand.parseIngestOptions`, `LibraryCommand.buildIngestParameters`, `LibraryCommand.processProvider` | `projects/lexico/lexico-cli/src/modules/library/library.command.ts:428` |
| `CorpusScriptorumEcclesiasticorumLatinorumLibraryProvider.writeSourceTextForAuthor` | 3 | `CorpusScriptorumEcclesiasticorumLatinorumLibraryProvider.createCselTextEntity`, `CorpusScriptorumEcclesiasticorumLatinorumLibraryProvider.extractParagraphs`, `CorpusScriptorumEcclesiasticorumLatinorumLibraryProvider.buildCselTextContent` | `projects/lexico/lexico-cli/src/modules/library/providers/corpus-scriptorum-ecclesiasticorum-latinorum-library.provider.ts:341` |
| `LatinLibraryBuilder.extractLinesFromParagraph` | 3 | `cleanBoilerplate`, `LatinLibraryBuilder.parseParagraphHtml`, `LatinLibraryBuilder.extractParagraphLines` | `projects/lexico/lexico-cli/src/modules/library/providers/latin-library.builder.ts:63` |
| `LatinLibraryBuilder.extractParagraphLines` | 3 | `cleanBoilerplate`, `isEnglishBoilerplate`, `formatLineNumber` | `projects/lexico/lexico-cli/src/modules/library/providers/latin-library.builder.ts:87` |
| `LatinLibraryProvider.expandCategoryAuthors` | 3 | `LatinLibraryProvider.getMetadataString`, `LatinLibraryProvider.readSourceCacheFile`, `LatinLibraryProvider.each(…)` | `projects/lexico/lexico-cli/src/modules/library/providers/latin-library.provider.ts:128` |
| `PerseusLibraryTextExtractionProvider.processLeafTextPart` | 3 | `PerseusLibraryTextExtractionProvider.collectParagraphsFromElements`, `formatLineNumber`, `hasValidTextContent` | `projects/lexico/lexico-cli/src/modules/library/providers/perseus-library-text-extraction.provider.ts:110` |
| `PerseusLibraryTextExtractionProvider.processTextPartChildren` | 3 | `PerseusLibraryTextExtractionProvider.extractChildTextParts`, `PerseusLibraryTextExtractionProvider.collectParagraphsFromElements`, `hasValidTextContent` | `projects/lexico/lexico-cli/src/modules/library/providers/perseus-library-text-extraction.provider.ts:150` |
| `PerseusLibraryProvider.writeSourceMarkdownFiles` | 3 | `PerseusLibraryTextExtractionProvider.extractTextNodes`, `PerseusLibraryProvider.writeTextFiles`, `PerseusLibraryProvider.anonymous` | `projects/lexico/lexico-cli/src/modules/library/providers/perseus-library.provider.ts:263` |
| `LiteratureCommand.getProviderChoices` | 3 | `LiteratureService.scanLibrary`, `LiteratureCommand.map(…)`, `LiteratureCommand.map(…)` | `projects/lexico/lexico-cli/src/modules/literature/literature.command.ts:98` |
| `LiteratureCommand.resolveFilter` | 3 | `getOptionText`, `requireChoice`, `selectChoice` | `projects/lexico/lexico-cli/src/modules/literature/literature.command.ts:134` |
| `WiktionaryCommand.ingestCategory` | 3 | `WiktionaryCommand.fetchCategoryPage`, `WiktionaryCommand.processWiktionaryCategoryLink`, `WiktionaryCommand.handleCategoryError` | `projects/lexico/lexico-cli/src/modules/wiktionary/wiktionary.command.ts:150` |
| `WiktionaryCommand.ingestWord` | 3 | `WiktionaryCommand.getEntryFilePath`, `WiktionaryCommand.parseLatinSection`, `WiktionaryCommand.saveWiktionaryEntry` | `projects/lexico/lexico-cli/src/modules/wiktionary/wiktionary.command.ts:187` |
| `WiktionaryCommand.processWiktionaryCategoryLink` | 3 | `WiktionaryCommand.getEntryFilePath`, `WiktionaryCommand.ingestWord`, `WiktionaryCommand.anonymous` | `projects/lexico/lexico-cli/src/modules/wiktionary/wiktionary.command.ts:246` |
| `WordsService.map(…)` | 2 | `WordsService.escapeCapitals`, `WordsService.normalize` | `projects/lexico/lexico-cli/src/modules/words/words.service.ts:136` |
| `normalizeStringArray` | 2 | `isNormalizableStringArray`, `filter(…)` | `projects/lexico/lexico-cli/src/modules/forms/forms.constants.ts:21` |
| `FormsService.findIndex(…)` | 2 | `FormsService.filter(…)`, `FormsService.every(…)` | `projects/lexico/lexico-cli/src/modules/forms/forms.service.ts:80` |
| `EtymologyService.parse` | 2 | `EtymologyService.filter(…)`, `Translation.constructor` | `projects/lexico/lexico-cli/src/modules/etymology/etymology.service.ts:31` |
| `compactStringValues` | 2 | `isCompactStringArray`, `filter(…)` | `projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.constants.ts:17` |
| `PartOfSpeechFormsService.processVerbFormRow` | 2 | `PartOfSpeechFormsService.findVerbIdentifiers`, `PartOfSpeechFormsService.parseVerbWordCell` | `projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech-forms.service.ts:225` |
| `PartOfSpeechFormsService.resolveVerbSumEntry` | 2 | `PartOfSpeechFormsService.lookupSumEsseFuiEntry`, `PartOfSpeechFormsService.map(…)` | `projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech-forms.service.ts:251` |
| `PartOfSpeechService.ingestAdjectiveInflection` | 2 | `PartOfSpeechService.filter(…)`, `PartOfSpeechService.buildAdjectiveInflection` | `projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:187` |
| `PartOfSpeechService.ingestNounInflection` | 2 | `PartOfSpeechService.filter(…)`, `PartOfSpeechService.buildNounInflection` | `projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:249` |
| `PrincipalPartsService.parsePrincipalParts` | 2 | `PrincipalPartsService.map(…)`, `PrincipalPartsService.classifyPrincipalPart` | `projects/lexico/lexico-cli/src/modules/principal-parts/principal-parts.service.ts:84` |
| `PronunciationEcclesiasticalService.isEcclesiasticalVocalI` | 2 | `PronunciationEcclesiasticalService.isInitialVocalI`, `PronunciationEcclesiasticalService.isInterVocalicI` | `projects/lexico/lexico-cli/src/modules/pronunciation/pronunciation-ecclesiastical.service.ts:41` |
| `PronunciationEcclesiasticalService.classifyEcclesiasticalI` | 2 | `PronunciationEcclesiasticalService.isEcclesiasticalVocalI`, `PronunciationPhonemesService.getStringPhoneme` | `projects/lexico/lexico-cli/src/modules/pronunciation/pronunciation-ecclesiastical.service.ts:188` |
| `PronunciationEcclesiasticalService.classifyEcclesiasticalS` | 2 | `PronunciationEcclesiasticalService.isBetweenVowels`, `PronunciationEcclesiasticalService.isScConsonant` | `projects/lexico/lexico-cli/src/modules/pronunciation/pronunciation-ecclesiastical.service.ts:207` |
| `PronunciationEcclesiasticalService.classifyEcclesiasticalX` | 2 | `PronunciationEcclesiasticalService.isBetweenVowels`, `PronunciationEcclesiasticalService.isScConsonant` | `projects/lexico/lexico-cli/src/modules/pronunciation/pronunciation-ecclesiastical.service.ts:242` |
| `PronunciationClassifierService.applyWiktionaryPronunciations` | 2 | `PronunciationClassifierService.filter(…)`, `PronunciationClassifierService.updateVariantPronunciation` | `projects/lexico/lexico-cli/src/modules/pronunciation/pronunciation-classifier.service.ts:87` |
| `PronunciationService.getEcclesiasticalPronunciations` | 2 | `PronunciationService.buildPronunciations`, `PronunciationService.getEcclesiasticalPhonemes` | `projects/lexico/lexico-cli/src/modules/pronunciation/pronunciation.service.ts:150` |
| `LexemesService.parseLexemes` | 2 | `LexemesService.normalize`, `LexemesService.parseLexemeFromElement` | `projects/lexico/lexico-cli/src/modules/lexemes/lexemes.service.ts:307` |
| `ManualService.ingestPraenomenAbbreviations` | 2 | `ManualService.createManual`, `ManualService.buildPraenomenLexeme` | `projects/lexico/lexico-cli/src/modules/manual/manual.service.ts:102` |
| `ManualService.createManual` | 2 | `ManualService.deleteManual`, `WordsService.ingestLexemeWords` | `projects/lexico/lexico-cli/src/modules/manual/manual.service.ts:161` |
| `DictionaryCommand.getLemmaChoices` | 2 | `DictionaryCommand.map(…)`, `DictionaryCommand.filter(…)` | `projects/lexico/lexico-cli/src/modules/dictionary/dictionary.command.ts:83` |
| `DictionaryCommand.getLemmaFileRange` | 2 | `DictionaryCommand.findIndex(…)`, `DictionaryCommand.findIndex(…)` | `projects/lexico/lexico-cli/src/modules/dictionary/dictionary.command.ts:99` |
| `DictionaryCommand.ingestTranslationReference` | 2 | `DictionaryCommand.processTranslationMatch`, `TranslationsService.saveTranslations` | `projects/lexico/lexico-cli/src/modules/dictionary/dictionary.command.ts:174` |
| `DictionaryCommand.loadWiktionaryPageForWord` | 2 | `DictionaryCommand.getWiktionaryFilePathForWord`, `DictionaryCommand.readWiktionaryPageFromFile` | `projects/lexico/lexico-cli/src/modules/dictionary/dictionary.command.ts:202` |
| `DictionaryCommand.processFile` | 2 | `DictionaryCommand.readWiktionaryPageFromFile`, `DictionaryCommand.ingestLexeme` | `projects/lexico/lexico-cli/src/modules/dictionary/dictionary.command.ts:230` |
| `LatinLibraryCommand.fetchAndCachePage` | 2 | `LatinLibraryCommand.getRelativePath`, `LatinLibraryCommand.downloadAndSaveLatinLibraryFile` | `projects/lexico/lexico-cli/src/modules/latin-library/latin-library.command.ts:86` |
| `LatinLibraryCommand.processCategoryHref` | 2 | `LatinLibraryCommand.fetchAndCachePage`, `LatinLibraryCommand.each(…)` | `projects/lexico/lexico-cli/src/modules/latin-library/latin-library.command.ts:290` |
| `LatinLibraryCommand.processLink` | 2 | `LatinLibraryCommand.shouldSkipLink`, `LatinLibraryCommand.isSkipPath` | `projects/lexico/lexico-cli/src/modules/latin-library/latin-library.command.ts:324` |
| `LibraryCommand.getProviderChoices` | 2 | `LibraryCommand.map(…)`, `LibraryCommand.map(…)` | `projects/lexico/lexico-cli/src/modules/library/library.command.ts:99` |
| `LibraryCommand.scanLibrary` | 2 | `LibraryCommand.scanLibraryProvider`, `LibraryCommand.isMissingDirectoryError` | `projects/lexico/lexico-cli/src/modules/library/library.command.ts:251` |
| `CorpusScriptorumEcclesiasticorumLatinorumLibraryProvider.collectSourceXmlPaths` | 2 | `CorpusScriptorumEcclesiasticorumLatinorumLibraryProvider.map(…)`, `CorpusScriptorumEcclesiasticorumLatinorumLibraryProvider.filter(…)` | `projects/lexico/lexico-cli/src/modules/library/providers/corpus-scriptorum-ecclesiasticorum-latinorum-library.provider.ts:70` |
| `CorpusScriptorumEcclesiasticorumLatinorumLibraryProvider.resolveSourceXmlMetadata` | 2 | `CorpusScriptorumEcclesiasticorumLatinorumLibraryProvider.getMetadata`, `CorpusScriptorumEcclesiasticorumLatinorumLibraryProvider.checkTextFilter` | `projects/lexico/lexico-cli/src/modules/library/providers/corpus-scriptorum-ecclesiasticorum-latinorum-library.provider.ts:301` |
| `CorpusScriptorumEcclesiasticorumLatinorumLibraryProvider.ingest` | 2 | `CorpusScriptorumEcclesiasticorumLatinorumLibraryProvider.collectSourceXmlPaths`, `CorpusScriptorumEcclesiasticorumLatinorumLibraryProvider.processSourceXmlFile` | `projects/lexico/lexico-cli/src/modules/library/providers/corpus-scriptorum-ecclesiasticorum-latinorum-library.provider.ts:385` |
| `EpigraphikDatenbankClaussSlabyLibraryProvider.saveEdcsProvince` | 2 | `EpigraphikDatenbankClaussSlabyLibraryProvider.getOrCreateBookText`, `EpigraphikDatenbankClaussSlabyLibraryProvider.saveEdcsChunkFile` | `projects/lexico/lexico-cli/src/modules/library/providers/epigraphik-datenbank-clauss-slaby-library.provider.ts:217` |
| `LatinLibraryBuilder.buildCategoryAuthor` | 2 | `LatinLibraryBuilder.some(…)`, `LatinLibraryBuilder.makeAuthor` | `projects/lexico/lexico-cli/src/modules/library/providers/latin-library.builder.ts:152` |
| `LatinLibraryProvider.collectAuthorTexts` | 2 | `LatinLibraryProvider.processTextLink`, `LatinLibraryProvider.addFallbackText` | `projects/lexico/lexico-cli/src/modules/library/providers/latin-library.provider.ts:111` |
| `LatinLibraryProvider.processWork` | 2 | `LatinLibraryBuilder.getTextSlug`, `LatinLibraryProvider.writeWorkText` | `projects/lexico/lexico-cli/src/modules/library/providers/latin-library.provider.ts:248` |
| `LatinLibraryProvider.writeAuthorTexts` | 2 | `LatinLibraryProvider.flatMap(…)`, `LatinLibraryProvider.processWork` | `projects/lexico/lexico-cli/src/modules/library/providers/latin-library.provider.ts:336` |
| `PerseusLibraryTextExtractionProvider.each(…)` | 2 | `PerseusLibraryTextExtractionProvider.getTextPartDescriptor`, `PerseusLibraryTextExtractionProvider.extractTextNodes` | `projects/lexico/lexico-cli/src/modules/library/providers/perseus-library-text-extraction.provider.ts:66` |
| `PerseusLibraryTextExtractionProvider.extractTextNodes` | 2 | `PerseusLibraryTextExtractionProvider.processTextPartChildren`, `PerseusLibraryTextExtractionProvider.processLeafTextPart` | `projects/lexico/lexico-cli/src/modules/library/providers/perseus-library-text-extraction.provider.ts:206` |
| `PerseusLibraryProvider.collectSourceXmlPaths` | 2 | `PerseusLibraryProvider.map(…)`, `PerseusLibraryProvider.filter(…)` | `projects/lexico/lexico-cli/src/modules/library/providers/perseus-library.provider.ts:53` |
| `PerseusLibraryProvider.writeSourceTextForAuthor` | 2 | `PerseusLibraryProvider.addPerseusTextEntity`, `PerseusLibraryProvider.writeSourceMarkdownFiles` | `projects/lexico/lexico-cli/src/modules/library/providers/perseus-library.provider.ts:311` |
| `PerseusLibraryProvider.ingest` | 2 | `PerseusLibraryProvider.collectSourceXmlPaths`, `PerseusLibraryProvider.processPerseusFile` | `projects/lexico/lexico-cli/src/modules/library/providers/perseus-library.provider.ts:371` |
| `LiteratureLibraryScanService.scanLibrary` | 2 | `LiteratureLibraryScanService.walkLibraryDirectory`, `LiteratureLibraryScanService.isMissingDirectoryError` | `projects/lexico/lexico-cli/src/modules/literature/literature-library-scan.service.ts:84` |
| `LiteratureTextIngestionService.ingestTextWithLogging` | 2 | `LiteratureTextIngestionService.resolveParentText`, `LiteratureTextIngestionService.buildHierarchyPrefix` | `projects/lexico/lexico-cli/src/modules/literature/literature-text-ingestion.service.ts:57` |
| `LiteratureService.map(…)` | 2 | `LiteratureWordNormalizationService.escapeCapitals`, `LiteratureWordNormalizationService.normalize` | `projects/lexico/lexico-cli/src/modules/literature/literature.service.ts:158` |
| `LiteratureService.ingestAuthorGroup` | 2 | `LiteratureService.ensureParentTexts`, `LiteratureService.ingestTextChunks` | `projects/lexico/lexico-cli/src/modules/literature/literature.service.ts:211` |
| `LiteratureService.parseFrontmatter` | 2 | `LiteratureService.find(…)`, `LiteratureService.isRecord` | `projects/lexico/lexico-cli/src/modules/literature/literature.service.ts:338` |
| `LiteratureService.parseLabelFromStrongNode` | 2 | `LiteratureService.parseStandardLabel`, `LiteratureService.parseNonStandardLabel` | `projects/lexico/lexico-cli/src/modules/literature/literature.service.ts:355` |
| `PerseusCommand.downloadSourceXmlFileIfMissing` | 2 | `PerseusCommand.fetchAndWriteXmlFile`, `PerseusCommand.appendSourceDownloadErrorLog` | `projects/lexico/lexico-cli/src/modules/perseus/perseus.command.ts:58` |
| `PerseusCommand.fetchSourceXmlPaths` | 2 | `PerseusCommand.map(…)`, `PerseusCommand.filter(…)` | `projects/lexico/lexico-cli/src/modules/perseus/perseus.command.ts:100` |
| `PerseusCommand.run` | 2 | `PerseusCommand.fetchSourceXmlPaths`, `PerseusCommand.downloadSourceXmlFileIfMissing` | `projects/lexico/lexico-cli/src/modules/perseus/perseus.command.ts:133` |
| `WiktionaryCommand.ingestWiktionary` | 2 | `WiktionaryCommand.filter(…)`, `WiktionaryCommand.ingestCategory` | `projects/lexico/lexico-cli/src/modules/wiktionary/wiktionary.command.ts:302` |
| `LexicoIngestionCommand.run` | 2 | `LexicoIngestionCommand.promptForMissingOptions`, `LexicoIngestionCommand.executeStages` | `projects/lexico/lexico-cli/src/modules/lexico-ingestion/lexico-ingestion.command.ts:219` |
| `CorpusScriptorumEcclesiasticorumLatinorumCommand.downloadSourceXmlFileIfMissing` | 1 | `CorpusScriptorumEcclesiasticorumLatinorumCommand.fetchAndWriteXmlFile` | `projects/lexico/lexico-cli/src/modules/corpus-scriptorum-ecclesiasticorum-latinorum/corpus-scriptorum-ecclesiasticorum-latinorum.command.ts:47` |
| `CorpusScriptorumEcclesiasticorumLatinorumCommand.fetchAndWriteXmlFile` | 1 | `CorpusScriptorumEcclesiasticorumLatinorumCommand.anonymous` | `projects/lexico/lexico-cli/src/modules/corpus-scriptorum-ecclesiasticorum-latinorum/corpus-scriptorum-ecclesiasticorum-latinorum.command.ts:76` |
| `WordsService.escapeCapitals` | 1 | `WordsService.replaceAll(…)` | `projects/lexico/lexico-cli/src/modules/words/words.service.ts:67` |
| `WordsService.getLexemeWords` | 1 | `WordsService.forEach(…)` | `projects/lexico/lexico-cli/src/modules/words/words.service.ts:118` |
| `FormsBuilderVerbService.buildFiniteVerbForm` | 1 | `FormsTransientWordsService.setTransientWords` | `projects/lexico/lexico-cli/src/modules/forms/forms-builder-verb.service.ts:55` |
| `FormsBuilderService.buildParticipleFormsFromRaw` | 1 | `FormsBuilderVerbService.buildParticipleFormsFromRaw` | `projects/lexico/lexico-cli/src/modules/forms/forms-builder.service.ts:361` |
| `FormsBuilderService.createAdjectivalForm` | 1 | `FormsTransientWordsService.setTransientWords` | `projects/lexico/lexico-cli/src/modules/forms/forms-builder.service.ts:459` |
| `FormsService.preserveMatchingExistingFormIdentity` | 1 | `FormsService.findIndex(…)` | `projects/lexico/lexico-cli/src/modules/forms/forms.service.ts:75` |
| `FormsService.map(…)` | 1 | `FormsTransientWordsService.getTransientWords` | `projects/lexico/lexico-cli/src/modules/forms/forms.service.ts:138` |
| `FormsService.setTransientWords` | 1 | `FormsTransientWordsService.setTransientWords` | `projects/lexico/lexico-cli/src/modules/forms/forms.service.ts:159` |
| `PartOfSpeechFormsService.find(…)` | 1 | `PartOfSpeechFormsService.isNumber` | `projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech-forms.service.ts:72` |
| `PartOfSpeechFormsService.find(…)` | 1 | `PartOfSpeechFormsService.isCase` | `projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech-forms.service.ts:73` |
| `PartOfSpeechFormsService.find(…)` | 1 | `PartOfSpeechFormsService.isGender` | `projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech-forms.service.ts:74` |
| `PartOfSpeechFormsService.map(…)` | 1 | `PartOfSpeechFormsService.map(…)` | `projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech-forms.service.ts:189` |
| `PartOfSpeechFormsService.map(…)` | 1 | `PartOfSpeechFormsService.map(…)` | `projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech-forms.service.ts:193` |
| `PartOfSpeechFormsService.parseVerbWordCell` | 1 | `PartOfSpeechFormsService.resolveVerbSumEntry` | `projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech-forms.service.ts:207` |
| `PartOfSpeechFormsService.scanTableAxis` | 1 | `PartOfSpeechFormsService.isGenericFormCell` | `projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech-forms.service.ts:299` |
| `PartOfSpeechFormsService.scanVerbHeader` | 1 | `PartOfSpeechFormsService.isVerbFormCell` | `projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech-forms.service.ts:317` |
| `PartOfSpeechFormsService.sortIdentifiers` | 1 | `PartOfSpeechFormsService.isRecord` | `projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech-forms.service.ts:336` |
| `PartOfSpeechService.findTypedValue` | 1 | `PartOfSpeechService.find(…)` | `projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:129` |
| `PartOfSpeechService.buildAdjectiveInflection` | 1 | `PartOfSpeechService.findTypedValue` | `projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:142` |
| `PartOfSpeechService.buildNounInflection` | 1 | `PartOfSpeechService.findTypedValue` | `projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:161` |
| `PartOfSpeechService.ingestAdverbForms` | 1 | `PartOfSpeechService.getTextOrEmpty` | `projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:221` |
| `PartOfSpeechService.ingestPrepositionInflection` | 1 | `PartOfSpeechService.findTypedValue` | `projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:293` |
| `PartOfSpeechService.ingestPronounInflection` | 1 | `PartOfSpeechService.findTypedValue` | `projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:318` |
| `PartOfSpeechService.ingestVerbInflection` | 1 | `PartOfSpeechService.findTypedValue` | `projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:350` |
| `PartOfSpeechService.getPartOfSpeech` | 1 | `PartOfSpeechService.isPartOfSpeech` | `projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:393` |
| `PartOfSpeechService.adjective` | 1 | `PartOfSpeechService.ingestAdjectiveInflection` | `projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:418` |
| `PartOfSpeechService.adverb` | 1 | `PartOfSpeechService.ingestAdverbInflection` | `projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:419` |
| `PartOfSpeechService.noun` | 1 | `PartOfSpeechService.ingestNounInflection` | `projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:420` |
| `PartOfSpeechService.prefix` | 1 | `PartOfSpeechService.ingestPrefixInflection` | `projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:421` |
| `PartOfSpeechService.preposition` | 1 | `PartOfSpeechService.ingestPrepositionInflection` | `projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:422` |
| `PartOfSpeechService.pronoun` | 1 | `PartOfSpeechService.ingestPronounInflection` | `projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:423` |
| `PartOfSpeechService.uninflected` | 1 | `PartOfSpeechService.ingestConjunctionInflection` | `projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:424` |
| `PartOfSpeechService.verb` | 1 | `PartOfSpeechService.ingestVerbInflection` | `projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:425` |
| `PartOfSpeechService.anonymous` | 1 | `PartOfSpeechService.ingestConjunctionInflection` | `projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:427` |
| `PartOfSpeechService.adverb` | 1 | `PartOfSpeechService.ingestAdverbForms` | `projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:444` |
| `PartOfSpeechService.generic` | 1 | `PartOfSpeechFormsService.parseGenericForms` | `projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:445` |
| `PartOfSpeechService.verb` | 1 | `PartOfSpeechFormsService.parseVerbForms` | `projects/lexico/lexico-cli/src/modules/part-of-speech/part-of-speech.service.ts:447` |
| `PrincipalPartsService.ingestLexemePrincipalParts` | 1 | `PrincipalPartsService.find(…)` | `projects/lexico/lexico-cli/src/modules/principal-parts/principal-parts.service.ts:65` |
| `PronunciationEcclesiasticalService.classifyEcclesiasticalC` | 1 | `PronunciationEcclesiasticalService.isPalatalizedCConsonant` | `projects/lexico/lexico-cli/src/modules/pronunciation/pronunciation-ecclesiastical.service.ts:120` |
| `PronunciationEcclesiasticalService.classifyEcclesiasticalG` | 1 | `PronunciationEcclesiasticalService.isPalatalizedGConsonant` | `projects/lexico/lexico-cli/src/modules/pronunciation/pronunciation-ecclesiastical.service.ts:143` |
| `PronunciationEcclesiasticalService.lookupMultiCharacterPhoneme` | 1 | `PronunciationPhonemesService.getStringPhoneme` | `projects/lexico/lexico-cli/src/modules/pronunciation/pronunciation-ecclesiastical.service.ts:264` |
| `PronunciationClassifierService.updateVariantPronunciation` | 1 | `PronunciationClassifierService.parsePhonics` | `projects/lexico/lexico-cli/src/modules/pronunciation/pronunciation-classifier.service.ts:63` |
| `PronunciationClassifierService.processClassicalCharacter` | 1 | `PronunciationClassicalService.processClassicalCharacter` | `projects/lexico/lexico-cli/src/modules/pronunciation/pronunciation-classifier.service.ts:119` |
| `PronunciationClassifierService.processEcclesiasticalCharacter` | 1 | `PronunciationEcclesiasticalService.processEcclesiasticalCharacter` | `projects/lexico/lexico-cli/src/modules/pronunciation/pronunciation-classifier.service.ts:130` |
| `PronunciationService.buildPronunciations` | 1 | `PronunciationService.build` | `projects/lexico/lexico-cli/src/modules/pronunciation/pronunciation.service.ts:59` |
| `PronunciationService.getClassicalPhonemes` | 1 | `PronunciationClassifierService.processClassicalCharacter` | `projects/lexico/lexico-cli/src/modules/pronunciation/pronunciation.service.ts:90` |
| `PronunciationService.getEcclesiasticalPhonemes` | 1 | `PronunciationClassifierService.processEcclesiasticalCharacter` | `projects/lexico/lexico-cli/src/modules/pronunciation/pronunciation.service.ts:124` |
| `PronunciationService.ingestLexemePronunciations` | 1 | `PronunciationService.find(…)` | `projects/lexico/lexico-cli/src/modules/pronunciation/pronunciation.service.ts:159` |
| `TranslationsService.map(…)` | 1 | `TranslationsService.normalize` | `projects/lexico/lexico-cli/src/modules/translations/translations.service.ts:125` |
| `TranslationsService.prepareTranslationsForSave` | 1 | `TranslationsService.find(…)` | `projects/lexico/lexico-cli/src/modules/translations/translations.service.ts:140` |
| `LexemesService.buildLexeme` | 1 | `LexemesService.normalize` | `projects/lexico/lexico-cli/src/modules/lexemes/lexemes.service.ts:58` |
| `LexemesService.saveTranslations` | 1 | `TranslationsService.prepareTranslationsForSave` | `projects/lexico/lexico-cli/src/modules/lexemes/lexemes.service.ts:248` |
| `NumeralsService.toRoman` | 1 | `NumeralsService.convertDigit` | `projects/lexico/lexico-cli/src/modules/numerals/numerals.service.ts:44` |
| `buildAdjectivalForms` | 1 | `flatMap(…)` | `projects/lexico/lexico-cli/src/modules/manual/manual.utilities.ts:17` |
| `flatMap(…)` | 1 | `flatMap(…)` | `projects/lexico/lexico-cli/src/modules/manual/manual.utilities.ts:20` |
| `flatMap(…)` | 1 | `flatMap(…)` | `projects/lexico/lexico-cli/src/modules/manual/manual.utilities.ts:21` |
| `flatMap(…)` | 1 | `createAdjectivalForm` | `projects/lexico/lexico-cli/src/modules/manual/manual.utilities.ts:22` |
| `ManualService.buildPraenomenTranslations` | 1 | `Translation.constructor` | `projects/lexico/lexico-cli/src/modules/manual/manual.service.ts:75` |
| `requireChoice` | 1 | `some(…)` | `projects/lexico/lexico-cli/src/modules/lexico-ingestion/lexico-ingestion.utilities.ts:33` |
| `selectChoice` | 1 | `isInteractiveTerminal` | `projects/lexico/lexico-cli/src/modules/lexico-ingestion/lexico-ingestion.utilities.ts:50` |
| `DictionaryCommand.escapeCapitals` | 1 | `DictionaryCommand.replaceAll(…)` | `projects/lexico/lexico-cli/src/modules/dictionary/dictionary.command.ts:73` |
| `DictionaryCommand.getPageForLexeme` | 1 | `DictionaryCommand.loadWiktionaryPageForWord` | `projects/lexico/lexico-cli/src/modules/dictionary/dictionary.command.ts:122` |
| `DictionaryCommand.getWiktionaryFilePathForWord` | 1 | `DictionaryCommand.escapeCapitals` | `projects/lexico/lexico-cli/src/modules/dictionary/dictionary.command.ts:138` |
| `DictionaryCommand.map(…)` | 1 | `Translation.constructor` | `projects/lexico/lexico-cli/src/modules/dictionary/dictionary.command.ts:282` |
| `EpigraphikDatenbankClaussSlabyCommand.downloadChunkData` | 1 | `EpigraphikDatenbankClaussSlabyCommand.saveChunkData` | `projects/lexico/lexico-cli/src/modules/epigraphik-datenbank-clauss-slaby/epigraphik-datenbank-clauss-slaby.command.ts:50` |
| `EpigraphikDatenbankClaussSlabyCommand.downloadChunkIfMissing` | 1 | `EpigraphikDatenbankClaussSlabyCommand.downloadChunkData` | `projects/lexico/lexico-cli/src/modules/epigraphik-datenbank-clauss-slaby/epigraphik-datenbank-clauss-slaby.command.ts:75` |
| `EpigraphikDatenbankClaussSlabyCommand.saveChunkData` | 1 | `EpigraphikDatenbankClaussSlabyCommand.anonymous` | `projects/lexico/lexico-cli/src/modules/epigraphik-datenbank-clauss-slaby/epigraphik-datenbank-clauss-slaby.command.ts:97` |
| `EpigraphikDatenbankClaussSlabyCommand.run` | 1 | `EpigraphikDatenbankClaussSlabyCommand.downloadChunkIfMissing` | `projects/lexico/lexico-cli/src/modules/epigraphik-datenbank-clauss-slaby/epigraphik-datenbank-clauss-slaby.command.ts:137` |
| `LatinLibraryCommand.downloadAndSaveLatinLibraryFile` | 1 | `LatinLibraryCommand.anonymous` | `projects/lexico/lexico-cli/src/modules/latin-library/latin-library.command.ts:46` |
| `LatinLibraryCommand.getAuthorUrls` | 1 | `LatinLibraryCommand.each(…)` | `projects/lexico/lexico-cli/src/modules/latin-library/latin-library.command.ts:114` |
| `LatinLibraryCommand.getFinalAuthorUrls` | 1 | `LatinLibraryCommand.processCategoryHref` | `projects/lexico/lexico-cli/src/modules/latin-library/latin-library.command.ts:149` |
| `LatinLibraryCommand.isIgnoredLinkFileName` | 1 | `LatinLibraryCommand.some(…)` | `projects/lexico/lexico-cli/src/modules/latin-library/latin-library.command.ts:190` |
| `LatinLibraryCommand.isInvalidExtension` | 1 | `LatinLibraryCommand.some(…)` | `projects/lexico/lexico-cli/src/modules/latin-library/latin-library.command.ts:219` |
| `LatinLibraryCommand.isSkipPath` | 1 | `LatinLibraryCommand.some(…)` | `projects/lexico/lexico-cli/src/modules/latin-library/latin-library.command.ts:247` |
| `LatinLibraryCommand.parseHtmlForLinks` | 1 | `LatinLibraryCommand.each(…)` | `projects/lexico/lexico-cli/src/modules/latin-library/latin-library.command.ts:272` |
| `LatinLibraryCommand.each(…)` | 1 | `LatinLibraryCommand.processLink` | `projects/lexico/lexico-cli/src/modules/latin-library/latin-library.command.ts:279` |
| `LatinLibraryCommand.worker` | 1 | `LatinLibraryCommand.processQueueUrl` | `projects/lexico/lexico-cli/src/modules/latin-library/latin-library.command.ts:419` |
| `LatinLibraryCommand.from(…)` | 1 | `LatinLibraryCommand.worker` | `projects/lexico/lexico-cli/src/modules/latin-library/latin-library.command.ts:428` |
| `LibraryCommand.buildIngestParameters` | 1 | `LibraryCommand.filter(…)` | `projects/lexico/lexico-cli/src/modules/library/library.command.ts:65` |
| `LibraryCommand.scanLibraryAuthor` | 1 | `LibraryCommand.walkLibraryDirectory` | `projects/lexico/lexico-cli/src/modules/library/library.command.ts:295` |
| `LibraryCommand.scanLibraryProvider` | 1 | `LibraryCommand.scanLibraryAuthor` | `projects/lexico/lexico-cli/src/modules/library/library.command.ts:321` |
| `LibraryCommand.walkLibraryDirectory` | 1 | `LibraryCommand.pushTextEntry` | `projects/lexico/lexico-cli/src/modules/library/library.command.ts:350` |
| `CorpusScriptorumEcclesiasticorumLatinorumLibraryProvider.buildCselTextContent` | 1 | `hasValidTextContent` | `projects/lexico/lexico-cli/src/modules/library/providers/corpus-scriptorum-ecclesiasticorum-latinorum-library.provider.ts:26` |
| `CorpusScriptorumEcclesiasticorumLatinorumLibraryProvider.extractParagraphs` | 1 | `CorpusScriptorumEcclesiasticorumLatinorumLibraryProvider.each(…)` | `projects/lexico/lexico-cli/src/modules/library/providers/corpus-scriptorum-ecclesiasticorum-latinorum-library.provider.ts:110` |
| `CorpusScriptorumEcclesiasticorumLatinorumLibraryProvider.each(…)` | 1 | `formatLineNumber` | `projects/lexico/lexico-cli/src/modules/library/providers/corpus-scriptorum-ecclesiasticorum-latinorum-library.provider.ts:114` |
| `CorpusScriptorumEcclesiasticorumLatinorumLibraryProvider.getMetadata` | 1 | `CorpusScriptorumEcclesiasticorumLatinorumLibraryProvider.map(…)` | `projects/lexico/lexico-cli/src/modules/library/providers/corpus-scriptorum-ecclesiasticorum-latinorum-library.provider.ts:142` |
| `CorpusScriptorumEcclesiasticorumLatinorumLibraryProvider.parseSourceXmlFile` | 1 | `CorpusScriptorumEcclesiasticorumLatinorumLibraryProvider.resolveSourceXmlMetadata` | `projects/lexico/lexico-cli/src/modules/library/providers/corpus-scriptorum-ecclesiasticorum-latinorum-library.provider.ts:204` |
| `EpigraphikDatenbankClaussSlabyLibraryProvider.processSourceChunkFile` | 1 | `EpigraphikDatenbankClaussSlabyLibraryProvider.processEdcsRecord` | `projects/lexico/lexico-cli/src/modules/library/providers/epigraphik-datenbank-clauss-slaby-library.provider.ts:100` |
| `EpigraphikDatenbankClaussSlabyLibraryProvider.processSourceChunkPhase` | 1 | `EpigraphikDatenbankClaussSlabyLibraryProvider.processSourceChunkFile` | `projects/lexico/lexico-cli/src/modules/library/providers/epigraphik-datenbank-clauss-slaby-library.provider.ts:133` |
| `EpigraphikDatenbankClaussSlabyLibraryProvider.readSourceChunkFiles` | 1 | `EpigraphikDatenbankClaussSlabyLibraryProvider.filter(…)` | `projects/lexico/lexico-cli/src/modules/library/providers/epigraphik-datenbank-clauss-slaby-library.provider.ts:155` |
| `EpigraphikDatenbankClaussSlabyLibraryProvider.saveEdcsProvincePhase` | 1 | `EpigraphikDatenbankClaussSlabyLibraryProvider.saveEdcsProvince` | `projects/lexico/lexico-cli/src/modules/library/providers/epigraphik-datenbank-clauss-slaby-library.provider.ts:268` |
| `LatinLibraryBuilder.extractAuthorDates` | 1 | `LatinLibraryBuilder.computeYear` | `projects/lexico/lexico-cli/src/modules/library/providers/latin-library.builder.ts:42` |
| `LatinLibraryBuilder.parseParagraphHtml` | 1 | `LatinLibraryBuilder.each(…)` | `projects/lexico/lexico-cli/src/modules/library/providers/latin-library.builder.ts:126` |
| `LatinLibraryBuilder.buildRootAuthors` | 1 | `LatinLibraryBuilder.each(…)` | `projects/lexico/lexico-cli/src/modules/library/providers/latin-library.builder.ts:177` |
| `LatinLibraryBuilder.each(…)` | 1 | `LatinLibraryBuilder.makeAuthor` | `projects/lexico/lexico-cli/src/modules/library/providers/latin-library.builder.ts:183` |
| `LatinLibraryBuilder.buildWorkFrontmatter` | 1 | `LatinLibraryBuilder.getMetadataString` | `projects/lexico/lexico-cli/src/modules/library/providers/latin-library.builder.ts:220` |
| `LatinLibraryBuilder.buildWorkMarkdownContent` | 1 | `LatinLibraryBuilder.buildWorkFrontmatter` | `projects/lexico/lexico-cli/src/modules/library/providers/latin-library.builder.ts:245` |
| `LatinLibraryBuilder.extractAuthorPageMetadata` | 1 | `LatinLibraryBuilder.extractAuthorDates` | `projects/lexico/lexico-cli/src/modules/library/providers/latin-library.builder.ts:270` |
| `LatinLibraryBuilder.getTextSlug` | 1 | `LatinLibraryBuilder.getMetadataString` | `projects/lexico/lexico-cli/src/modules/library/providers/latin-library.builder.ts:320` |
| `LatinLibraryBuilder.isSkippedHref` | 1 | `LatinLibraryBuilder.some(…)` | `projects/lexico/lexico-cli/src/modules/library/providers/latin-library.builder.ts:342` |
| `LatinLibraryBuilder.parseWorkParagraphs` | 1 | `LatinLibraryBuilder.each(…)` | `projects/lexico/lexico-cli/src/modules/library/providers/latin-library.builder.ts:386` |
| `LatinLibraryBuilder.each(…)` | 1 | `LatinLibraryBuilder.extractLinesFromParagraph` | `projects/lexico/lexico-cli/src/modules/library/providers/latin-library.builder.ts:393` |
| `LatinLibraryProvider.addFallbackText` | 1 | `LatinLibraryProvider.getMetadataString` | `projects/lexico/lexico-cli/src/modules/library/providers/latin-library.provider.ts:35` |
| `LatinLibraryProvider.buildCategoryAuthor` | 1 | `LatinLibraryBuilder.buildCategoryAuthor` | `projects/lexico/lexico-cli/src/modules/library/providers/latin-library.provider.ts:74` |
| `LatinLibraryProvider.buildRootAuthors` | 1 | `LatinLibraryBuilder.buildRootAuthors` | `projects/lexico/lexico-cli/src/modules/library/providers/latin-library.provider.ts:84` |
| `LatinLibraryProvider.cleanupAuthorMetadata` | 1 | `LatinLibraryProvider.forEach(…)` | `projects/lexico/lexico-cli/src/modules/library/providers/latin-library.provider.ts:91` |
| `LatinLibraryProvider.each(…)` | 1 | `LatinLibraryProvider.buildCategoryAuthor` | `projects/lexico/lexico-cli/src/modules/library/providers/latin-library.provider.ts:156` |
| `LatinLibraryProvider.sort(…)` | 1 | `LatinLibraryProvider.getMetadataString` | `projects/lexico/lexico-cli/src/modules/library/providers/latin-library.provider.ts:416` |
| `LatinLibraryProvider.forEach(…)` | 1 | `LatinLibraryProvider.cleanupAuthorMetadata` | `projects/lexico/lexico-cli/src/modules/library/providers/latin-library.provider.ts:437` |
| `PerseusLibraryTextExtractionProvider.collectParagraphsFromElements` | 1 | `PerseusLibraryTextExtractionProvider.each(…)` | `projects/lexico/lexico-cli/src/modules/library/providers/perseus-library-text-extraction.provider.ts:26` |
| `PerseusLibraryTextExtractionProvider.each(…)` | 1 | `formatLineNumber` | `projects/lexico/lexico-cli/src/modules/library/providers/perseus-library-text-extraction.provider.ts:32` |
| `PerseusLibraryTextExtractionProvider.extractChildTextParts` | 1 | `PerseusLibraryTextExtractionProvider.each(…)` | `projects/lexico/lexico-cli/src/modules/library/providers/perseus-library-text-extraction.provider.ts:57` |
| `PerseusLibraryTextExtractionProvider.getTextPartDescriptor` | 1 | `PerseusLibraryTextExtractionProvider.shouldSkipTextPart` | `projects/lexico/lexico-cli/src/modules/library/providers/perseus-library-text-extraction.provider.ts:86` |
| `PerseusLibraryTextExtractionProvider.shouldSkipTextPart` | 1 | `PerseusLibraryTextExtractionProvider.some(…)` | `projects/lexico/lexico-cli/src/modules/library/providers/perseus-library-text-extraction.provider.ts:186` |
| `PerseusLibraryProvider.extractPerseusMetadata` | 1 | `PerseusLibraryProvider.map(…)` | `projects/lexico/lexico-cli/src/modules/library/providers/perseus-library.provider.ts:81` |
| `PerseusLibraryProvider.loadSourceXmlFile` | 1 | `PerseusLibraryProvider.then(…)` | `projects/lexico/lexico-cli/src/modules/library/providers/perseus-library.provider.ts:158` |
| `PerseusLibraryProvider.processPerseusFile` | 1 | `PerseusLibraryProvider.processSourceXmlFile` | `projects/lexico/lexico-cli/src/modules/library/providers/perseus-library.provider.ts:175` |
| `LiteratureWordNormalizationService.escapeCapitals` | 1 | `LiteratureWordNormalizationService.replaceAll(…)` | `projects/lexico/lexico-cli/src/modules/literature/literature-word-normalization.service.ts:27` |
| `LiteratureService.buildLineEntityFromParagraph` | 1 | `LiteratureService.parseLabelFromStrongNode` | `projects/lexico/lexico-cli/src/modules/literature/literature.service.ts:91` |
| `LiteratureService.extractTokensFromLine` | 1 | `LiteratureService.map(…)` | `projects/lexico/lexico-cli/src/modules/literature/literature.service.ts:152` |
| `LiteratureService.getWordsCache` | 1 | `LiteratureService.map(…)` | `projects/lexico/lexico-cli/src/modules/literature/literature.service.ts:195` |
| `LiteratureService.map(…)` | 1 | `LiteratureService.buildLineEntityFromParagraph` | `projects/lexico/lexico-cli/src/modules/literature/literature.service.ts:254` |
| `LiteratureService.ingestTextChunks` | 1 | `LiteratureTextIngestionService.ingestTextWithLogging` | `projects/lexico/lexico-cli/src/modules/literature/literature.service.ts:298` |
| `LiteratureService.ingestText` | 1 | `LiteratureService.ingestText` | `projects/lexico/lexico-cli/src/modules/literature/literature.service.ts:313` |
| `LiteratureService.parseNonStandardLabel` | 1 | `NumeralsService.toDecimal` | `projects/lexico/lexico-cli/src/modules/literature/literature.service.ts:369` |
| `LiteratureService.parseStandardLabel` | 1 | `NumeralsService.toDecimal` | `projects/lexico/lexico-cli/src/modules/literature/literature.service.ts:391` |
| `LiteratureService.saveTextToDatabase` | 1 | `LiteratureService.isRecord` | `projects/lexico/lexico-cli/src/modules/literature/literature.service.ts:409` |
| `LiteratureService.upsertAndFetchLines` | 1 | `LiteratureService.map(…)` | `projects/lexico/lexico-cli/src/modules/literature/literature.service.ts:445` |
| `LiteratureService.upsertTokens` | 1 | `LiteratureService.map(…)` | `projects/lexico/lexico-cli/src/modules/literature/literature.service.ts:468` |
| `LiteratureService.ingestAllAuthors` | 1 | `LiteratureService.ingestAuthorGroup` | `projects/lexico/lexico-cli/src/modules/literature/literature.service.ts:489` |
| `LiteratureService.scanLibrary` | 1 | `LiteratureLibraryScanService.scanLibrary` | `projects/lexico/lexico-cli/src/modules/literature/literature.service.ts:507` |
| `PerseusCommand.fetchAndWriteXmlFile` | 1 | `PerseusCommand.anonymous` | `projects/lexico/lexico-cli/src/modules/perseus/perseus.command.ts:81` |
| `WiktionaryCommand.escapeCapitals` | 1 | `WiktionaryCommand.replaceAll(…)` | `projects/lexico/lexico-cli/src/modules/wiktionary/wiktionary.command.ts:62` |
| `WiktionaryCommand.fetchCategoryPage` | 1 | `WiktionaryCommand.fetchWithRetry` | `projects/lexico/lexico-cli/src/modules/wiktionary/wiktionary.command.ts:71` |
| `WiktionaryCommand.fetchWithRetry` | 1 | `WiktionaryCommand.anonymous` | `projects/lexico/lexico-cli/src/modules/wiktionary/wiktionary.command.ts:86` |
| `WiktionaryCommand.getEntryFilePath` | 1 | `WiktionaryCommand.escapeCapitals` | `projects/lexico/lexico-cli/src/modules/wiktionary/wiktionary.command.ts:123` |
| `WiktionaryCommand.parseLatinSection` | 1 | `WiktionaryCommand.fetchWithRetry` | `projects/lexico/lexico-cli/src/modules/wiktionary/wiktionary.command.ts:225` |
| `WiktionaryCommand.saveWiktionaryEntry` | 1 | `WiktionaryCommand.getEntryFilePath` | `projects/lexico/lexico-cli/src/modules/wiktionary/wiktionary.command.ts:281` |
| `WiktionaryCommand.run` | 1 | `WiktionaryCommand.ingestWiktionary` | `projects/lexico/lexico-cli/src/modules/wiktionary/wiktionary.command.ts:317` |
| `LexicoIngestionCommand.promptForMissingOptions` | 1 | `LexicoIngestionCommand.promptOption` | `projects/lexico/lexico-cli/src/modules/lexico-ingestion/lexico-ingestion.command.ts:96` |

</details>
<!-- callidescope:end -->

## 🕸️ Codependix

Dependency graphs exported by [codependix](https://github.com/Organizzolini/codebase/tree/main/projects/ic-suite/codependix/codependix-cli), regenerated by `nx run configuration:codependix:write`.

### Nx Neighborhood

<!-- codependix:start name="codependix-nx-projects" -->
```mermaid
graph LR
  lexico_cli["lexico-cli"]
  lexico_entities["lexico-entities"]
  observability["observability"]
  persistence["persistence"]
  lexico_cli --> lexico_entities
  lexico_cli --> observability
  lexico_cli --> persistence
  classDef subject fill:#7c3aed,color:#fff,stroke:#4c1d95,stroke-width:2px
  class lexico_cli subject
```
<!-- codependix:end name="codependix-nx-projects" -->

### NestJS Module Graph

<!-- codependix:start name="codependix-nestjs-modules" -->
```mermaid
flowchart LR
  ClearModule
  ConfigModule([ConfigModule])
  CorpusScriptorumEcclesiasticorumLatinorumModule
  DatabaseModule
  DictionaryModule
  DiscoveryModule
  EpigraphikDatenbankClaussSlabyModule
  EtymologyModule
  FormsModule
  LatinLibraryModule
  LexemesModule
  LexicoIngestionModule
  LibraryModule
  LiteratureModule
  LoggerModule([LoggerModule])
  MainModule
  ManualModule
  NumeralsModule
  PartOfSpeechModule
  PerseusModule
  PostgresqlModule
  PrincipalPartsModule
  PronunciationModule
  TranslationsModule
  TypeOrmModule
  WiktionaryModule
  WordsModule
  ClearModule --> DatabaseModule
  ClearModule --> TypeOrmModule
  DatabaseModule --> PostgresqlModule
  DictionaryModule --> FormsModule
  DictionaryModule --> LexemesModule
  DictionaryModule --> ManualModule
  DictionaryModule --> PrincipalPartsModule
  DictionaryModule --> PronunciationModule
  DictionaryModule --> TranslationsModule
  DictionaryModule --> WordsModule
  FormsModule --> TypeOrmModule
  FormsModule --> WordsModule
  LexemesModule --> EtymologyModule
  LexemesModule --> FormsModule
  LexemesModule --> PartOfSpeechModule
  LexemesModule --> PrincipalPartsModule
  LexemesModule --> PronunciationModule
  LexemesModule --> TranslationsModule
  LexemesModule --> TypeOrmModule
  LexemesModule --> WordsModule
  LexicoIngestionModule --> ClearModule
  LexicoIngestionModule --> CorpusScriptorumEcclesiasticorumLatinorumModule
  LexicoIngestionModule --> DatabaseModule
  LexicoIngestionModule --> DictionaryModule
  LexicoIngestionModule --> EpigraphikDatenbankClaussSlabyModule
  LexicoIngestionModule --> LatinLibraryModule
  LexicoIngestionModule --> LibraryModule
  LexicoIngestionModule --> LiteratureModule
  LexicoIngestionModule --> ManualModule
  LexicoIngestionModule --> PerseusModule
  LexicoIngestionModule --> WiktionaryModule
  LexicoIngestionModule --> WordsModule
  LiteratureModule --> DatabaseModule
  LiteratureModule --> NumeralsModule
  LiteratureModule --> TypeOrmModule
  MainModule --> DiscoveryModule
  MainModule --> LexicoIngestionModule
  ManualModule --> NumeralsModule
  ManualModule --> TypeOrmModule
  ManualModule --> WordsModule
  PostgresqlModule --> TypeOrmModule
  PrincipalPartsModule --> TypeOrmModule
  PronunciationModule --> TypeOrmModule
  TranslationsModule --> TypeOrmModule
  WiktionaryModule --> TypeOrmModule
  WordsModule --> TypeOrmModule
```

_Rounded modules are global: every module can inject them, so their edges are left out._
<!-- codependix:end name="codependix-nestjs-modules" -->

### File Imports

<!-- codependix:start name="codependix-file-imports" -->
```mermaid
graph LR
  file_callidescope_config_ts["callidescope.config.ts"]
  file_codependix_config_ts["codependix.config.ts"]
  file_codometer_config_ts["codometer.config.ts"]
  file_coinagerie_config_ts["coinagerie.config.ts"]
  file_eslint_config_ts["eslint.config.ts"]
  file_src_lexico_cli_constants_ts["src/lexico-cli.constants.ts"]
  file_src_lexico_cli_main_end_to_end_test_ts["src/lexico-cli.main.end-to-end.test.ts"]
  file_src_lexico_cli_main_ts["src/lexico-cli.main.ts"]
  file_src_lexico_cli_main_unit_test_ts["src/lexico-cli.main.unit.test.ts"]
  file_src_lexico_cli_module_ts["src/lexico-cli.module.ts"]
  file_src_lexico_cli_repl_ts["src/lexico-cli.repl.ts"]
  file_src_lexico_cli_repl_unit_test_ts["src/lexico-cli.repl.unit.test.ts"]
  file_src_modules_clear_clear_command_ts["src/modules/clear/clear.command.ts"]
  file_src_modules_clear_clear_command_unit_test_ts["src/modules/clear/clear.command.unit.test.ts"]
  file_src_modules_clear_clear_constants_ts["src/modules/clear/clear.constants.ts"]
  file_src_modules_clear_clear_module_ts["src/modules/clear/clear.module.ts"]
  file_src_modules_clear_clear_types_ts["src/modules/clear/clear.types.ts"]
  file_src_modules_corpus_scriptorum_ecclesiasticorum_latinorum_corpus_scriptorum_ecclesiasticorum_latinorum_command_ts["src/modules/corpus-scriptorum-ecclesiasticorum-latinorum/corpus-scriptorum-ecclesiasticorum-latinorum.command.ts"]
  file_src_modules_corpus_scriptorum_ecclesiasticorum_latinorum_corpus_scriptorum_ecclesiasticorum_latinorum_command_unit_test_ts["src/modules/corpus-scriptorum-ecclesiasticorum-latinorum/corpus-scriptorum-ecclesiasticorum-latinorum.command.unit.test.ts"]
  file_src_modules_corpus_scriptorum_ecclesiasticorum_latinorum_corpus_scriptorum_ecclesiasticorum_latinorum_constants_ts["src/modules/corpus-scriptorum-ecclesiasticorum-latinorum/corpus-scriptorum-ecclesiasticorum-latinorum.constants.ts"]
  file_src_modules_corpus_scriptorum_ecclesiasticorum_latinorum_corpus_scriptorum_ecclesiasticorum_latinorum_module_ts["src/modules/corpus-scriptorum-ecclesiasticorum-latinorum/corpus-scriptorum-ecclesiasticorum-latinorum.module.ts"]
  file_src_modules_corpus_scriptorum_ecclesiasticorum_latinorum_corpus_scriptorum_ecclesiasticorum_latinorum_types_ts["src/modules/corpus-scriptorum-ecclesiasticorum-latinorum/corpus-scriptorum-ecclesiasticorum-latinorum.types.ts"]
  file_src_modules_dictionary_dictionary_command_ts["src/modules/dictionary/dictionary.command.ts"]
  file_src_modules_dictionary_dictionary_command_unit_test_ts["src/modules/dictionary/dictionary.command.unit.test.ts"]
  file_src_modules_dictionary_dictionary_constants_ts["src/modules/dictionary/dictionary.constants.ts"]
  file_src_modules_dictionary_dictionary_module_ts["src/modules/dictionary/dictionary.module.ts"]
  file_src_modules_dictionary_dictionary_types_ts["src/modules/dictionary/dictionary.types.ts"]
  file_src_modules_epigraphik_datenbank_clauss_slaby_epigraphik_datenbank_clauss_slaby_command_ts["src/modules/epigraphik-datenbank-clauss-slaby/epigraphik-datenbank-clauss-slaby.command.ts"]
  file_src_modules_epigraphik_datenbank_clauss_slaby_epigraphik_datenbank_clauss_slaby_command_unit_test_ts["src/modules/epigraphik-datenbank-clauss-slaby/epigraphik-datenbank-clauss-slaby.command.unit.test.ts"]
  file_src_modules_epigraphik_datenbank_clauss_slaby_epigraphik_datenbank_clauss_slaby_constants_ts["src/modules/epigraphik-datenbank-clauss-slaby/epigraphik-datenbank-clauss-slaby.constants.ts"]
  file_src_modules_epigraphik_datenbank_clauss_slaby_epigraphik_datenbank_clauss_slaby_module_ts["src/modules/epigraphik-datenbank-clauss-slaby/epigraphik-datenbank-clauss-slaby.module.ts"]
  file_src_modules_epigraphik_datenbank_clauss_slaby_epigraphik_datenbank_clauss_slaby_types_ts["src/modules/epigraphik-datenbank-clauss-slaby/epigraphik-datenbank-clauss-slaby.types.ts"]
  file_src_modules_etymology_etymology_constants_ts["src/modules/etymology/etymology.constants.ts"]
  file_src_modules_etymology_etymology_module_ts["src/modules/etymology/etymology.module.ts"]
  file_src_modules_etymology_etymology_service_ts["src/modules/etymology/etymology.service.ts"]
  file_src_modules_etymology_etymology_service_unit_test_ts["src/modules/etymology/etymology.service.unit.test.ts"]
  file_src_modules_etymology_etymology_types_ts["src/modules/etymology/etymology.types.ts"]
  file_src_modules_forms_forms_builder_guards_service_ts["src/modules/forms/forms-builder-guards.service.ts"]
  file_src_modules_forms_forms_builder_guards_service_unit_test_ts["src/modules/forms/forms-builder-guards.service.unit.test.ts"]
  file_src_modules_forms_forms_builder_verb_service_ts["src/modules/forms/forms-builder-verb.service.ts"]
  file_src_modules_forms_forms_builder_verb_service_unit_test_ts["src/modules/forms/forms-builder-verb.service.unit.test.ts"]
  file_src_modules_forms_forms_builder_service_ts["src/modules/forms/forms-builder.service.ts"]
  file_src_modules_forms_forms_builder_service_unit_test_ts["src/modules/forms/forms-builder.service.unit.test.ts"]
  file_src_modules_forms_forms_transient_words_service_ts["src/modules/forms/forms-transient-words.service.ts"]
  file_src_modules_forms_forms_transient_words_service_unit_test_ts["src/modules/forms/forms-transient-words.service.unit.test.ts"]
  file_src_modules_forms_forms_constants_ts["src/modules/forms/forms.constants.ts"]
  file_src_modules_forms_forms_constants_unit_test_ts["src/modules/forms/forms.constants.unit.test.ts"]
  file_src_modules_forms_forms_module_ts["src/modules/forms/forms.module.ts"]
  file_src_modules_forms_forms_service_ts["src/modules/forms/forms.service.ts"]
  file_src_modules_forms_forms_service_unit_test_ts["src/modules/forms/forms.service.unit.test.ts"]
  file_src_modules_forms_forms_types_ts["src/modules/forms/forms.types.ts"]
  file_src_modules_latin_library_latin_library_command_ts["src/modules/latin-library/latin-library.command.ts"]
  file_src_modules_latin_library_latin_library_command_unit_test_ts["src/modules/latin-library/latin-library.command.unit.test.ts"]
  file_src_modules_latin_library_latin_library_constants_ts["src/modules/latin-library/latin-library.constants.ts"]
  file_src_modules_latin_library_latin_library_module_ts["src/modules/latin-library/latin-library.module.ts"]
  file_src_modules_latin_library_latin_library_types_ts["src/modules/latin-library/latin-library.types.ts"]
  file_src_modules_lexemes_lexemes_constants_ts["src/modules/lexemes/lexemes.constants.ts"]
  file_src_modules_lexemes_lexemes_module_ts["src/modules/lexemes/lexemes.module.ts"]
  file_src_modules_lexemes_lexemes_service_ts["src/modules/lexemes/lexemes.service.ts"]
  file_src_modules_lexemes_lexemes_service_unit_test_ts["src/modules/lexemes/lexemes.service.unit.test.ts"]
  file_src_modules_lexemes_lexemes_types_ts["src/modules/lexemes/lexemes.types.ts"]
  file_src_modules_lexico_ingestion_lexico_ingestion_command_ts["src/modules/lexico-ingestion/lexico-ingestion.command.ts"]
  file_src_modules_lexico_ingestion_lexico_ingestion_command_unit_test_ts["src/modules/lexico-ingestion/lexico-ingestion.command.unit.test.ts"]
  file_src_modules_lexico_ingestion_lexico_ingestion_constants_ts["src/modules/lexico-ingestion/lexico-ingestion.constants.ts"]
  file_src_modules_lexico_ingestion_lexico_ingestion_module_ts["src/modules/lexico-ingestion/lexico-ingestion.module.ts"]
  file_src_modules_lexico_ingestion_lexico_ingestion_types_ts["src/modules/lexico-ingestion/lexico-ingestion.types.ts"]
  file_src_modules_lexico_ingestion_lexico_ingestion_utilities_ts["src/modules/lexico-ingestion/lexico-ingestion.utilities.ts"]
  file_src_modules_lexico_ingestion_lexico_ingestion_utilities_unit_test_ts["src/modules/lexico-ingestion/lexico-ingestion.utilities.unit.test.ts"]
  file_src_modules_library_library_command_ts["src/modules/library/library.command.ts"]
  file_src_modules_library_library_command_unit_test_ts["src/modules/library/library.command.unit.test.ts"]
  file_src_modules_library_library_constants_ts["src/modules/library/library.constants.ts"]
  file_src_modules_library_library_module_ts["src/modules/library/library.module.ts"]
  file_src_modules_library_library_types_ts["src/modules/library/library.types.ts"]
  file_src_modules_library_library_utilities_ts["src/modules/library/library.utilities.ts"]
  file_src_modules_library_library_utilities_unit_test_ts["src/modules/library/library.utilities.unit.test.ts"]
  file_src_modules_library_providers_corpus_scriptorum_ecclesiasticorum_latinorum_library_provider_ts["src/modules/library/providers/corpus-scriptorum-ecclesiasticorum-latinorum-library.provider.ts"]
  file_src_modules_library_providers_corpus_scriptorum_ecclesiasticorum_latinorum_library_provider_unit_test_ts["src/modules/library/providers/corpus-scriptorum-ecclesiasticorum-latinorum-library.provider.unit.test.ts"]
  file_src_modules_library_providers_epigraphik_datenbank_clauss_slaby_library_provider_ts["src/modules/library/providers/epigraphik-datenbank-clauss-slaby-library.provider.ts"]
  file_src_modules_library_providers_epigraphik_datenbank_clauss_slaby_library_provider_unit_test_ts["src/modules/library/providers/epigraphik-datenbank-clauss-slaby-library.provider.unit.test.ts"]
  file_src_modules_library_providers_latin_library_builder_ts["src/modules/library/providers/latin-library.builder.ts"]
  file_src_modules_library_providers_latin_library_builder_unit_test_ts["src/modules/library/providers/latin-library.builder.unit.test.ts"]
  file_src_modules_library_providers_latin_library_provider_ts["src/modules/library/providers/latin-library.provider.ts"]
  file_src_modules_library_providers_latin_library_provider_unit_test_ts["src/modules/library/providers/latin-library.provider.unit.test.ts"]
  file_src_modules_library_providers_perseus_library_text_extraction_provider_ts["src/modules/library/providers/perseus-library-text-extraction.provider.ts"]
  file_src_modules_library_providers_perseus_library_text_extraction_provider_unit_test_ts["src/modules/library/providers/perseus-library-text-extraction.provider.unit.test.ts"]
  file_src_modules_library_providers_perseus_library_provider_ts["src/modules/library/providers/perseus-library.provider.ts"]
  file_src_modules_library_providers_perseus_library_provider_unit_test_ts["src/modules/library/providers/perseus-library.provider.unit.test.ts"]
  file_src_modules_literature_literature_library_scan_service_ts["src/modules/literature/literature-library-scan.service.ts"]
  file_src_modules_literature_literature_library_scan_service_unit_test_ts["src/modules/literature/literature-library-scan.service.unit.test.ts"]
  file_src_modules_literature_literature_text_ingestion_service_ts["src/modules/literature/literature-text-ingestion.service.ts"]
  file_src_modules_literature_literature_text_ingestion_service_unit_test_ts["src/modules/literature/literature-text-ingestion.service.unit.test.ts"]
  file_src_modules_literature_literature_word_normalization_service_ts["src/modules/literature/literature-word-normalization.service.ts"]
  file_src_modules_literature_literature_word_normalization_service_unit_test_ts["src/modules/literature/literature-word-normalization.service.unit.test.ts"]
  file_src_modules_literature_literature_command_ts["src/modules/literature/literature.command.ts"]
  file_src_modules_literature_literature_command_unit_test_ts["src/modules/literature/literature.command.unit.test.ts"]
  file_src_modules_literature_literature_constants_ts["src/modules/literature/literature.constants.ts"]
  file_src_modules_literature_literature_module_ts["src/modules/literature/literature.module.ts"]
  file_src_modules_literature_literature_service_ts["src/modules/literature/literature.service.ts"]
  file_src_modules_literature_literature_service_unit_test_ts["src/modules/literature/literature.service.unit.test.ts"]
  file_src_modules_literature_literature_types_ts["src/modules/literature/literature.types.ts"]
  file_src_modules_manual_manual_constants_ts["src/modules/manual/manual.constants.ts"]
  file_src_modules_manual_manual_module_ts["src/modules/manual/manual.module.ts"]
  file_src_modules_manual_manual_service_ts["src/modules/manual/manual.service.ts"]
  file_src_modules_manual_manual_service_unit_test_ts["src/modules/manual/manual.service.unit.test.ts"]
  file_src_modules_manual_manual_types_ts["src/modules/manual/manual.types.ts"]
  file_src_modules_manual_manual_utilities_ts["src/modules/manual/manual.utilities.ts"]
  file_src_modules_numerals_numerals_constants_ts["src/modules/numerals/numerals.constants.ts"]
  file_src_modules_numerals_numerals_module_ts["src/modules/numerals/numerals.module.ts"]
  file_src_modules_numerals_numerals_service_ts["src/modules/numerals/numerals.service.ts"]
  file_src_modules_numerals_numerals_service_unit_test_ts["src/modules/numerals/numerals.service.unit.test.ts"]
  file_src_modules_numerals_numerals_types_ts["src/modules/numerals/numerals.types.ts"]
  file_src_modules_part_of_speech_part_of_speech_forms_service_ts["src/modules/part-of-speech/part-of-speech-forms.service.ts"]
  file_src_modules_part_of_speech_part_of_speech_forms_service_unit_test_ts["src/modules/part-of-speech/part-of-speech-forms.service.unit.test.ts"]
  file_src_modules_part_of_speech_part_of_speech_constants_ts["src/modules/part-of-speech/part-of-speech.constants.ts"]
  file_src_modules_part_of_speech_part_of_speech_module_ts["src/modules/part-of-speech/part-of-speech.module.ts"]
  file_src_modules_part_of_speech_part_of_speech_service_ts["src/modules/part-of-speech/part-of-speech.service.ts"]
  file_src_modules_part_of_speech_part_of_speech_service_unit_test_ts["src/modules/part-of-speech/part-of-speech.service.unit.test.ts"]
  file_src_modules_part_of_speech_part_of_speech_types_ts["src/modules/part-of-speech/part-of-speech.types.ts"]
  file_src_modules_perseus_perseus_command_ts["src/modules/perseus/perseus.command.ts"]
  file_src_modules_perseus_perseus_command_unit_test_ts["src/modules/perseus/perseus.command.unit.test.ts"]
  file_src_modules_perseus_perseus_constants_ts["src/modules/perseus/perseus.constants.ts"]
  file_src_modules_perseus_perseus_module_ts["src/modules/perseus/perseus.module.ts"]
  file_src_modules_perseus_perseus_types_ts["src/modules/perseus/perseus.types.ts"]
  file_src_modules_principal_parts_principal_parts_constants_ts["src/modules/principal-parts/principal-parts.constants.ts"]
  file_src_modules_principal_parts_principal_parts_module_ts["src/modules/principal-parts/principal-parts.module.ts"]
  file_src_modules_principal_parts_principal_parts_service_ts["src/modules/principal-parts/principal-parts.service.ts"]
  file_src_modules_principal_parts_principal_parts_service_unit_test_ts["src/modules/principal-parts/principal-parts.service.unit.test.ts"]
  file_src_modules_principal_parts_principal_parts_types_ts["src/modules/principal-parts/principal-parts.types.ts"]
  file_src_modules_pronunciation_pronunciation_classical_service_ts["src/modules/pronunciation/pronunciation-classical.service.ts"]
  file_src_modules_pronunciation_pronunciation_classical_service_unit_test_ts["src/modules/pronunciation/pronunciation-classical.service.unit.test.ts"]
  file_src_modules_pronunciation_pronunciation_classifier_service_ts["src/modules/pronunciation/pronunciation-classifier.service.ts"]
  file_src_modules_pronunciation_pronunciation_classifier_service_unit_test_ts["src/modules/pronunciation/pronunciation-classifier.service.unit.test.ts"]
  file_src_modules_pronunciation_pronunciation_ecclesiastical_service_ts["src/modules/pronunciation/pronunciation-ecclesiastical.service.ts"]
  file_src_modules_pronunciation_pronunciation_ecclesiastical_service_unit_test_ts["src/modules/pronunciation/pronunciation-ecclesiastical.service.unit.test.ts"]
  file_src_modules_pronunciation_pronunciation_phonemes_service_ts["src/modules/pronunciation/pronunciation-phonemes.service.ts"]
  file_src_modules_pronunciation_pronunciation_phonemes_service_unit_test_ts["src/modules/pronunciation/pronunciation-phonemes.service.unit.test.ts"]
  file_src_modules_pronunciation_pronunciation_constants_ts["src/modules/pronunciation/pronunciation.constants.ts"]
  file_src_modules_pronunciation_pronunciation_module_ts["src/modules/pronunciation/pronunciation.module.ts"]
  file_src_modules_pronunciation_pronunciation_service_ts["src/modules/pronunciation/pronunciation.service.ts"]
  file_src_modules_pronunciation_pronunciation_service_unit_test_ts["src/modules/pronunciation/pronunciation.service.unit.test.ts"]
  file_src_modules_pronunciation_pronunciation_types_ts["src/modules/pronunciation/pronunciation.types.ts"]
  file_src_modules_translations_translations_constants_ts["src/modules/translations/translations.constants.ts"]
  file_src_modules_translations_translations_module_ts["src/modules/translations/translations.module.ts"]
  file_src_modules_translations_translations_service_ts["src/modules/translations/translations.service.ts"]
  file_src_modules_translations_translations_service_unit_test_ts["src/modules/translations/translations.service.unit.test.ts"]
  file_src_modules_translations_translations_types_ts["src/modules/translations/translations.types.ts"]
  file_src_modules_wiktionary_wiktionary_command_ts["src/modules/wiktionary/wiktionary.command.ts"]
  file_src_modules_wiktionary_wiktionary_command_unit_test_ts["src/modules/wiktionary/wiktionary.command.unit.test.ts"]
  file_src_modules_wiktionary_wiktionary_constants_ts["src/modules/wiktionary/wiktionary.constants.ts"]
  file_src_modules_wiktionary_wiktionary_module_ts["src/modules/wiktionary/wiktionary.module.ts"]
  file_src_modules_wiktionary_wiktionary_types_ts["src/modules/wiktionary/wiktionary.types.ts"]
  file_src_modules_words_words_constants_ts["src/modules/words/words.constants.ts"]
  file_src_modules_words_words_module_ts["src/modules/words/words.module.ts"]
  file_src_modules_words_words_service_ts["src/modules/words/words.service.ts"]
  file_src_modules_words_words_service_unit_test_ts["src/modules/words/words.service.unit.test.ts"]
  file_src_modules_words_words_types_ts["src/modules/words/words.types.ts"]
  file_testing_command_harness_ts["testing/command-harness.ts"]
  file_testing_mocks_ts["testing/mocks.ts"]
  file_testing_setup_ts["testing/setup.ts"]
  file_vitest_config_ts["vitest.config.ts"]
  file_src_lexico_cli_main_end_to_end_test_ts --> file_src_lexico_cli_constants_ts
  file_src_lexico_cli_main_ts --> file_src_lexico_cli_module_ts
  file_src_lexico_cli_module_ts --> file_src_lexico_cli_constants_ts
  file_src_lexico_cli_module_ts --> file_src_modules_lexico_ingestion_lexico_ingestion_module_ts
  file_src_lexico_cli_repl_ts --> file_src_lexico_cli_module_ts
  file_src_modules_clear_clear_command_ts --> file_src_modules_clear_clear_types_ts
  file_src_modules_clear_clear_command_unit_test_ts --> file_src_modules_clear_clear_command_ts
  file_src_modules_clear_clear_command_unit_test_ts --> file_testing_command_harness_ts
  file_src_modules_clear_clear_command_unit_test_ts --> file_testing_mocks_ts
  file_src_modules_clear_clear_module_ts --> file_src_modules_clear_clear_command_ts
  file_src_modules_corpus_scriptorum_ecclesiasticorum_latinorum_corpus_scriptorum_ecclesiasticorum_latinorum_command_ts --> file_src_modules_corpus_scriptorum_ecclesiasticorum_latinorum_corpus_scriptorum_ecclesiasticorum_latinorum_constants_ts
  file_src_modules_corpus_scriptorum_ecclesiasticorum_latinorum_corpus_scriptorum_ecclesiasticorum_latinorum_command_ts --> file_src_modules_corpus_scriptorum_ecclesiasticorum_latinorum_corpus_scriptorum_ecclesiasticorum_latinorum_types_ts
  file_src_modules_corpus_scriptorum_ecclesiasticorum_latinorum_corpus_scriptorum_ecclesiasticorum_latinorum_command_unit_test_ts --> file_src_modules_corpus_scriptorum_ecclesiasticorum_latinorum_corpus_scriptorum_ecclesiasticorum_latinorum_command_ts
  file_src_modules_corpus_scriptorum_ecclesiasticorum_latinorum_corpus_scriptorum_ecclesiasticorum_latinorum_command_unit_test_ts --> file_testing_command_harness_ts
  file_src_modules_corpus_scriptorum_ecclesiasticorum_latinorum_corpus_scriptorum_ecclesiasticorum_latinorum_module_ts --> file_src_modules_corpus_scriptorum_ecclesiasticorum_latinorum_corpus_scriptorum_ecclesiasticorum_latinorum_command_ts
  file_src_modules_dictionary_dictionary_command_ts --> file_src_modules_dictionary_dictionary_types_ts
  file_src_modules_dictionary_dictionary_command_ts --> file_src_modules_lexemes_lexemes_service_ts
  file_src_modules_dictionary_dictionary_command_ts --> file_src_modules_lexico_ingestion_lexico_ingestion_types_ts
  file_src_modules_dictionary_dictionary_command_ts --> file_src_modules_lexico_ingestion_lexico_ingestion_utilities_ts
  file_src_modules_dictionary_dictionary_command_ts --> file_src_modules_manual_manual_service_ts
  file_src_modules_dictionary_dictionary_command_ts --> file_src_modules_translations_translations_service_ts
  file_src_modules_dictionary_dictionary_command_unit_test_ts --> file_src_modules_dictionary_dictionary_command_ts
  file_src_modules_dictionary_dictionary_command_unit_test_ts --> file_src_modules_lexemes_lexemes_service_ts
  file_src_modules_dictionary_dictionary_command_unit_test_ts --> file_src_modules_lexico_ingestion_lexico_ingestion_types_ts
  file_src_modules_dictionary_dictionary_command_unit_test_ts --> file_src_modules_manual_manual_service_ts
  file_src_modules_dictionary_dictionary_command_unit_test_ts --> file_src_modules_translations_translations_service_ts
  file_src_modules_dictionary_dictionary_command_unit_test_ts --> file_testing_command_harness_ts
  file_src_modules_dictionary_dictionary_command_unit_test_ts --> file_testing_mocks_ts
  file_src_modules_dictionary_dictionary_module_ts --> file_src_modules_dictionary_dictionary_command_ts
  file_src_modules_dictionary_dictionary_module_ts --> file_src_modules_forms_forms_module_ts
  file_src_modules_dictionary_dictionary_module_ts --> file_src_modules_lexemes_lexemes_module_ts
  file_src_modules_dictionary_dictionary_module_ts --> file_src_modules_manual_manual_module_ts
  file_src_modules_dictionary_dictionary_module_ts --> file_src_modules_principal_parts_principal_parts_module_ts
  file_src_modules_dictionary_dictionary_module_ts --> file_src_modules_pronunciation_pronunciation_module_ts
  file_src_modules_dictionary_dictionary_module_ts --> file_src_modules_translations_translations_module_ts
  file_src_modules_dictionary_dictionary_module_ts --> file_src_modules_words_words_module_ts
  file_src_modules_dictionary_dictionary_types_ts --> file_src_modules_lexico_ingestion_lexico_ingestion_types_ts
  file_src_modules_epigraphik_datenbank_clauss_slaby_epigraphik_datenbank_clauss_slaby_command_ts --> file_src_modules_epigraphik_datenbank_clauss_slaby_epigraphik_datenbank_clauss_slaby_constants_ts
  file_src_modules_epigraphik_datenbank_clauss_slaby_epigraphik_datenbank_clauss_slaby_command_ts --> file_src_modules_epigraphik_datenbank_clauss_slaby_epigraphik_datenbank_clauss_slaby_types_ts
  file_src_modules_epigraphik_datenbank_clauss_slaby_epigraphik_datenbank_clauss_slaby_command_unit_test_ts --> file_src_modules_epigraphik_datenbank_clauss_slaby_epigraphik_datenbank_clauss_slaby_command_ts
  file_src_modules_epigraphik_datenbank_clauss_slaby_epigraphik_datenbank_clauss_slaby_command_unit_test_ts --> file_testing_command_harness_ts
  file_src_modules_epigraphik_datenbank_clauss_slaby_epigraphik_datenbank_clauss_slaby_module_ts --> file_src_modules_epigraphik_datenbank_clauss_slaby_epigraphik_datenbank_clauss_slaby_command_ts
  file_src_modules_etymology_etymology_module_ts --> file_src_modules_etymology_etymology_service_ts
  file_src_modules_etymology_etymology_service_unit_test_ts --> file_src_modules_etymology_etymology_service_ts
  file_src_modules_forms_forms_builder_guards_service_ts --> file_src_modules_forms_forms_constants_ts
  file_src_modules_forms_forms_builder_guards_service_ts --> file_src_modules_forms_forms_types_ts
  file_src_modules_forms_forms_builder_guards_service_unit_test_ts --> file_src_modules_forms_forms_builder_guards_service_ts
  file_src_modules_forms_forms_builder_verb_service_ts --> file_src_modules_forms_forms_builder_guards_service_ts
  file_src_modules_forms_forms_builder_verb_service_ts --> file_src_modules_forms_forms_transient_words_service_ts
  file_src_modules_forms_forms_builder_verb_service_ts --> file_src_modules_forms_forms_types_ts
  file_src_modules_forms_forms_builder_verb_service_unit_test_ts --> file_src_modules_forms_forms_builder_guards_service_ts
  file_src_modules_forms_forms_builder_verb_service_unit_test_ts --> file_src_modules_forms_forms_builder_verb_service_ts
  file_src_modules_forms_forms_builder_verb_service_unit_test_ts --> file_src_modules_forms_forms_transient_words_service_ts
  file_src_modules_forms_forms_builder_service_ts --> file_src_modules_forms_forms_builder_guards_service_ts
  file_src_modules_forms_forms_builder_service_ts --> file_src_modules_forms_forms_builder_verb_service_ts
  file_src_modules_forms_forms_builder_service_ts --> file_src_modules_forms_forms_transient_words_service_ts
  file_src_modules_forms_forms_builder_service_ts --> file_src_modules_forms_forms_constants_ts
  file_src_modules_forms_forms_builder_service_ts --> file_src_modules_forms_forms_types_ts
  file_src_modules_forms_forms_builder_service_unit_test_ts --> file_src_modules_forms_forms_builder_guards_service_ts
  file_src_modules_forms_forms_builder_service_unit_test_ts --> file_src_modules_forms_forms_builder_verb_service_ts
  file_src_modules_forms_forms_builder_service_unit_test_ts --> file_src_modules_forms_forms_builder_service_ts
  file_src_modules_forms_forms_builder_service_unit_test_ts --> file_src_modules_forms_forms_transient_words_service_ts
  file_src_modules_forms_forms_transient_words_service_unit_test_ts --> file_src_modules_forms_forms_transient_words_service_ts
  file_src_modules_forms_forms_module_ts --> file_src_modules_forms_forms_builder_guards_service_ts
  file_src_modules_forms_forms_module_ts --> file_src_modules_forms_forms_builder_verb_service_ts
  file_src_modules_forms_forms_module_ts --> file_src_modules_forms_forms_builder_service_ts
  file_src_modules_forms_forms_module_ts --> file_src_modules_forms_forms_transient_words_service_ts
  file_src_modules_forms_forms_module_ts --> file_src_modules_forms_forms_service_ts
  file_src_modules_forms_forms_module_ts --> file_src_modules_words_words_module_ts
  file_src_modules_forms_forms_service_ts --> file_src_modules_forms_forms_transient_words_service_ts
  file_src_modules_forms_forms_service_ts --> file_src_modules_words_words_service_ts
  file_src_modules_forms_forms_service_unit_test_ts --> file_src_modules_forms_forms_transient_words_service_ts
  file_src_modules_forms_forms_service_unit_test_ts --> file_src_modules_forms_forms_service_ts
  file_src_modules_forms_forms_service_unit_test_ts --> file_src_modules_words_words_service_ts
  file_src_modules_forms_forms_service_unit_test_ts --> file_testing_mocks_ts
  file_src_modules_latin_library_latin_library_command_unit_test_ts --> file_src_modules_latin_library_latin_library_command_ts
  file_src_modules_latin_library_latin_library_command_unit_test_ts --> file_testing_command_harness_ts
  file_src_modules_latin_library_latin_library_module_ts --> file_src_modules_latin_library_latin_library_command_ts
  file_src_modules_lexemes_lexemes_module_ts --> file_src_modules_etymology_etymology_module_ts
  file_src_modules_lexemes_lexemes_module_ts --> file_src_modules_forms_forms_module_ts
  file_src_modules_lexemes_lexemes_module_ts --> file_src_modules_lexemes_lexemes_service_ts
  file_src_modules_lexemes_lexemes_module_ts --> file_src_modules_part_of_speech_part_of_speech_module_ts
  file_src_modules_lexemes_lexemes_module_ts --> file_src_modules_principal_parts_principal_parts_module_ts
  file_src_modules_lexemes_lexemes_module_ts --> file_src_modules_pronunciation_pronunciation_module_ts
  file_src_modules_lexemes_lexemes_module_ts --> file_src_modules_translations_translations_module_ts
  file_src_modules_lexemes_lexemes_module_ts --> file_src_modules_words_words_module_ts
  file_src_modules_lexemes_lexemes_service_ts --> file_src_modules_etymology_etymology_service_ts
  file_src_modules_lexemes_lexemes_service_ts --> file_src_modules_forms_forms_builder_service_ts
  file_src_modules_lexemes_lexemes_service_ts --> file_src_modules_forms_forms_service_ts
  file_src_modules_lexemes_lexemes_service_ts --> file_src_modules_lexemes_lexemes_constants_ts
  file_src_modules_lexemes_lexemes_service_ts --> file_src_modules_lexico_ingestion_lexico_ingestion_constants_ts
  file_src_modules_lexemes_lexemes_service_ts --> file_src_modules_lexico_ingestion_lexico_ingestion_types_ts
  file_src_modules_lexemes_lexemes_service_ts --> file_src_modules_part_of_speech_part_of_speech_service_ts
  file_src_modules_lexemes_lexemes_service_ts --> file_src_modules_principal_parts_principal_parts_service_ts
  file_src_modules_lexemes_lexemes_service_ts --> file_src_modules_pronunciation_pronunciation_service_ts
  file_src_modules_lexemes_lexemes_service_ts --> file_src_modules_translations_translations_service_ts
  file_src_modules_lexemes_lexemes_service_ts --> file_src_modules_words_words_service_ts
  file_src_modules_lexemes_lexemes_service_unit_test_ts --> file_src_modules_etymology_etymology_service_ts
  file_src_modules_lexemes_lexemes_service_unit_test_ts --> file_src_modules_forms_forms_builder_service_ts
  file_src_modules_lexemes_lexemes_service_unit_test_ts --> file_src_modules_forms_forms_service_ts
  file_src_modules_lexemes_lexemes_service_unit_test_ts --> file_src_modules_lexemes_lexemes_service_ts
  file_src_modules_lexemes_lexemes_service_unit_test_ts --> file_src_modules_lexico_ingestion_lexico_ingestion_types_ts
  file_src_modules_lexemes_lexemes_service_unit_test_ts --> file_src_modules_part_of_speech_part_of_speech_service_ts
  file_src_modules_lexemes_lexemes_service_unit_test_ts --> file_src_modules_principal_parts_principal_parts_service_ts
  file_src_modules_lexemes_lexemes_service_unit_test_ts --> file_src_modules_pronunciation_pronunciation_service_ts
  file_src_modules_lexemes_lexemes_service_unit_test_ts --> file_src_modules_translations_translations_service_ts
  file_src_modules_lexemes_lexemes_service_unit_test_ts --> file_src_modules_words_words_service_ts
  file_src_modules_lexemes_lexemes_service_unit_test_ts --> file_testing_mocks_ts
  file_src_modules_lexico_ingestion_lexico_ingestion_command_ts --> file_src_modules_corpus_scriptorum_ecclesiasticorum_latinorum_corpus_scriptorum_ecclesiasticorum_latinorum_command_ts
  file_src_modules_lexico_ingestion_lexico_ingestion_command_ts --> file_src_modules_dictionary_dictionary_command_ts
  file_src_modules_lexico_ingestion_lexico_ingestion_command_ts --> file_src_modules_epigraphik_datenbank_clauss_slaby_epigraphik_datenbank_clauss_slaby_command_ts
  file_src_modules_lexico_ingestion_lexico_ingestion_command_ts --> file_src_modules_latin_library_latin_library_command_ts
  file_src_modules_lexico_ingestion_lexico_ingestion_command_ts --> file_src_modules_lexico_ingestion_lexico_ingestion_types_ts
  file_src_modules_lexico_ingestion_lexico_ingestion_command_ts --> file_src_modules_library_library_command_ts
  file_src_modules_lexico_ingestion_lexico_ingestion_command_ts --> file_src_modules_literature_literature_command_ts
  file_src_modules_lexico_ingestion_lexico_ingestion_command_ts --> file_src_modules_perseus_perseus_command_ts
  file_src_modules_lexico_ingestion_lexico_ingestion_command_ts --> file_src_modules_wiktionary_wiktionary_command_ts
  file_src_modules_lexico_ingestion_lexico_ingestion_command_unit_test_ts --> file_src_modules_corpus_scriptorum_ecclesiasticorum_latinorum_corpus_scriptorum_ecclesiasticorum_latinorum_command_ts
  file_src_modules_lexico_ingestion_lexico_ingestion_command_unit_test_ts --> file_src_modules_dictionary_dictionary_command_ts
  file_src_modules_lexico_ingestion_lexico_ingestion_command_unit_test_ts --> file_src_modules_epigraphik_datenbank_clauss_slaby_epigraphik_datenbank_clauss_slaby_command_ts
  file_src_modules_lexico_ingestion_lexico_ingestion_command_unit_test_ts --> file_src_modules_latin_library_latin_library_command_ts
  file_src_modules_lexico_ingestion_lexico_ingestion_command_unit_test_ts --> file_src_modules_lexico_ingestion_lexico_ingestion_command_ts
  file_src_modules_lexico_ingestion_lexico_ingestion_command_unit_test_ts --> file_src_modules_lexico_ingestion_lexico_ingestion_types_ts
  file_src_modules_lexico_ingestion_lexico_ingestion_command_unit_test_ts --> file_src_modules_library_library_command_ts
  file_src_modules_lexico_ingestion_lexico_ingestion_command_unit_test_ts --> file_src_modules_literature_literature_command_ts
  file_src_modules_lexico_ingestion_lexico_ingestion_command_unit_test_ts --> file_src_modules_perseus_perseus_command_ts
  file_src_modules_lexico_ingestion_lexico_ingestion_command_unit_test_ts --> file_src_modules_wiktionary_wiktionary_command_ts
  file_src_modules_lexico_ingestion_lexico_ingestion_command_unit_test_ts --> file_testing_mocks_ts
  file_src_modules_lexico_ingestion_lexico_ingestion_module_ts --> file_src_modules_clear_clear_module_ts
  file_src_modules_lexico_ingestion_lexico_ingestion_module_ts --> file_src_modules_corpus_scriptorum_ecclesiasticorum_latinorum_corpus_scriptorum_ecclesiasticorum_latinorum_module_ts
  file_src_modules_lexico_ingestion_lexico_ingestion_module_ts --> file_src_modules_dictionary_dictionary_module_ts
  file_src_modules_lexico_ingestion_lexico_ingestion_module_ts --> file_src_modules_epigraphik_datenbank_clauss_slaby_epigraphik_datenbank_clauss_slaby_module_ts
  file_src_modules_lexico_ingestion_lexico_ingestion_module_ts --> file_src_modules_latin_library_latin_library_module_ts
  file_src_modules_lexico_ingestion_lexico_ingestion_module_ts --> file_src_modules_lexico_ingestion_lexico_ingestion_command_ts
  file_src_modules_lexico_ingestion_lexico_ingestion_module_ts --> file_src_modules_library_library_module_ts
  file_src_modules_lexico_ingestion_lexico_ingestion_module_ts --> file_src_modules_literature_literature_module_ts
  file_src_modules_lexico_ingestion_lexico_ingestion_module_ts --> file_src_modules_manual_manual_module_ts
  file_src_modules_lexico_ingestion_lexico_ingestion_module_ts --> file_src_modules_perseus_perseus_module_ts
  file_src_modules_lexico_ingestion_lexico_ingestion_module_ts --> file_src_modules_wiktionary_wiktionary_module_ts
  file_src_modules_lexico_ingestion_lexico_ingestion_module_ts --> file_src_modules_words_words_module_ts
  file_src_modules_lexico_ingestion_lexico_ingestion_utilities_ts --> file_src_modules_lexico_ingestion_lexico_ingestion_constants_ts
  file_src_modules_lexico_ingestion_lexico_ingestion_utilities_ts --> file_src_modules_lexico_ingestion_lexico_ingestion_types_ts
  file_src_modules_lexico_ingestion_lexico_ingestion_utilities_unit_test_ts --> file_src_modules_lexico_ingestion_lexico_ingestion_constants_ts
  file_src_modules_lexico_ingestion_lexico_ingestion_utilities_unit_test_ts --> file_src_modules_lexico_ingestion_lexico_ingestion_utilities_ts
  file_src_modules_lexico_ingestion_lexico_ingestion_utilities_unit_test_ts --> file_testing_mocks_ts
  file_src_modules_library_library_command_ts --> file_src_modules_lexico_ingestion_lexico_ingestion_types_ts
  file_src_modules_library_library_command_ts --> file_src_modules_lexico_ingestion_lexico_ingestion_utilities_ts
  file_src_modules_library_library_command_ts --> file_src_modules_library_library_constants_ts
  file_src_modules_library_library_command_ts --> file_src_modules_library_library_types_ts
  file_src_modules_library_library_command_unit_test_ts --> file_src_modules_library_library_command_ts
  file_src_modules_library_library_command_unit_test_ts --> file_src_modules_library_library_constants_ts
  file_src_modules_library_library_command_unit_test_ts --> file_src_modules_library_library_types_ts
  file_src_modules_library_library_command_unit_test_ts --> file_testing_command_harness_ts
  file_src_modules_library_library_command_unit_test_ts --> file_testing_mocks_ts
  file_src_modules_library_library_module_ts --> file_src_modules_library_library_command_ts
  file_src_modules_library_library_module_ts --> file_src_modules_library_library_constants_ts
  file_src_modules_library_library_module_ts --> file_src_modules_library_library_types_ts
  file_src_modules_library_library_module_ts --> file_src_modules_library_providers_corpus_scriptorum_ecclesiasticorum_latinorum_library_provider_ts
  file_src_modules_library_library_module_ts --> file_src_modules_library_providers_epigraphik_datenbank_clauss_slaby_library_provider_ts
  file_src_modules_library_library_module_ts --> file_src_modules_library_providers_latin_library_builder_ts
  file_src_modules_library_library_module_ts --> file_src_modules_library_providers_latin_library_provider_ts
  file_src_modules_library_library_module_ts --> file_src_modules_library_providers_perseus_library_text_extraction_provider_ts
  file_src_modules_library_library_module_ts --> file_src_modules_library_providers_perseus_library_provider_ts
  file_src_modules_library_library_types_ts --> file_src_modules_lexico_ingestion_lexico_ingestion_types_ts
  file_src_modules_library_library_utilities_unit_test_ts --> file_src_modules_library_library_utilities_ts
  file_src_modules_library_providers_corpus_scriptorum_ecclesiasticorum_latinorum_library_provider_ts --> file_src_modules_library_library_utilities_ts
  file_src_modules_library_providers_corpus_scriptorum_ecclesiasticorum_latinorum_library_provider_unit_test_ts --> file_src_modules_library_providers_corpus_scriptorum_ecclesiasticorum_latinorum_library_provider_ts
  file_src_modules_library_providers_epigraphik_datenbank_clauss_slaby_library_provider_unit_test_ts --> file_src_modules_library_providers_epigraphik_datenbank_clauss_slaby_library_provider_ts
  file_src_modules_library_providers_latin_library_builder_ts --> file_src_modules_library_library_utilities_ts
  file_src_modules_library_providers_latin_library_builder_ts --> file_src_modules_literature_literature_constants_ts
  file_src_modules_library_providers_latin_library_builder_unit_test_ts --> file_src_modules_library_providers_latin_library_builder_ts
  file_src_modules_library_providers_latin_library_provider_ts --> file_src_modules_library_library_utilities_ts
  file_src_modules_library_providers_latin_library_provider_ts --> file_src_modules_library_providers_latin_library_builder_ts
  file_src_modules_library_providers_latin_library_provider_unit_test_ts --> file_src_modules_library_providers_latin_library_builder_ts
  file_src_modules_library_providers_latin_library_provider_unit_test_ts --> file_src_modules_library_providers_latin_library_provider_ts
  file_src_modules_library_providers_perseus_library_text_extraction_provider_ts --> file_src_modules_library_library_utilities_ts
  file_src_modules_library_providers_perseus_library_text_extraction_provider_unit_test_ts --> file_src_modules_library_providers_perseus_library_text_extraction_provider_ts
  file_src_modules_library_providers_perseus_library_provider_ts --> file_src_modules_library_providers_perseus_library_text_extraction_provider_ts
  file_src_modules_library_providers_perseus_library_provider_unit_test_ts --> file_src_modules_library_providers_perseus_library_text_extraction_provider_ts
  file_src_modules_library_providers_perseus_library_provider_unit_test_ts --> file_src_modules_library_providers_perseus_library_provider_ts
  file_src_modules_literature_literature_library_scan_service_ts --> file_src_modules_literature_literature_types_ts
  file_src_modules_literature_literature_library_scan_service_unit_test_ts --> file_src_modules_literature_literature_library_scan_service_ts
  file_src_modules_literature_literature_text_ingestion_service_ts --> file_src_modules_literature_literature_types_ts
  file_src_modules_literature_literature_text_ingestion_service_unit_test_ts --> file_src_modules_literature_literature_text_ingestion_service_ts
  file_src_modules_literature_literature_text_ingestion_service_unit_test_ts --> file_src_modules_literature_literature_types_ts
  file_src_modules_literature_literature_word_normalization_service_ts --> file_src_modules_literature_literature_constants_ts
  file_src_modules_literature_literature_word_normalization_service_unit_test_ts --> file_src_modules_literature_literature_word_normalization_service_ts
  file_src_modules_literature_literature_command_ts --> file_src_modules_lexico_ingestion_lexico_ingestion_types_ts
  file_src_modules_literature_literature_command_ts --> file_src_modules_lexico_ingestion_lexico_ingestion_utilities_ts
  file_src_modules_literature_literature_command_ts --> file_src_modules_literature_literature_service_ts
  file_src_modules_literature_literature_command_ts --> file_src_modules_literature_literature_types_ts
  file_src_modules_literature_literature_command_unit_test_ts --> file_src_modules_literature_literature_command_ts
  file_src_modules_literature_literature_command_unit_test_ts --> file_src_modules_literature_literature_service_ts
  file_src_modules_literature_literature_command_unit_test_ts --> file_src_modules_literature_literature_types_ts
  file_src_modules_literature_literature_command_unit_test_ts --> file_testing_command_harness_ts
  file_src_modules_literature_literature_command_unit_test_ts --> file_testing_mocks_ts
  file_src_modules_literature_literature_module_ts --> file_src_modules_literature_literature_library_scan_service_ts
  file_src_modules_literature_literature_module_ts --> file_src_modules_literature_literature_text_ingestion_service_ts
  file_src_modules_literature_literature_module_ts --> file_src_modules_literature_literature_word_normalization_service_ts
  file_src_modules_literature_literature_module_ts --> file_src_modules_literature_literature_command_ts
  file_src_modules_literature_literature_module_ts --> file_src_modules_literature_literature_service_ts
  file_src_modules_literature_literature_module_ts --> file_src_modules_numerals_numerals_module_ts
  file_src_modules_literature_literature_service_ts --> file_src_modules_literature_literature_library_scan_service_ts
  file_src_modules_literature_literature_service_ts --> file_src_modules_literature_literature_text_ingestion_service_ts
  file_src_modules_literature_literature_service_ts --> file_src_modules_literature_literature_word_normalization_service_ts
  file_src_modules_literature_literature_service_ts --> file_src_modules_literature_literature_constants_ts
  file_src_modules_literature_literature_service_ts --> file_src_modules_literature_literature_types_ts
  file_src_modules_literature_literature_service_ts --> file_src_modules_numerals_numerals_service_ts
  file_src_modules_literature_literature_service_unit_test_ts --> file_src_modules_literature_literature_library_scan_service_ts
  file_src_modules_literature_literature_service_unit_test_ts --> file_src_modules_literature_literature_text_ingestion_service_ts
  file_src_modules_literature_literature_service_unit_test_ts --> file_src_modules_literature_literature_word_normalization_service_ts
  file_src_modules_literature_literature_service_unit_test_ts --> file_src_modules_literature_literature_service_ts
  file_src_modules_literature_literature_service_unit_test_ts --> file_src_modules_literature_literature_types_ts
  file_src_modules_literature_literature_service_unit_test_ts --> file_src_modules_numerals_numerals_service_ts
  file_src_modules_literature_literature_service_unit_test_ts --> file_testing_mocks_ts
  file_src_modules_literature_literature_types_ts --> file_src_modules_lexico_ingestion_lexico_ingestion_types_ts
  file_src_modules_manual_manual_constants_ts --> file_src_modules_manual_manual_types_ts
  file_src_modules_manual_manual_module_ts --> file_src_modules_manual_manual_service_ts
  file_src_modules_manual_manual_module_ts --> file_src_modules_numerals_numerals_module_ts
  file_src_modules_manual_manual_module_ts --> file_src_modules_words_words_module_ts
  file_src_modules_manual_manual_service_ts --> file_src_modules_manual_manual_constants_ts
  file_src_modules_manual_manual_service_ts --> file_src_modules_manual_manual_types_ts
  file_src_modules_manual_manual_service_ts --> file_src_modules_manual_manual_utilities_ts
  file_src_modules_manual_manual_service_ts --> file_src_modules_numerals_numerals_service_ts
  file_src_modules_manual_manual_service_ts --> file_src_modules_words_words_service_ts
  file_src_modules_manual_manual_service_unit_test_ts --> file_src_modules_manual_manual_constants_ts
  file_src_modules_manual_manual_service_unit_test_ts --> file_src_modules_manual_manual_service_ts
  file_src_modules_manual_manual_service_unit_test_ts --> file_src_modules_manual_manual_types_ts
  file_src_modules_manual_manual_service_unit_test_ts --> file_src_modules_manual_manual_utilities_ts
  file_src_modules_manual_manual_service_unit_test_ts --> file_src_modules_numerals_numerals_service_ts
  file_src_modules_manual_manual_service_unit_test_ts --> file_src_modules_words_words_service_ts
  file_src_modules_manual_manual_service_unit_test_ts --> file_testing_mocks_ts
  file_src_modules_numerals_numerals_module_ts --> file_src_modules_numerals_numerals_service_ts
  file_src_modules_numerals_numerals_service_ts --> file_src_modules_numerals_numerals_constants_ts
  file_src_modules_numerals_numerals_service_unit_test_ts --> file_src_modules_numerals_numerals_service_ts
  file_src_modules_part_of_speech_part_of_speech_forms_service_ts --> file_src_modules_part_of_speech_part_of_speech_constants_ts
  file_src_modules_part_of_speech_part_of_speech_forms_service_unit_test_ts --> file_src_modules_part_of_speech_part_of_speech_forms_service_ts
  file_src_modules_part_of_speech_part_of_speech_forms_service_unit_test_ts --> file_testing_mocks_ts
  file_src_modules_part_of_speech_part_of_speech_module_ts --> file_src_modules_part_of_speech_part_of_speech_forms_service_ts
  file_src_modules_part_of_speech_part_of_speech_module_ts --> file_src_modules_part_of_speech_part_of_speech_service_ts
  file_src_modules_part_of_speech_part_of_speech_service_ts --> file_src_modules_part_of_speech_part_of_speech_forms_service_ts
  file_src_modules_part_of_speech_part_of_speech_service_ts --> file_src_modules_part_of_speech_part_of_speech_constants_ts
  file_src_modules_part_of_speech_part_of_speech_service_unit_test_ts --> file_src_modules_part_of_speech_part_of_speech_forms_service_ts
  file_src_modules_part_of_speech_part_of_speech_service_unit_test_ts --> file_src_modules_part_of_speech_part_of_speech_module_ts
  file_src_modules_part_of_speech_part_of_speech_service_unit_test_ts --> file_src_modules_part_of_speech_part_of_speech_service_ts
  file_src_modules_perseus_perseus_command_ts --> file_src_modules_perseus_perseus_constants_ts
  file_src_modules_perseus_perseus_command_ts --> file_src_modules_perseus_perseus_types_ts
  file_src_modules_perseus_perseus_command_unit_test_ts --> file_src_modules_perseus_perseus_command_ts
  file_src_modules_perseus_perseus_command_unit_test_ts --> file_testing_command_harness_ts
  file_src_modules_perseus_perseus_module_ts --> file_src_modules_perseus_perseus_command_ts
  file_src_modules_principal_parts_principal_parts_module_ts --> file_src_modules_principal_parts_principal_parts_service_ts
  file_src_modules_principal_parts_principal_parts_service_unit_test_ts --> file_src_modules_principal_parts_principal_parts_service_ts
  file_src_modules_principal_parts_principal_parts_service_unit_test_ts --> file_testing_mocks_ts
  file_src_modules_pronunciation_pronunciation_classical_service_ts --> file_src_modules_pronunciation_pronunciation_constants_ts
  file_src_modules_pronunciation_pronunciation_classical_service_ts --> file_src_modules_pronunciation_pronunciation_types_ts
  file_src_modules_pronunciation_pronunciation_classical_service_unit_test_ts --> file_src_modules_pronunciation_pronunciation_classical_service_ts
  file_src_modules_pronunciation_pronunciation_classifier_service_ts --> file_src_modules_pronunciation_pronunciation_classical_service_ts
  file_src_modules_pronunciation_pronunciation_classifier_service_ts --> file_src_modules_pronunciation_pronunciation_ecclesiastical_service_ts
  file_src_modules_pronunciation_pronunciation_classifier_service_ts --> file_src_modules_pronunciation_pronunciation_types_ts
  file_src_modules_pronunciation_pronunciation_classifier_service_unit_test_ts --> file_src_modules_pronunciation_pronunciation_classical_service_ts
  file_src_modules_pronunciation_pronunciation_classifier_service_unit_test_ts --> file_src_modules_pronunciation_pronunciation_classifier_service_ts
  file_src_modules_pronunciation_pronunciation_classifier_service_unit_test_ts --> file_src_modules_pronunciation_pronunciation_ecclesiastical_service_ts
  file_src_modules_pronunciation_pronunciation_classifier_service_unit_test_ts --> file_src_modules_pronunciation_pronunciation_types_ts
  file_src_modules_pronunciation_pronunciation_ecclesiastical_service_ts --> file_src_modules_pronunciation_pronunciation_phonemes_service_ts
  file_src_modules_pronunciation_pronunciation_ecclesiastical_service_ts --> file_src_modules_pronunciation_pronunciation_constants_ts
  file_src_modules_pronunciation_pronunciation_ecclesiastical_service_ts --> file_src_modules_pronunciation_pronunciation_types_ts
  file_src_modules_pronunciation_pronunciation_ecclesiastical_service_unit_test_ts --> file_src_modules_pronunciation_pronunciation_ecclesiastical_service_ts
  file_src_modules_pronunciation_pronunciation_ecclesiastical_service_unit_test_ts --> file_src_modules_pronunciation_pronunciation_phonemes_service_ts
  file_src_modules_pronunciation_pronunciation_ecclesiastical_service_unit_test_ts --> file_src_modules_pronunciation_pronunciation_types_ts
  file_src_modules_pronunciation_pronunciation_phonemes_service_ts --> file_src_modules_pronunciation_pronunciation_types_ts
  file_src_modules_pronunciation_pronunciation_phonemes_service_unit_test_ts --> file_src_modules_pronunciation_pronunciation_phonemes_service_ts
  file_src_modules_pronunciation_pronunciation_constants_ts --> file_src_modules_pronunciation_pronunciation_types_ts
  file_src_modules_pronunciation_pronunciation_module_ts --> file_src_modules_pronunciation_pronunciation_classical_service_ts
  file_src_modules_pronunciation_pronunciation_module_ts --> file_src_modules_pronunciation_pronunciation_classifier_service_ts
  file_src_modules_pronunciation_pronunciation_module_ts --> file_src_modules_pronunciation_pronunciation_ecclesiastical_service_ts
  file_src_modules_pronunciation_pronunciation_module_ts --> file_src_modules_pronunciation_pronunciation_phonemes_service_ts
  file_src_modules_pronunciation_pronunciation_module_ts --> file_src_modules_pronunciation_pronunciation_service_ts
  file_src_modules_pronunciation_pronunciation_service_ts --> file_src_modules_pronunciation_pronunciation_classifier_service_ts
  file_src_modules_pronunciation_pronunciation_service_ts --> file_src_modules_pronunciation_pronunciation_constants_ts
  file_src_modules_pronunciation_pronunciation_service_ts --> file_src_modules_pronunciation_pronunciation_types_ts
  file_src_modules_pronunciation_pronunciation_service_unit_test_ts --> file_src_modules_pronunciation_pronunciation_classical_service_ts
  file_src_modules_pronunciation_pronunciation_service_unit_test_ts --> file_src_modules_pronunciation_pronunciation_classifier_service_ts
  file_src_modules_pronunciation_pronunciation_service_unit_test_ts --> file_src_modules_pronunciation_pronunciation_ecclesiastical_service_ts
  file_src_modules_pronunciation_pronunciation_service_unit_test_ts --> file_src_modules_pronunciation_pronunciation_phonemes_service_ts
  file_src_modules_pronunciation_pronunciation_service_unit_test_ts --> file_src_modules_pronunciation_pronunciation_service_ts
  file_src_modules_pronunciation_pronunciation_service_unit_test_ts --> file_src_modules_pronunciation_pronunciation_types_ts
  file_src_modules_pronunciation_pronunciation_service_unit_test_ts --> file_testing_mocks_ts
  file_src_modules_translations_translations_module_ts --> file_src_modules_translations_translations_service_ts
  file_src_modules_translations_translations_service_ts --> file_src_modules_translations_translations_constants_ts
  file_src_modules_translations_translations_service_unit_test_ts --> file_src_modules_translations_translations_service_ts
  file_src_modules_translations_translations_service_unit_test_ts --> file_testing_mocks_ts
  file_src_modules_wiktionary_wiktionary_command_ts --> file_src_modules_lexico_ingestion_lexico_ingestion_types_ts
  file_src_modules_wiktionary_wiktionary_command_ts --> file_src_modules_wiktionary_wiktionary_constants_ts
  file_src_modules_wiktionary_wiktionary_command_ts --> file_src_modules_wiktionary_wiktionary_types_ts
  file_src_modules_wiktionary_wiktionary_command_unit_test_ts --> file_src_modules_wiktionary_wiktionary_command_ts
  file_src_modules_wiktionary_wiktionary_command_unit_test_ts --> file_testing_command_harness_ts
  file_src_modules_wiktionary_wiktionary_module_ts --> file_src_modules_wiktionary_wiktionary_command_ts
  file_src_modules_wiktionary_wiktionary_types_ts --> file_src_modules_wiktionary_wiktionary_constants_ts
  file_src_modules_words_words_module_ts --> file_src_modules_words_words_service_ts
  file_src_modules_words_words_service_ts --> file_src_modules_lexico_ingestion_lexico_ingestion_constants_ts
  file_src_modules_words_words_service_unit_test_ts --> file_src_modules_lexico_ingestion_lexico_ingestion_constants_ts
  file_src_modules_words_words_service_unit_test_ts --> file_src_modules_words_words_service_ts
  file_src_modules_words_words_service_unit_test_ts --> file_testing_mocks_ts
```
<!-- codependix:end name="codependix-file-imports" -->

<!-- codometer:start -->

## ⏲️ Codometer

### Project

![Lines of Code](https://img.shields.io/badge/Lines_of_Code-33655-22c55e?style=flat-square)
![Repository Size](https://img.shields.io/badge/Repository_Size-1.92_MB-6b7280?style=flat-square)
![Folders](https://img.shields.io/badge/Folders-31-4a4a4a?style=flat-square)
![Source Files](https://img.shields.io/badge/Source_Files-160-3178c6?style=flat-square)

### Measured Targets

![Compiled JavaScript Size](https://img.shields.io/badge/Compiled_JavaScript_Size-98.97_kB_gzip-6b7280?style=flat-square)

### TypeScript

![TypeScript Files](https://img.shields.io/badge/TypeScript_Files-160-3178c6?style=flat-square)
![Interfaces](https://img.shields.io/badge/Interfaces-36-0ea5e9?style=flat-square)
![Generic Declarations](https://img.shields.io/badge/Generic_Declarations-7-0369a1?style=flat-square)
![Enums](https://img.shields.io/badge/Enums-0-f97316?style=flat-square)
![Decorators](https://img.shields.io/badge/Decorators-108-db2777?style=flat-square)
![Doc Comments](https://img.shields.io/badge/Doc_Comments-367-6366f1?style=flat-square)
![Static Methods](https://img.shields.io/badge/Static_Methods-3-166534?style=flat-square)

### JavaScript

![JavaScript Files](https://img.shields.io/badge/JavaScript_Files-0-f7df1e?style=flat-square)
![Test Files](https://img.shields.io/badge/Test_Files-45-10b981?style=flat-square)
![External Packages](https://img.shields.io/badge/External_Packages-29-8b5cf6?style=flat-square)
![Classes](https://img.shields.io/badge/Classes-62-7c3aed?style=flat-square)
![Functions](https://img.shields.io/badge/Functions-1264-16a34a?style=flat-square)
![Methods](https://img.shields.io/badge/Methods-511-15803d?style=flat-square)
![Sync Functions](https://img.shields.io/badge/Sync_Functions-1245-4ade80?style=flat-square)
![Async Functions](https://img.shields.io/badge/Async_Functions-530-059669?style=flat-square)
![Constants](https://img.shields.io/badge/Constants-2430-dc2626?style=flat-square)
![Imports](https://img.shields.io/badge/Imports-810-0284c7?style=flat-square)
![Exported Symbols](https://img.shields.io/badge/Exported_Symbols-177-ea580c?style=flat-square)
![Comments](https://img.shields.io/badge/Comments-614-64748b?style=flat-square)
![Comment Lines](https://img.shields.io/badge/Comment_Lines-1111-475569?style=flat-square)
![TODO Comments](https://img.shields.io/badge/TODO_Comments-10-ca8a04?style=flat-square)

### Python

![Python Files](https://img.shields.io/badge/Python_Files-0-3776ab?style=flat-square)
![Python Lines](https://img.shields.io/badge/Python_Lines-0-4b8bbe?style=flat-square)
![Python Classes](https://img.shields.io/badge/Python_Classes-0-7c3aed?style=flat-square)
![Python Functions](https://img.shields.io/badge/Python_Functions-0-16a34a?style=flat-square)
![Python Protocols](https://img.shields.io/badge/Python_Protocols-0-0ea5e9?style=flat-square)
![Python Constants](https://img.shields.io/badge/Python_Constants-0-dc2626?style=flat-square)
![Python Imports](https://img.shields.io/badge/Python_Imports-0-0284c7?style=flat-square)
![Python Decorators](https://img.shields.io/badge/Python_Decorators-0-db2777?style=flat-square)
![Docstrings](https://img.shields.io/badge/Docstrings-0-6366f1?style=flat-square)
![Docstring Lines](https://img.shields.io/badge/Docstring_Lines-0-818cf8?style=flat-square)
![Python Comments](https://img.shields.io/badge/Python_Comments-0-64748b?style=flat-square)
![Python Comment Lines](https://img.shields.io/badge/Python_Comment_Lines-0-475569?style=flat-square)

### JSON

![JSON Files](https://img.shields.io/badge/JSON_Files-4-a16207?style=flat-square)
![JSON Lines](https://img.shields.io/badge/JSON_Lines-207-ca8a04?style=flat-square)
![JSON Objects](https://img.shields.io/badge/JSON_Objects-48-7c3aed?style=flat-square)
![JSON Arrays](https://img.shields.io/badge/JSON_Arrays-13-8b5cf6?style=flat-square)
![JSON Properties](https://img.shields.io/badge/JSON_Properties-142-0284c7?style=flat-square)
![JSON Strings](https://img.shields.io/badge/JSON_Strings-112-16a34a?style=flat-square)
![JSON Numbers](https://img.shields.io/badge/JSON_Numbers-1-059669?style=flat-square)
![JSON Booleans](https://img.shields.io/badge/JSON_Booleans-9-0ea5e9?style=flat-square)
![JSON Nulls](https://img.shields.io/badge/JSON_Nulls-0-64748b?style=flat-square)
![JSON Items](https://img.shields.io/badge/JSON_Items-37-475569?style=flat-square)
![JSON Nodes](https://img.shields.io/badge/JSON_Nodes-183-dc2626?style=flat-square)
![JSON Max Depth](https://img.shields.io/badge/JSON_Max_Depth-7-ea580c?style=flat-square)

### YAML

![YAML Files](https://img.shields.io/badge/YAML_Files-0-cb171e?style=flat-square)
![YAML Lines](https://img.shields.io/badge/YAML_Lines-0-e34c26?style=flat-square)
![YAML Documents](https://img.shields.io/badge/YAML_Documents-0-f97316?style=flat-square)
![YAML Mappings](https://img.shields.io/badge/YAML_Mappings-0-7c3aed?style=flat-square)
![YAML Sequences](https://img.shields.io/badge/YAML_Sequences-0-8b5cf6?style=flat-square)
![YAML Keys](https://img.shields.io/badge/YAML_Keys-0-0284c7?style=flat-square)
![YAML Scalars](https://img.shields.io/badge/YAML_Scalars-0-16a34a?style=flat-square)
![YAML Anchors](https://img.shields.io/badge/YAML_Anchors-0-059669?style=flat-square)
![YAML Aliases](https://img.shields.io/badge/YAML_Aliases-0-10b981?style=flat-square)
![YAML Comments](https://img.shields.io/badge/YAML_Comments-0-64748b?style=flat-square)
![YAML Max Depth](https://img.shields.io/badge/YAML_Max_Depth-0-ea580c?style=flat-square)

### TOML

![TOML Files](https://img.shields.io/badge/TOML_Files-0-9c4221?style=flat-square)
![TOML Lines](https://img.shields.io/badge/TOML_Lines-0-b45309?style=flat-square)
![TOML Tables](https://img.shields.io/badge/TOML_Tables-0-7c3aed?style=flat-square)
![TOML Array Tables](https://img.shields.io/badge/TOML_Array_Tables-0-8b5cf6?style=flat-square)
![TOML Keys](https://img.shields.io/badge/TOML_Keys-0-0284c7?style=flat-square)
![TOML Arrays](https://img.shields.io/badge/TOML_Arrays-0-16a34a?style=flat-square)
![TOML Comments](https://img.shields.io/badge/TOML_Comments-0-64748b?style=flat-square)

### Shell

![Shell Files](https://img.shields.io/badge/Shell_Files-0-89e051?style=flat-square)
![Shell Lines](https://img.shields.io/badge/Shell_Lines-0-4eaa25?style=flat-square)
![Shell Functions](https://img.shields.io/badge/Shell_Functions-0-16a34a?style=flat-square)
![Shell Variables](https://img.shields.io/badge/Shell_Variables-0-0284c7?style=flat-square)
![Shell Exports](https://img.shields.io/badge/Shell_Exports-0-ea580c?style=flat-square)
![Shell Conditionals](https://img.shields.io/badge/Shell_Conditionals-0-7c3aed?style=flat-square)
![Shell Loops](https://img.shields.io/badge/Shell_Loops-0-8b5cf6?style=flat-square)
![Shell Pipelines](https://img.shields.io/badge/Shell_Pipelines-0-059669?style=flat-square)
![Shebangs](https://img.shields.io/badge/Shebangs-0-6b7280?style=flat-square)
![Shell Comments](https://img.shields.io/badge/Shell_Comments-0-64748b?style=flat-square)
![Shell Comment Lines](https://img.shields.io/badge/Shell_Comment_Lines-0-475569?style=flat-square)

### SQL

![SQL Files](https://img.shields.io/badge/SQL_Files-0-e38c00?style=flat-square)
![SQL Lines](https://img.shields.io/badge/SQL_Lines-0-f29111?style=flat-square)
![SQL Statements](https://img.shields.io/badge/SQL_Statements-0-7c3aed?style=flat-square)
![SQL Selects](https://img.shields.io/badge/SQL_Selects-0-16a34a?style=flat-square)
![SQL Inserts](https://img.shields.io/badge/SQL_Inserts-0-22c55e?style=flat-square)
![SQL Updates](https://img.shields.io/badge/SQL_Updates-0-0ea5e9?style=flat-square)
![SQL Deletes](https://img.shields.io/badge/SQL_Deletes-0-dc2626?style=flat-square)
![SQL Creates](https://img.shields.io/badge/SQL_Creates-0-0284c7?style=flat-square)
![SQL Joins](https://img.shields.io/badge/SQL_Joins-0-8b5cf6?style=flat-square)
![SQL CTEs](https://img.shields.io/badge/SQL_CTEs-0-059669?style=flat-square)
![SQL Comments](https://img.shields.io/badge/SQL_Comments-0-64748b?style=flat-square)

### HCL

![HCL Files](https://img.shields.io/badge/HCL_Files-0-844fba?style=flat-square)
![HCL Lines](https://img.shields.io/badge/HCL_Lines-0-a78bfa?style=flat-square)
![HCL Blocks](https://img.shields.io/badge/HCL_Blocks-0-7c3aed?style=flat-square)
![HCL Resources](https://img.shields.io/badge/HCL_Resources-0-0284c7?style=flat-square)
![HCL Variables](https://img.shields.io/badge/HCL_Variables-0-16a34a?style=flat-square)
![HCL Outputs](https://img.shields.io/badge/HCL_Outputs-0-059669?style=flat-square)
![HCL Attributes](https://img.shields.io/badge/HCL_Attributes-0-0ea5e9?style=flat-square)
![HCL Interpolations](https://img.shields.io/badge/HCL_Interpolations-0-db2777?style=flat-square)
![HCL Comments](https://img.shields.io/badge/HCL_Comments-0-64748b?style=flat-square)

### CSS

![CSS Files](https://img.shields.io/badge/CSS_Files-0-264de4?style=flat-square)
![CSS Lines](https://img.shields.io/badge/CSS_Lines-0-2965f1?style=flat-square)
![CSS Rules](https://img.shields.io/badge/CSS_Rules-0-7c3aed?style=flat-square)
![CSS Selectors](https://img.shields.io/badge/CSS_Selectors-0-8b5cf6?style=flat-square)
![CSS Declarations](https://img.shields.io/badge/CSS_Declarations-0-0284c7?style=flat-square)
![CSS At Rules](https://img.shields.io/badge/CSS_At_Rules-0-f97316?style=flat-square)
![CSS Media Queries](https://img.shields.io/badge/CSS_Media_Queries-0-ea580c?style=flat-square)
![CSS Custom Properties](https://img.shields.io/badge/CSS_Custom_Properties-0-16a34a?style=flat-square)
![CSS Comments](https://img.shields.io/badge/CSS_Comments-0-64748b?style=flat-square)

### Conventions

![Module Files](https://img.shields.io/badge/Module_Files-21-7c3aed?style=flat-square)
![Service Files](https://img.shields.io/badge/Service_Files-23-0284c7?style=flat-square)
![Command Files](https://img.shields.io/badge/Command_Files-10-16a34a?style=flat-square)
![Constants Files](https://img.shields.io/badge/Constants_Files-21-ea580c?style=flat-square)
![Types Files](https://img.shields.io/badge/Types_Files-20-db2777?style=flat-square)
![Utilities Files](https://img.shields.io/badge/Utilities_Files-3-0ea5e9?style=flat-square)
![TypeORM Entities](https://img.shields.io/badge/TypeORM_Entities-0-059669?style=flat-square)
![Unit Tests](https://img.shields.io/badge/Unit_Tests-44-ca8a04?style=flat-square)
![Integration Tests](https://img.shields.io/badge/Integration_Tests-0-7c3aed?style=flat-square)
![End To End Tests](https://img.shields.io/badge/End_To_End_Tests-1-0284c7?style=flat-square)
![CSS Comment Budget](https://img.shields.io/badge/CSS_Comment_Budget-0-16a34a?style=flat-square)
![HCL Comment Budget](https://img.shields.io/badge/HCL_Comment_Budget-0-ea580c?style=flat-square)
![Python Comment Budget](https://img.shields.io/badge/Python_Comment_Budget-0-db2777?style=flat-square)
![SQL Comment Budget](https://img.shields.io/badge/SQL_Comment_Budget-0-0ea5e9?style=flat-square)
![TOML Comment Budget](https://img.shields.io/badge/TOML_Comment_Budget-0-059669?style=flat-square)
![TypeScript Comment Budget](https://img.shields.io/badge/TypeScript_Comment_Budget-0-ca8a04?style=flat-square)
![YAML Comment Budget](https://img.shields.io/badge/YAML_Comment_Budget-0-7c3aed?style=flat-square)
![Shell Comment Budget](https://img.shields.io/badge/Shell_Comment_Budget-0-0284c7?style=flat-square)

### Jupyter

![Notebooks](https://img.shields.io/badge/Notebooks-0-f37626?style=flat-square)
![Notebook Cells](https://img.shields.io/badge/Notebook_Cells-0-e8a33d?style=flat-square)
![Code Cells](https://img.shields.io/badge/Code_Cells-0-3776ab?style=flat-square)
![Markdown Cells](https://img.shields.io/badge/Markdown_Cells-0-083fa1?style=flat-square)
![Raw Cells](https://img.shields.io/badge/Raw_Cells-0-9ca3af?style=flat-square)
![Executed Cells](https://img.shields.io/badge/Executed_Cells-0-16a34a?style=flat-square)
![Cell Outputs](https://img.shields.io/badge/Cell_Outputs-0-059669?style=flat-square)
![Notebook Code Lines](https://img.shields.io/badge/Notebook_Code_Lines-0-4b8bbe?style=flat-square)
![Notebook Classes](https://img.shields.io/badge/Notebook_Classes-0-7c3aed?style=flat-square)
![Notebook Functions](https://img.shields.io/badge/Notebook_Functions-0-22c55e?style=flat-square)
![Notebook Imports](https://img.shields.io/badge/Notebook_Imports-0-0284c7?style=flat-square)
![Notebook Decorators](https://img.shields.io/badge/Notebook_Decorators-0-db2777?style=flat-square)
![Notebook Prose Lines](https://img.shields.io/badge/Notebook_Prose_Lines-0-1f6feb?style=flat-square)
![Notebook Headings](https://img.shields.io/badge/Notebook_Headings-0-a78bfa?style=flat-square)
![Notebook Links](https://img.shields.io/badge/Notebook_Links-0-10b981?style=flat-square)
![Notebook Images](https://img.shields.io/badge/Notebook_Images-0-34d399?style=flat-square)
![Notebook Code Blocks](https://img.shields.io/badge/Notebook_Code_Blocks-0-dc2626?style=flat-square)
![Notebook Properties](https://img.shields.io/badge/Notebook_Properties-0-ca8a04?style=flat-square)
![Notebook Nodes](https://img.shields.io/badge/Notebook_Nodes-0-a16207?style=flat-square)
![Notebook Max Depth](https://img.shields.io/badge/Notebook_Max_Depth-0-ea580c?style=flat-square)

### Markdown

![Markdown Files](https://img.shields.io/badge/Markdown_Files-8-083fa1?style=flat-square)
![Markdown Lines](https://img.shields.io/badge/Markdown_Lines-4112-1f6feb?style=flat-square)
![H1](https://img.shields.io/badge/H1-8-7c3aed?style=flat-square)
![H2](https://img.shields.io/badge/H2-8-8b5cf6?style=flat-square)
![H3](https://img.shields.io/badge/H3-15-a78bfa?style=flat-square)
![H4](https://img.shields.io/badge/H4-0-c4b5fd?style=flat-square)
![H5](https://img.shields.io/badge/H5-0-ddd6fe?style=flat-square)
![H6](https://img.shields.io/badge/H6-0-ede9fe?style=flat-square)
![Paragraphs](https://img.shields.io/badge/Paragraphs-1910-64748b?style=flat-square)
![Lists](https://img.shields.io/badge/Lists-7-16a34a?style=flat-square)
![List Items](https://img.shields.io/badge/List_Items-36-22c55e?style=flat-square)
![Task List Items](https://img.shields.io/badge/Task_List_Items-0-4ade80?style=flat-square)
![Tables](https://img.shields.io/badge/Tables-3-0284c7?style=flat-square)
![Table Rows](https://img.shields.io/badge/Table_Rows-17-0ea5e9?style=flat-square)
![Links](https://img.shields.io/badge/Links-11-059669?style=flat-square)
![Images](https://img.shields.io/badge/Images-0-10b981?style=flat-square)
![Code Blocks](https://img.shields.io/badge/Code_Blocks-15-dc2626?style=flat-square)
![Inline Code](https://img.shields.io/badge/Inline_Code-115-ef4444?style=flat-square)
![Block Quotes](https://img.shields.io/badge/Block_Quotes-0-ca8a04?style=flat-square)
![Thematic Breaks](https://img.shields.io/badge/Thematic_Breaks-0-a16207?style=flat-square)
<!-- codometer:end -->

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run lexico-cli:coinagerie-check:write`.

- **abbreviation**: Short Latin praenomen form such as Ap. or Gn. that the manual lexeme ingestion expands to a full first name.
- **ablative**: Grammatical case whose singular and plural endings the forms builder and manual pronoun templates store as one row each.
- **accusative**: Grammatical case whose endings the forms builder processes for nouns, adjectives, and pronouns, alongside the other cases.
- **additional**: Extra author metadata that the Latin Library provider merges into an author when the extracted metadata is non-empty.
- **adjectival**: Describes Form entities built from adjective case and gender data, as in the forms builder and manual adjective templates.
- **adjective**: Part-of-speech tag for adjectives, which the forms builder and manual adjective templates use to choose declension forms.
- **advance**: Moves the pronunciation parser's character index forward after a phoneme is consumed, in the classical and ecclesiastical services.
- **adverb**: Part-of-speech tag for adverbs, which the forms builder gives its own branch and which carries a positive degree.
- **ae**: Latin digraph that the pronunciation classifiers read as one unit, mapping to a single AE phoneme in classical and an E in ecclesiastical.
- **agr**: Abbreviated praenomen key for Agrippa in the manual praenomen table, expanded only to its masculine form.
- **ahead**: Appears only in the glossary itself and nowhere in the ingestion code, so it names no concept here.
- **ambrogio**: Given-name part of the author slug ambrogio-novidio-fracco, whose Sacrorum Fastorum text the library ingests as a work.
- **ammianus**: Short literature slug that the literature constants map to the full author name Ammianus Marcellinus.
- **anchor**: HTML link element the Latin Library builder reads, using its text and nearby headings to label a work or book.
- **ap**: Abbreviated praenomen key for Appius, which the manual praenomen table expands to feminine Appia or masculine Appius.
- **apicius**: Author slug for the Roman cookery writer Apicius, whose appendicula and excerpta texts the library ingests from Open Greek and Latin.
- **appendicula**: Title of an Apicius cookery text under data/library, ingested as a work with its own author and source XML.
- **apuleius**: Short literature slug mapped by the literature constants to the full name Lucius Apuleius Madaurensis.
- **argv**: Command-line argument array that the command unit tests pass to each NestJS command runner under test.
- **ast**: Latin word ast, a variant of at, found only in ingested text files like Sacrorum Fastorum, not in the code.
- **attr**: Cheerio method that reads an HTML attribute, such as href from the Latin Library index links, to find each child page.
- **au**: Diphthong key that maps to the AU phoneme in the classical pronunciation table.
- **augusta**: Part of the historia-augusta literature slug, expanded to scriptores historiae augustae for the Historia Augusta collection.
- **augustus**: Latin word for Augustus found in ingested text like Sacrorum Fastorum, a term of the corpus rather than the code.
- **aurelius**: Name part of the aurelius-victor literature slug, which the literature constants expand to sextus aurelius victor.
- **axi**: Vocative of the name Axius, the addressee in Varro's Res rusticae dialogue text, found only in ingested data.
- **backoff**: Retry wait that grows after each failed Wiktionary request, honoring Retry-After and capped at a maximum delay.
- **batch**: Group of rows written in one database operation, such as the single upsert of all Word and form rows.
- **bible**: Fallback child page name bible.html the Latin Library crawler assigns to a Biblia Sacra category link that has no href.
- **birth**: Only a glossary entry here, since no code or data file uses it, so it names no concept in lexico-cli.
- **boilerplate**: Repeated site text such as Latin Library headers and footers, which the library utilities strip from ingested works.
- **bold**: Markdown bold markup that the library utilities apply to an end-of-line number moved to the front of a line.
- **book**: Work-level grouping unit in ingested texts, set as type book or text by the Latin Library builder and the EDCS provider.
- **bracket**: Glossary-only entry; no code in lexico-cli names this bracket concept, so it carries no project meaning.
- **breadth**: Callidescope limit measuring the widest fan-out of direct callees, set as maximumBreadth in the project config.
- **brevi**: Latin word brevi, short, found only in ingested Res rusticae text, so it is data rather than code.
- **caesar**: Name Caesar as it appears in ingested Latin texts such as Sacrorum Fastorum, which is data rather than a code term.
- **caeso**: Praenomen abbreviation key k mapped to masculine Caeso in the manual praenomen table, the CAESO abbreviation constant.
- **capital**: Uppercase letter that literature word normalization escapes into an underscore plus its lowercase form.
- **capitalize**: Translation parsing step that uppercases the first letter of each translation text it reads from Wiktionary.
- **category**: Grouping page or part-of-speech class; Latin Library category links become Author entities, and the forms builder builds Forms per category.
- **cato**: Name Cato, the author cited in Varro's Res rusticae text, which the ingested data contains but no code names.
- **catullus**: Literature constants slug for Catullus, expanded to gaius valerius catullus, and also a Latin Library path segment.
- **ch**: Digraph key that the classical substitutions table maps to plain c before pronunciation classification runs.
- **chdir**: Node working-directory switch used by the library command tests to enter a temp folder and then restore it.
- **choice**: One entry an interactive prompt offers for a missing flag value, with a title and a value to pick.
- **chorographia**: Title of the Pomponius Mela work De chorographia, one of the ingested Latin texts under data/library.
- **ciborum**: Part of the Apicius title Brevis Ciborum Excerpta, an ingested cookery text whose author slug is apicius.
- **cicero**: Literature constants slug for Cicero, expanded to Marcus Tullius Cicero, and used as a library command test author.
- **circumfix**: Part-of-speech tag for circumfix words, which the part-of-speech constants map to masculine gender in forms.
- **classical**: Pronunciation mode for Classical Latin, the classical phoneme map and service that the classifier applies alongside ecclesiastical.
- **classifier**: Service that classifies each Wiktionary pronunciation into classical or ecclesiastical phonemic and phonetic values.
- **classify**: Verb the pronunciation services use for deciding which phoneme a letter yields, given its neighboring characters.
- **claudian**: Literature constants slug for Claudian, expanded to claudius claudianus, a late Latin poet ingested by literature.
- **clauss**: Name part of Epigraphik-Datenbank Clauss-Slaby, the EDCS inscription source whose command and provider this project ingests.
- **clean**: Flag or step that empties ingested tables before a run, as in the clear command and the import --clean option.
- **clone**: Cheerio clone of an element, used by the Corpus Scriptorum provider to strip notes before reading its text.
- **closest**: Cheerio traversal that climbs to the nearest matching ancestor, such as the enclosing div or table of a Latin Library link.
- **combine**: Glossary-only entry; no lexico-cli code calls or names a combine operation, so the word has no project sense.
- **compact**: Glossary-only entry; no lexico-cli code uses compact, so the word names nothing in this project's ingestion code.
- **comparative**: Degree tag for comparative adjectives, read from the principal parts and mapped to the Wiktionary comparative category.
- **completion**: Log message marking that one text entry's ingestion finished, emitted with standardized start, error, and completion logs.
- **configurable**: Object property flag from the test mocks that marks a stubbed property as configurable so tests can redefine it.
- **conflict**: Glossary-only entry; no lexico-cli code names conflict, so it carries no project-specific sense here.
- **conjugation**: Verb class label such as third io-variant, parsed from Wiktionary conjugation headings to derive finite verb forms.
- **conjunction**: Part-of-speech tag for conjunctions, which the part-of-speech constants also assign to idioms, particles, and phrases.
- **consonant**: Phoneme class that the ecclesiastical pronunciation service checks around letters like c and g for palatalization.
- **convert**: Numerals service method that converts between Roman numeral strings and decimal integers for manual numeral lexemes.
- **coquinaria**: Title of the Apicius text De Re Coquinaria, an ingested Latin cookery book under the apicius data folder.
- **corner**: Cell at the grid corner of a part-of-speech form table, whose text such as Plural or Singular selects which entries to read.
- **corpus**: Ingested collection of Latin texts, such as the data/library corpus from Open Greek and Latin, and the Corpus Scriptorum provider.
- **csel**: Short name for the Corpus Scriptorum Ecclesiasticorum Latinorum, the ecclesiastical corpus whose XML this command downloads and caches.
- **ct**: Two-letter Latin pair with no code use here, so it names no pronunciation key or project concept.
- **curtius**: Literature constants slug for Curtius Rufus, expanded to quintus curtius rufus for literature ingestion lookups.
- **datenbank**: German noun part of Epigraphik-Datenbank, the EDCS name the project's command and provider use for the inscription database.
- **dative**: Grammatical case for dative forms, which the forms builder processes and the manual pronoun templates fill in.
- **db**: Stray fragment of the db.edcs.eu source URL, which the EDCS library provider records as text metadata.
- **de**: Latin preposition meaning about or from, found in ingested texts and in titles such as De chorographia.
- **death**: Glossary-only entry; no code or data here uses death as a concept, so its everyday sense does not apply.
- **decimal**: Base-ten value that the numerals service converts to and from Roman numerals for manual lexeme ingestion.
- **declension**: Inflection class such as first/second or third, set on manual lexemes and used to pick the matching noun forms.
- **deduplicate**: Literature ingestion step that removes repeated provider entries so each provider is processed once per run.
- **degree**: Comparison grade of an adjective or adverb, such as positive, comparative, or superlative, set on manual inflections.
- **delay**: Pause between requests to Wiktionary or CSEL servers, the polite delay that throttles scraping and honors Retry-After.
- **delegate**: Verb for handing work to another service, as the forms and library provider tests verify for participle and author building.
- **deletion**: Clear command step that removes rows for dictionary or literature, which the clear unit test skips when both are disabled.
- **descriptor**: Normalized record for a Perseus child text part, built from its subtype and number before the text is extracted.
- **determiner**: Part-of-speech tag for determiners, which the forms builder groups with nouns and pronouns as nominal forms.
- **devocalize**: Classical pronunciation step that turns b, d, g, or z into p, t, k, or s, using a dedicated map.
- **dictionary**: Main ingestion stage that parses cached Wiktionary pages into lexemes, forms, and translations, run by the dictionary command.
- **digit**: One decimal place value passed to the numerals service, whose Roman glyphs for 1 to 9 are built from low, mid, top.
- **direct**: Callable's immediate callees, counted for callidescope's breadth limit, which the project config caps at eight.
- **dirent**: Node file-system directory entry type that the library and literature scans iterate over when collecting markdown files.
- **disambiguator**: Numeric index that tells apart lexemes sharing a lemma, saved on each lexeme and used to reload it by lemma.
- **discovery**: Glossary-only entry; no code here names discovery, so the word means nothing project-specific in this CLI.
- **disorganize**: Glossary-only entry with no code use in lexico-cli; the word is a stray token of the glossary itself.
- **download**: Fetch step that saves raw Wiktionary, CSEL, or EDCS source files to disk before any ingestion parses them.
- **duration**: Elapsed time in seconds, computed from performance.now and logged at the end of dictionary and library runs.
- **eager**: Glossary-only entry with no lexico-cli code; the word names no eager loading or other project mechanism.
- **ecclesiastical**: Pronunciation mode for Ecclesiastical Latin, with its own phoneme map and service used beside the classical one.
- **ecclesiasticorum**: Part of the Corpus Scriptorum Ecclesiasticorum Latinorum name, the CSEL corpus command and its ingestion module.
- **edc**: Short form of EDCS, the Epigraphik-Datenbank Clauss-Slaby inscription source ingested by this CLI, though no code uses it bare.
- **ef**: Loop variable for an existing Form compared against a new form when preserving database identity in the forms service.
- **ei**: Latin diphthong kept as the ei phoneme by the ecclesiastical map, and it also appears in ingested texts.
- **element**: Cheerio node a parser callback receives while walking Wiktionary or library HTML, passed to $(element) for selection.
- **elt**: Cheerio node variable name for a heading or section element in the etymology and lexeme parsers.
- **english**: Language check: text judged as English metadata or boilerplate rather than valid Latin, which the library utilities reject.
- **ennius**: Name Ennius as cited in Varro's Res rusticae text, an ingested Latin passage that the code does not name.
- **enqueue**: Crawler action that adds a discovered Latin Library URL to the queue for later fetching.
- **enrich**: Merge step that fills missing fields on an existing lexeme from a new one, tested in the lexemes service.
- **ensure**: Verb for making a parent text exist before a literature child is ingested, as in ensureParentTexts in the literature service.
- **epigraphik**: Prefix of Epigraphik-Datenbank Clauss-Slaby, the inscription source whose command, provider, and chunk schema this CLI reads.
- **era**: Marker of B.C. or A.D. eras, used by the Latin Library builder to compute a work's start and end years.
- **errno**: Glossary-only entry; Node system error codes are not named in this project, so the word carries no project meaning.
- **esse**: Latin infinitive meaning to be, which occurs throughout the ingested Latin texts rather than in the code.
- **etymology**: Parsing stage that extracts the Etymology section near a headword and derives participle-origin translations from it.
- **eu**: Diphthong key that maps to EU in the classical pronunciation table and to eu in the ecclesiastical table.
- **eutropius**: Literature constants slug for Eutropius, a Roman historian whose full name the constants keep as the bare slug.
- **exception**: Glossary-only entry; this CLI throws and logs errors without a named exception concept, so the word is generic.
- **excerpta**: Title word in Apicius texts such as Brevis Ciborum Excerpta, part of ingested cookery work titles, not a code term.
- **existing1**: Test fixture variable holding a pre-saved Pronunciation with id id-1 and variant classical for merge tests.
- **existing2**: Test fixture variable holding a pre-saved ecclesiastical Pronunciation with id id-2 for merge tests.
- **expand**: Verb for turning an abbreviated praenomen into its full name, which the manual noun template performs for lexemes.
- **extraction**: Stage that pulls text, markup, or fields from a raw source, such as Wiktionary HTML or Perseus XML, before ingestion.
- **fastorum**: Part of the Sacrorum Fastorum Libri XII title, an ingested calendar work by Ambrogio Novidio Fracco under data/library.
- **feminine**: Gender value for feminine nouns, one of feminine, masculine, or neuter, used across forms and the praenomen table.
- **final**: Adjective marking the completed output, such as the final markdown written by the Latin Library and Perseus renderers.
- **flaccus**: Name part of Horace's and Persius's literature slugs, which the constants expand to Quintus Horacius Flaccus and Aulus Persius Flaccus.
- **floor**: Rounding-down step that buckets a decimal into thousands, hundreds, or tens when building numerals and EDCS titles.
- **florus**: Literature constants slug for the historian Florus, whose full name the constants keep as the bare word.
- **fm**: Short variable name for the frontmatter object, which the Perseus provider stringifies into YAML before the text body.
- **form1**: Test fixture variable holding a sample Form with id form1, used by the words service unit tests.
- **fracco**: Surname part of the author slug ambrogio-novidio-fracco, the calendar writer behind the Sacrorum Fastorum text.
- **frontinus**: Literature constants slug mapped to Sextus Iulius Frontinus, the Roman author whose works the literature ingestion loads.
- **fui**: Latin perfect of to be, meaning I was, found in ingested texts such as Sacrorum Fastorum, not in the code.
- **future**: Tense name used in part-of-speech forms as the future and future perfect, which the forms builder maps to verb tenses.
- **gellius**: Literature constants slug mapped to Aulus Gellius, the author name that literature ingestion uses for lookups.
- **gender**: Grammatical gender field on Form and manual inflections, set from feminine, masculine, or neuter for noun and adjective forms.
- **gendered**: Form-building adjective describing principal parts or case forms that carry one of three grammatical genders.
- **generic**: Placeholder part-of-speech and gender value that the part-of-speech service uses for tags with no specific mapping.
- **genitive**: Grammatical case for genitive forms, which the forms builder processes and the manual pronoun templates fill with huius or hārum.
- **genre**: Literature text metadata field, such as epic, read from YAML frontmatter and stored with a text's metadata.
- **gerund**: Non-finite verb form built by the forms builder from verbal noun data, alongside the supine and other non-finite forms.
- **getter**: Glossary-only entry; the word is a generic TypeScript term that no lexico-cli code names directly.
- **gn**: Abbreviation for Gnaeus in the praenomen table, expanded to gnaea for feminine and gnaeus for masculine forms.
- **greek**: Part of the open-greek-and-latin data path and Perseus fixture names, not a Greek-text ingestion concept here.
- **h1**: CSS heading selector for the page title, read first from h1.pagehead and then the first h1 by the Latin Library builder.
- **h2**: CSS selector for the date heading, read from h2.date with the first h2 as fallback by the Latin Library builder.
- **handle**: Verb for a wiktionary command method that deals with a category error or a non-ok response from the server.
- **harness**: Shared testing helper that resets command test state, imported from testing/command-harness by the command unit tests.
- **headword**: Wiktionary heading marker, the strong.headword element whose paragraph the lexemes parser iterates to find each lexeme.
- **hic**: Latin demonstrative pronoun meaning this, one of the manual pronoun lexemes built from a fixed template.
- **hierarchy**: Nested parent-child arrangement of texts; literature ingestion builds a prefix from parent texts and books.
- **hint**: Message string attached to a thrown error, such as telling the user to run the Wikipedia dump extraction first.
- **historia**: Literature slug part, the first word of historia-augusta, whose constant expands it to scriptores historiae augustae.
- **horace**: Literature constants slug for Horace, expanded to quintus horacius flaccus, the lyric poet the literature ingestion loads.
- **html**: Markup language of the Wiktionary and Latin Library pages the cheerio parsers read, distinct from XML and markdown output.
- **iace**: Consonantal i key that the classical substitutions table rewrites to jace before phoneme mapping runs.
- **iact**: Classical substitution key matching a Latin stem fragment, rewritten to the j form jact before phonemes are mapped.
- **iacu**: Classical substitution key matching a Latin stem fragment, rewritten to the j form jacu before phonemes are mapped.
- **iacē**: Classical substitution key matching a Latin stem fragment, rewritten to the j form jacē before phonemes are mapped.
- **identity**: Stable ID and natural key that the Latin Library author builder normalizes, so forms and lexemes keep their database rows.
- **idiom**: Part-of-speech tag for idioms, which the part-of-speech constants map to conjunction and the service maps to generic.
- **iect**: Classical substitution key matching a Latin stem fragment, rewritten to the j form ject before phonemes are mapped.
- **ien**: Classical substitution key matching a Latin stem fragment, rewritten to the j form jen before phonemes are mapped.
- **ier**: Classical substitution key matching a Latin stem fragment, rewritten to the j form jer before phonemes are mapped.
- **ille**: Latin demonstrative pronoun meaning that or he, built as a manual pronoun lexeme with fixed declension forms.
- **imperfect**: Past-continuous verb tense listed by the forms builder and part-of-speech constants under indicative and subjunctive moods.
- **incoming**: Adjective for IDs carried in from existing rows when saving principal parts and pronunciations.
- **indicative**: Mood name for finite verb forms, which the forms builder checks with isFormMood and the part-of-speech constants list.
- **infinitive**: Non-finite verb form built by the forms builder from nonFinite data and kept as Form entities.
- **inflection**: Object tying a lexeme to its declension or conjugation data, saved and reloaded by the lexemes and part-of-speech services.
- **ingest**: Verb for loading one source into the database, as in provider.ingest for each library author the library command selects.
- **ingestion**: Loading of a source into the Lexico database, the job each command and the lexico-ingestion root pipeline performs.
- **inject**: Nest decorator or option that supplies a provider token, such as the library providers token, into a command constructor.
- **inschriften**: Raw EDCS API field holding inscription tuples, where index 0 carries the inscription text, possibly HTML-tagged.
- **inscription**: Stone-text record from the Epigraphik-Datenbank, whose text the EDCS provider skips when missing and turns into a work.
- **inter**: Latin preposition meaning among or between, found in ingested texts and in pronunciation comments about intervocalic sounds.
- **interactive**: Adjective for prompts that run only when stdin is a terminal, such as the REPL and selectChoice option prompts.
- **interfix**: Part-of-speech tag for interfixes, which the constants map to masculine gender and the service maps to generic.
- **interjection**: Part-of-speech tag for interjections, which the constants map to conjunction and the service maps to generic.
- **internal**: Doc-comment label for a method that runs one workflow step, as in dictionary and EDCS ingestion handlers.
- **irregular**: Glossary-only entry; no lexico-cli code marks a verb as irregular, so the word has no project-specific meaning here.
- **iso**: Glossary-only entry; no lexico-cli code uses iso, so it names no ISO standard or project concept here.
- **italicus**: Second word of the silius-italicus literature slug, which the constants keep as the epithet of Silius.
- **iud**: Classical substitution key matching a Latin stem fragment, rewritten to the j form jud before phonemes are mapped.
- **iue**: Classical substitution key matching a Latin stem fragment, rewritten to the j form jue before phonemes are mapped.
- **iug**: Classical substitution key matching a Latin stem fragment, rewritten to the j form jug before phonemes are mapped.
- **iun**: Classical substitution key matching a Latin stem fragment, rewritten to the j form jun before phonemes are mapped.
- **iur**: Classical substitution key matching a Latin stem fragment, rewritten to the j form jur before phonemes are mapped.
- **iut**: Classical substitution key matching a Latin stem fragment, rewritten to the j form jut before phonemes are mapped.
- **iuv**: Classical substitution key matching a Latin stem fragment, rewritten to the j form juv before phonemes are mapped.
- **iūd**: Classical substitution key matching a Latin stem fragment, rewritten to the j form jūd before phonemes are mapped.
- **iūe**: Classical substitution key matching a Latin stem fragment, rewritten to the j form jūe before phonemes are mapped.
- **iūg**: Classical substitution key matching a Latin stem fragment, rewritten to the j form jūg before phonemes are mapped.
- **iūn**: Classical substitution key matching a Latin stem fragment, rewritten to the j form jūn before phonemes are mapped.
- **iūr**: Classical substitution key matching a Latin stem fragment, rewritten to the j form jūr before phonemes are mapped.
- **iūt**: Classical substitution key matching a Latin stem fragment, rewritten to the j form jūt before phonemes are mapped.
- **iūv**: Classical substitution key matching a Latin stem fragment, rewritten to the j form jūv before phonemes are mapped.
- **junction**: Join table row, such as WordLexeme or WordForm, that the forms service bulk-inserts to link words to lexemes and forms.
- **justin**: Literature constants slug for Justin, expanded to marcus iunianus iustinus, the epitomist whose name the constants spell out.
- **juvenal**: Literature constants slug expanded to decimus iunius iuvenalis, the satirist whose full Latin name the constants supply.
- **kebab**: Kebab-case slug format, produced by lodash kebabCase when latin-library and perseus build author and text slugs.
- **latin**: Language of every ingested text, which the library utilities check so English metadata and boilerplate are dropped.
- **latinorum**: Final word of the CSEL corpus name, which appears in the project.json target and the ecclesiastical source tree.
- **law**: Path segment /law/ that the Latin Library crawler matches, and part of the roman-law literature slug mapped to ius romanum.
- **leaf**: Terminal node of the Perseus text tree that writes one markdown file, using p or l nodes or a fallback.
- **lemma**: Dictionary headword key used to order, range, and save Wiktionary pages, from startLemma through endLemma in dictionary runs.
- **letter**: Part-of-speech value that the lexemes service skips entirely, because a letter entry is not ingested as a lexeme.
- **lexeme**: Core entity for one dictionary entry, saved per lemma and disambiguator, holding translations, forms, and principal parts.
- **li**: Cheerio loop variable for each list item of a translations header, which the translations service reads one by one.
- **libri**: Latin plural of liber meaning books, as in Sacrorum Fastorum Libri XII and the appendicula text titles.
- **literature**: Lexico-cli stage that ingests lines and tokens of each text loaded from the library, run by the literature command.
- **livy**: Literature constants slug for Livy, expanded to titus livius, the historian whose name the literature ingestion uses.
- **low**: Roman numeral glyph for the lowest symbol of a decimal place, such as I for ones, used by the numerals service.
- **lucan**: Literature constants slug for Lucan, expanded to marcus annaeus lucanus, the epic poet whose name the constants supply.
- **lucretius**: Literature constants slug expanded to titus lucretius carus, the philosopher-poet whose text the literature ingestion loads.
- **macronized**: Adjective for a word carrying macron vowels, such as a with a bar or e with a bar, read with its Wiktionary element.
- **mai**: Praenomen abbreviation key mai expanded to feminine Maio in the manual praenomen table; also appears in calendar text.
- **maior**: Latin comparative of magnus meaning greater, as in the pliny-maior key and the maiores text in Sacrorum Fastorum.
- **mam**: Praenomen abbreviation key mam, expanded to feminine mamerca and masculine mamercus in the manual praenomen table.
- **many**: Common English word that appears in test names and comments, such as many times, and carries no project meaning here.
- **mark**: Glossary-only entry; no lexico-cli code uses mark, so this English verb carries no project sense.
- **martial**: Literature constants slug for Martial, expanded to marcus valerius martialis, the epigrammatist the literature ingestion loads.
- **masculine**: Grammatical gender value, one of three FormGender types, used by the forms builder and the praenomen table.
- **maximus**: Latin superlative meaning greatest, found only in ingested texts such as Sacrorum Fastorum, not in the code.
- **mela**: Second half of the author slug pomponius-mela, whose De chorographia the library ingests as a work.
- **memoized**: Glossary-only entry; no lexico-cli code memoizes results, so the word names no caching mechanism here.
- **meter**: Literature metadata field recording a text's verse meter, such as dactylic hexameter, read from YAML frontmatter.
- **mid**: Roman numeral glyph for the middle symbol of a decimal place, such as V, which the numerals service uses to spell four.
- **mino**: Praenomen abbreviation key min, the MINO abbreviation constant that the manual table expands to feminine mino.
- **mood**: Grammatical mood such as indicative or subjunctive, which the forms builder checks with isFormMood for verb forms.
- **multi**: Latin word meaning many, found in ingested texts and in the multi prefix used in test and code names.
- **nc**: Consonant cluster key nc that the ecclesiastical phoneme map rewrites as ng followed by k.
- **nepo**: Glossary-only entry; the code has no nepo key, so the word names no author or concept here.
- **neuter**: Grammatical gender value for neuter nouns, one of three FormGender types checked by the forms builder guards.
- **ng**: Consonant cluster ng that the classical service emits as NG, and the ecclesiastical map keeps as ng.
- **nickname**: Latin Library author label taken from the link text, lowercased and kebab-cased into a slug the builder uses.
- **nominal**: Noun-based case and number forms, the nominal branch the forms builder uses for noun part-of-speech entries.
- **nominative**: Grammatical case whose singular and plural endings the forms builder processes, such as haec or hic.
- **normalizable**: Glossary-only entry; the code normalizes text but never calls anything normalizable, so the word has no project sense.
- **normalization**: Step that cleans Latin Library documents or literature words, such as escaping capitals and removing boilerplate.
- **noun**: Part-of-speech tag for nouns, which the manual noun template and forms builder use for declined noun entries.
- **novidio**: Middle part of the author slug ambrogio-novidio-fracco, the name in the Sacrorum Fastorum author metadata.
- **nq**: Consonant cluster nq that the ecclesiastical map rewrites as ng followed by q, before a u.
- **nth**: Glossary-only entry; no lexico-cli code uses nth as an ordinal position, so it has no project meaning.
- **numeral**: Part-of-speech tag for numerals, which the forms builder groups with adjectives and the manual service builds as Roman numeral lexemes.
- **obj**: Field name the EDCS API returns for each record, not an abbreviation the code chose, with object-typed chunks.
- **oct**: Praenomen abbreviation key oct, expanded to feminine octavia in the manual praenomen table for the Octavia lexeme.
- **oe**: Diphthong key oe that the classical map keeps as OE, and the ecclesiastical map reduces to a single e sound.
- **old**: Adjective marking a translation saved before an update and part of the Old Testament literature constant.
- **omni**: Latin stem meaning all, found in ingested texts; the manual adjective template builds omnis, not this form.
- **opet**: Praenomen abbreviation key opet, expanded to masculine opiter in the manual praenomen table.
- **orm**: Glossary-only entry; no lexico-cli code uses orm, although the database layer is TypeORM, so the word stands for nothing here.
- **ovid**: Literature constants slug expanded to publius ovidius naso, the Roman poet, also a Latin Library path segment.
- **p1**: Lambda parameter for each principal-part cell, lowercased from the table row in the principal-parts parser.
- **palatalize**: Sound change that turns c or g soft before front vowels; the ecclesiastical service checks it, though the verb is unused.
- **para**: Glossary-only entry; no lexico-cli code uses para, though paragraph extraction runs in the Latin Library builder.
- **paragraph**: Block of prose text that the Latin Library and etymology parsers extract and wrap into markdown, skipping pagehead and link-heavy blocks.
- **parsable**: Glossary-only entry; the code parses HTML and XML, but no lexico-cli code calls a value parsable.
- **parsetable**: Cheerio plugin call that turns an HTML inflection table into a string grid, used by the part-of-speech forms parser.
- **participle**: Non-finite verb form, with participle-origin translations parsed from Etymology text and forms built by the forms builder.
- **particle**: Part-of-speech tag for particles, which the constants map to conjunction and the service maps to generic.
- **pathname**: URL path component the Latin Library crawler reads for its file extension and its path relative to the host.
- **payload**: Parsed JSON body returned by an API call, such as the EDCS chunk response or the corpus Git tree, validated with Zod.
- **percent**: Progress value in percent, rounded to two decimals and logged with each record as work completes in an ingestion run.
- **perfect**: Verb tense family covering perfect, future perfect, and pluperfect, which the part-of-speech forms service maps by name.
- **performance**: High-resolution timer, performance.now, that dictionary, library, and lexico-ingestion commands read to time each run.
- **period**: Principal-part name for the period label a manual lexeme carries, and a Latin Library author field such as Classical.
- **perseus**: Source and command for the Perseus Digital Library, which the perseus stage converts from XML into markdown library works.
- **persistence**: Workspace package whose postgresEnvironmentSchema validates this CLI's database settings and whose dump commands move data.
- **persius**: Literature constants slug for Persius, expanded to aulus persius flaccus, the satirist whose text the literature ingestion loads.
- **person**: Grammatical person of a verb form, first to third, validated by the forms builder guards and passed to finite verb builders.
- **petronius**: Literature constants slug for Petronius, expanded to gaius petronius for literature ingestion lookups.
- **ph**: Digraph key that the classical substitutions map to p, and the ecclesiastical phoneme map reduces to f.
- **phaedrus**: Literature constants slug for Phaedrus, a fable writer, expanded to the bare name phaedrus for literature lookups.
- **phase**: Stage of a multi-step chunk run, such as the chunk phase in EDCS ingestion, where undefined entries are skipped.
- **phoneme**: Speech sound unit that the classical and ecclesiastical services emit for each letter, such as AE or the nc cluster.
- **phonemic**: Pronunciation field holding the phonemic spelling, such as a.mi.kus, which the classifier fills alongside phonetic.
- **phonetic**: Pronunciation field holding the phonetic rendering the classifier fills alongside the phonemic spelling.
- **phonic**: Glossary-only entry; the pronunciation code says phoneme and phonetic, never phonic, so the word has no project sense.
- **phrase**: Part-of-speech tag for phrases, which the constants map to conjunction and the service maps to generic.
- **pimentorum**: Part of the Brevis Pimentorum Excerpta title, an ingested Apicius cookery text about spice mixtures.
- **plautus**: Literature constants slug for Plautus, expanded to titus maccius plautus, the comic playwright whose name the constants supply.
- **pliny**: Literature constants slug for Pliny, which the constants split into pliny-maior and pliny-minor for the two authors.
- **pluperfect**: Past-perfect verb tense listed in the part-of-speech constants and forms service for finite verb entries.
- **plural**: Grammatical number key paired with singular in each manual case map, holding forms such as hic or hae.
- **po**: Stray fragment matched only inside ingested Pomponius Mela text, so it names no concept in this project.
- **pomponius**: Name part of the Pomponius Mela author slug, whose De chorographia the library ingests; also a name in Varro's text.
- **pp**: Local variable for a new PrincipalPart being built from a table cell in the principal-parts service, not a Latin term.
- **pp1**: Test fixture variable holding the first PrincipalPart, with text amo, in the words service unit tests.
- **pp2**: Test fixture variable holding the second PrincipalPart, with text amare, in the words service unit tests.
- **pp3**: Test fixture variable holding the third PrincipalPart, with text amavi, in the words service unit tests.
- **pr**: Loop variable for a pronunciation list item, read in the classifier to extract the pronunciation text from each row.
- **praenoman**: Spelling variant of praenomen not used in code, where the manual praenomen table holds the Roman first names.
- **preposition**: Part-of-speech tag for prepositions, which the constants map to preposition and the service maps to generic.
- **preserve**: Verb for keeping existing row IDs during saves, which avoids insert and delete churn in forms and pronunciation services.
- **prev**: Cheerio method that walks to the previous sibling, used by the Latin Library builder to find a table's preceding header.
- **principal**: Adjective naming the core verb stems, such as amo, amare, amavi, that the principal-parts service saves as rows.
- **priority**: Rank number deciding which literature provider wins when two known providers conflict, with lower priority losing.
- **pro**: Praenomen abbreviation key pro, expanded to feminine procula or masculine proculus in the manual praenomen table.
- **pron**: Glossary-only abbreviation; the code spells out pronoun, so pron appears only in the glossary.
- **pronoun**: Part-of-speech tag for pronouns, set by the manual hic template and grouped with nouns and determiners in forms.
- **pronunciation**: Module and service that derive phonemic and phonetic spellings for each Wiktionary entry, in classical or ecclesiastical mode.
- **pronunciation1**: Test fixture variable holding a classical Pronunciation with phonemes a.mi.kus, used in the pronunciation service tests.
- **proper**: Part-of-speech heading that Wiktionary writes as Proper noun, which the part-of-speech service rewrites to properNoun.
- **propertius**: Literature constants slug expanded to sextus propertius, the elegiac poet whose name the literature ingestion uses.
- **prov**: Glossary-only abbreviation; the code writes out province and proverb, so prov appears only in this entry.
- **proverb**: Part-of-speech tag for proverbs, which the constants map to conjunction and the service maps to generic.
- **province**: Field the EDCS provider reads as a grouping label, falling back to Unknown Province, and used to split texts into books.
- **provinz**: Raw EDCS API field for the Roman province name, which the provider defaults to Unknown Province when it is missing.
- **publisher**: Front-matter key in ingested texts that names the edition's issuer, such as Teubner or M. Antonius Bladus Asulanus.
- **punctuation**: Glossary-only entry; no lexico-cli code handles punctuation by name, so the word has no project meaning.
- **qu**: Digraph key that the classical substitutions map to q, and the ecclesiastical phoneme map reads as kw.
- **question**: Prompt object, with a title and value list, passed to selectChoice in lexico-ingestion when a flag value is missing.
- **queue**: Latin Library crawler's list of URLs waiting to be fetched, filled by enqueue and drained one page at a time.
- **quintilian**: Literature constants slug expanded to marcus fabius quiintilianus, the rhetorician whose name the constants list.
- **re**: Latin prefix meaning again, found in ingested text and in hyphenated comments such as re-classifies, not as a term.
- **region**: Field in literature text metadata naming a geographic region, such as italy, read from YAML frontmatter.
- **relation**: Link a saved row makes to a related entity, such as a lexeme's inflection or a text's parent text.
- **remainder**: Leftover text after a labelled prefix in literature parsing, prepended back as a text node before the result nodes.
- **replacement**: Substitute string in a pronunciation regex rule, taken from the pattern and replacement entries applied in order.
- **roman**: Label for the ancient Italian numeral glyphs the numerals service converts and the first names in manual praenomen templates.
- **rufus**: Name part of the curtius-rufus literature slug, expanded to quintus curtius rufus for literature lookups.
- **rusticae**: Part of the Res rusticae title, Varro's agricultural work ingested from the data folder as a Latin text.
- **sacrorum**: First word of the Sacrorum Fastorum Libri XII calendar title, ingested as a Latin work by the library command.
- **sallust**: Literature constants slug expanded to gaius sallustius crispus, the historian whose name the constants list.
- **save**: Repository method that writes a new or changed entity row, such as lexemeRepository.save or formRepository.save.
- **sc**: Consonant cluster sc in Latin, which the ecclesiastical pronunciation service checks when classifying an x or s sound.
- **scan**: Verb for walking a directory tree to collect markdown files, as in the literature library scan service.
- **scoped**: Describes a callidescope run limited to this project and its dependency closure when setting its depth limit.
- **scriptorum**: Part of the Corpus Scriptorum Ecclesiasticorum Latinorum name, the CSEL corpus this CLI downloads from GitHub.
- **selection**: Value a user picks at a missing-flag prompt, or undefined when no selection is taken or input is not a terminal.
- **selector**: CSS selector string passed to the test mock Cheerio helper, which selects one element from loaded HTML for assertions.
- **self**: Adjective for a link that points back to its own page, which the Latin Library builder skips as self-referential.
- **seneca**: Literature constants slug prefix for the two Senecas, whose maior and minor slugs expand to full names.
- **seq**: Praenomen abbreviation key seq, expanded to feminine secunda in the manual praenomen table.
- **ser**: Praenomen abbreviation key ser, expanded to feminine servia or masculine servius in the manual praenomen table.
- **sert**: Praenomen abbreviation key sert, expanded to masculine sertor in the manual praenomen table.
- **sex**: Praenomen abbreviation key sex, expanded to feminine sexta or masculine sextus in the manual praenomen table.
- **should**: Modal verb in test names and doc comments, such as should return, that carries no project-specific meaning here.
- **silius**: Literature constants slug for Silius Italicus, the epic poet whose name the constants spell out in full.
- **simple**: Adjective for plain or uncomplicated values, such as simple text translations, used in tests rather than as a project concept.
- **singular**: Grammatical number key paired with plural in each manual case map, holding forms such as hāc or hanc.
- **slaby**: Name part of Epigraphik-Datenbank Clauss-Slaby, the EDCS source whose command and chunk schema live in this project.
- **slug**: URL-safe identifier for an author or text, such as ambrogio-novidio-fracco, that the library builds and stores as the key.
- **sp**: Praenomen abbreviation key sp, expanded to feminine spuria in the manual praenomen table.
- **sparse**: Describes arrays or tables with empty slots, such as the EDCS inscription tuples and form table rows.
- **speech**: Grammatical category label, such as noun or verb, that the forms and part-of-speech services set on each lexeme.
- **splice**: Array method that removes matched items from existing forms, used in the forms service to reuse saved row IDs.
- **st**: Praenomen abbreviation key st, expanded to feminine statia or masculine statius in the manual praenomen table.
- **statius**: Literature constants slug expanded to publius papinius statius, and also a masculine praenomen value for the st key.
- **stdin**: Node standard input stream, whose isTTY flag tells the lexico-ingestion prompts whether an interactive answer is possible.
- **str**: Parameter name for a string argument in helper functions, such as the normalize method in dictionary and lexemes services.
- **strong**: HTML emphasis tag Wiktionary wraps around each headword; the lexemes parser selects paragraphs that contain one.
- **subjunctive**: Finite verb mood of wishes and doubt, which the forms builder accepts alongside indicative in verb data.
- **subtype**: Attribute on a Perseus text part that names its kind, such as section or book, used to build the part's slug.
- **suetonius**: Literature constants slug expanded to gaius suetonius tranquillus, the biographer whose name the constants supply.
- **sulpicia**: Literature constants slug for Sulpicia, the elegiac poet, expanded to the bare name sulpicia for literature lookups.
- **sum**: Latin verb sum meaning I am, found mostly in ingested texts, not as a project term.
- **superlative**: Degree tag for superlative adjectives, read from the third principal part and mapped to the Wiktionary superlative category.
- **supine**: Non-finite verb case built by the forms builder from verbal noun data, alongside the gerund.
- **t1**: Test fixture variable holding a Translation with text amo, used in the translations service unit tests.
- **t2**: Test fixture variable holding a second Translation with text amicus, used in the translations service unit tests.
- **tacitus**: Literature constants slug expanded to publius cornelius tacitus, the historian whose name the constants supply.
- **take**: Parameter that caps how many translations are fetched, defaulting to one hundred in the translations service.
- **tc**: Cheerio loop variable for a table cell in the part-of-speech forms parser, mapping each row's cells to text.
- **terence**: Literature constants slug expanded to publius terentius afer, the comic playwright whose name the constants supply.
- **terentius**: Name part of the m-terentius-varro author slug, whose Res rusticae text the library ingests as Varro's work.
- **terminal**: Describes a standard input that is a TTY, so prompts ask the user only when a real terminal is attached.
- **testament**: Part of the vulgate-bible Old and New Testament literature slugs, which the constants expand to Vulgate Bible names.
- **th**: Digraph key that the classical substitutions map to plain t, and also an HTML table header tag in tests.
- **thelatinlibrary**: Hostname of the Latin Library source, www.thelatinlibrary.com, that the crawler starts from and limits links to.
- **third**: Ordinal for a declension or conjugation class, such as third, which manual templates set on inflections.
- **ti**: Praenomen abbreviation key ti, expanded to feminine tiberia or masculine tiberius in the manual praenomen table.
- **tibullus**: Literature constants slug expanded to albius tibullus, the elegiac poet whose name the constants supply for lookups.
- **tidy**: Nx target name for the tidy-codebase run, an empty target in project.json and not a lexico-cli code concept.
- **timestamped**: Log file name suffixed with the run time, as the logger's createTimestampedOutputLogFilePath produces for each command.
- **top**: Roman numeral glyph for the upper symbol of a decimal place, such as X, which the numerals service uses to spell nine.
- **tr**: Cheerio loop variable for a table row in the part-of-speech forms parser, mapped into an array of cell texts.
- **trace**: Stack-trace text the logger records with an error, and the call chain callidescope follows when measuring depth.
- **transient**: Nest scope under which the logger and FormsTransientWordsService each get a new instance per consumer.
- **translation**: Gloss entity for one meaning of a lexeme, saved per lexeme and parsed from the Wiktionary translations list.
- **uninflected**: Inflection class value meaning the word never changes form, which the part-of-speech service assigns to conjunctions and abbreviations.
- **unmock**: Glossary-only entry; the tests mock modules with vi.mock, but no lexico-cli code calls unmock.
- **unsupported**: Describes a part of speech that the lexemes service skips, which is logged at debug level as skipped.
- **upper**: Glossary-only entry; the code says uppercase or capital, never upper alone, so the word has no project meaning.
- **upsert**: Repository call that inserts a row or updates it on conflict, used to save lexemes, texts, and forms without duplicates.
- **urn**: Canonical Text Services URN, such as urn:cts:latinLit, recorded as the cts URN field in each ingested Apicius text's front matter.
- **v2**: Variable holding the Roman value of the next numeral letter, used to decide subtractive pairs in the numerals service.
- **valerius**: Name part shared by the Catullus, Martial, and Valerius Flaccus literature slugs, which each expand to a full Valerius name.
- **variant**: Label of the classical or ecclesiastical mode a Pronunciation record was produced under, stored by the classifier.
- **varro**: Literature constants slug for Varro, expanded to marcus terentius varro, whose Res rusticae the library ingests.
- **vellius**: Literature constants slug expanded to gaius velleius patereculus, the historian whose name the constants supply.
- **verb**: Part-of-speech tag for verbs, which the forms builder uses to build finite and non-finite verb forms through the verb builder service.
- **verbal**: Noun form derived from a verb, such as the gerund or supine, that the forms builder reads from verbal noun data.
- **vergil**: Literature constants slug expanded to publius vergilius maro, also a Latin Library path segment for Vergil's works.
- **victor**: Second word of the aurelius-victor literature slug, which the constants expand to sextus aurelius victor.
- **virgil**: Path segment and literature name for Virgil, a spelling variant of vergil that the Latin Library crawler matches.
- **vitruvius**: Literature constants slug expanded to marcus vitruvius pollio, the architectural writer whose name the constants supply.
- **vocal**: Adjective for a vowel sound, such as an ecclesiastical vocal i, which the pronunciation services classify by position.
- **vocalic**: Adjective for a sound that behaves as a vowel, such as inter-vocalic i, checked by the classical and ecclesiastical services.
- **vocative**: Grammatical case of direct address, whose singular and plural forms the manual omnis template fills in.
- **voice**: Grammatical voice, active or passive, which the forms builder narrows and passes to finite verb form builders.
- **vol**: Praenomen abbreviation key vol, expanded to feminine volusa or masculine volesus in the manual praenomen table.
- **vop**: Praenomen abbreviation key vop, expanded to feminine vopisca or masculine vopiscus in the manual praenomen table.
- **vowel**: Sound class for a, e, i, o, u and their long forms, which the classical and ecclesiastical pronunciation services check around letters.
- **vulgar**: Label in Wiktionary anchor text, as in Vulgar Latin, that the pronunciation classifier matches to mark a variant.
- **vulgate**: Literature constants slug part for the Vulgate Bible, expanded to biblia sacra vulgata testamentum novum or vetum.
- **weak**: Glossary-only entry; the code never labels a verb weak, so the word stands for no project concept.
- **whitespace**: Character class of spaces and tabs that the library utilities strip from lines, such as padded end-of-line poetry numbers.
- **wikipedia**: Source dump, a data/wikipedia folder kept out of git, whose extraction the dictionary command requires first.
- **wiktionary**: Dictionary source of raw HTML lemma pages that the stage downloads and caches under data/wiktionary.
- **word1**: Test fixture variable holding a Word with id 1 and data amo, used in the words service unit tests.
- **word2**: Test fixture variable holding a Word with id 2 and data amare, used in the words service unit tests.
- **writable**: Property flag set in test mocks so a stubbed property accepts writes, the writable counterpart of configurable.
- **xii**: Roman numeral twelve, part of the Sacrorum Fastorum Libri XII title and the Athenaeus citation in an Apicius appendix.
- **xml**: Markup format of the Perseus and OpenGreekAndLatin source texts, read with a parser before the library builders write markdown.
- **xs**: Digraph key xs that the classical substitutions map to a single x sound before phonemes are assigned.
- **year**: Integer year read from a Latin Library era string, negated for B.C. dates, which the builder uses for work start and end.

<!-- coinagerie:end -->
