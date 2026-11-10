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
| `WordsService.ingestLexemeWords` | 5 | `WordsService.getLexemeWords`, `WordsService.filter(…)`, `WordsService.map(…)`, `WordsService.map(…)`, `WordsService.map(…)` | `projects/lexico/lexico-cli/src/modules/words/words.service.ts:121` |
| `WordsService.upsertWordsAndJunctions` | 5 | `WordsService.map(…)`, `WordsService.map(…)`, `WordsService.map(…)`, `WordsService.insertWordFormChunks`, `WordsService.buildWordFormValues` | `projects/lexico/lexico-cli/src/modules/words/words.service.ts:169` |
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
| `WordsService.map(…)` | 2 | `WordsService.escapeCapitals`, `WordsService.normalize` | `projects/lexico/lexico-cli/src/modules/words/words.service.ts:130` |
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
| `WordsService.escapeCapitals` | 1 | `WordsService.replaceAll(…)` | `projects/lexico/lexico-cli/src/modules/words/words.service.ts:61` |
| `WordsService.getLexemeWords` | 1 | `WordsService.forEach(…)` | `projects/lexico/lexico-cli/src/modules/words/words.service.ts:112` |
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
