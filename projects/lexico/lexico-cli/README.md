# 🚰 Lexico Ingestion

**Where the dictionary comes from.** A NestJS command-line application that
scrapes, parses, and loads the sources behind
[Lexico](../lexico-web/README.md) into the schema defined by
[lexico-db](../lexico-db/README.md).

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
[`@codebase/lexico-db`](../lexico-db/README.md), so the
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
nx run lexico-db:migration:run
```

## Related

- 🐺 [lexico-web](../lexico-web/README.md) — the web application
- 📖 [lexico-db](../lexico-db/README.md) — the schema this writes to
- 🎨 [presentation](../../common/presentation/README.md) — the interface

## License

MIT — see [LICENSE](../../../LICENSE).

## 👔 Conformetry

This project was generated from the [nestjs-command-project](../../../configuration/conformetry-templates/nestjs-command-project) conformetry template.

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run lexico-cli:coinagerie-check:write`.

- **agr**: Abbreviated praenomen key for Agrippa in the manual praenomen table, expanded only to its masculine form.
- **ammianus**: Short literature slug that the literature constants map to the full author name Ammianus Marcellinus.
- **anchor**: HTML link element the Latin Library builder reads, using its text and nearby headings to label a work or book.
- **ap**: Abbreviated praenomen key for Appius, which the manual praenomen table expands to feminine Appia or masculine Appius.
- **apicius**: Author slug for the Roman cookery writer Apicius, whose appendicula and excerpta texts the library ingests from Open Greek and Latin.
- **apuleius**: Short literature slug mapped by the literature constants to the full name Lucius Apuleius Madaurensis.
- **batch**: Group of rows written in one database operation, such as the single upsert of all Word and form rows.
- **book**: Work-level grouping unit in ingested texts, set as type book or text by the Latin Library builder and the EDCS provider.
- **breadth**: Callidescope limit measuring the widest fan-out of direct callees, set as maximumBreadth in the project config.
- **category**: Grouping page or part-of-speech class; Latin Library category links become Author entities, and the forms builder builds Forms per category.
- **conjunction**: Part-of-speech tag for conjunctions, which the part-of-speech constants also assign to idioms, particles, and phrases.
- **coquinaria**: Title of the Apicius text De Re Coquinaria, an ingested Latin cookery book under the apicius data folder.
- **corpus**: Ingested collection of Latin texts, such as the data/library corpus from Open Greek and Latin, and the Corpus Scriptorum provider.
- **csel**: Short name for the Corpus Scriptorum Ecclesiasticorum Latinorum, the ecclesiastical corpus whose XML this command downloads and caches.
- **curtius**: Literature constants slug for Curtius Rufus, expanded to quintus curtius rufus for literature ingestion lookups.
- **datenbank**: German noun part of Epigraphik-Datenbank, the EDCS name the project's command and provider use for the inscription database.
- **db**: Stray fragment of the db.edcs.eu source URL, which the EDCS library provider records as text metadata.
- **degree**: Comparison grade of an adjective or adverb, such as positive, comparative, or superlative, set on manual inflections.
- **dictionary**: Main ingestion stage that parses cached Wiktionary pages into lexemes, forms, and translations, run by the dictionary command.
- **disambiguator**: Numeric index that tells apart lexemes sharing a lemma, saved on each lexeme and used to reload it by lemma.
- **ecclesiastical**: Pronunciation mode for Ecclesiastical Latin, with its own phoneme map and service used beside the classical one.
- **ecclesiasticorum**: Part of the Corpus Scriptorum Ecclesiasticorum Latinorum name, the CSEL corpus command and its ingestion module.
- **element**: Cheerio node a parser callback receives while walking Wiktionary or library HTML, passed to $(element) for selection.
- **epigraphik**: Prefix of Epigraphik-Datenbank Clauss-Slaby, the inscription source whose command, provider, and chunk schema this CLI reads.
- **headword**: Wiktionary heading marker, the strong.headword element whose paragraph the lexemes parser iterates to find each lexeme.
- **iacē**: Classical substitution key matching a Latin stem fragment, rewritten to the j form jacē before phonemes are mapped.
- **ingest**: Verb for loading one source into the database, as in provider.ingest for each library author the library command selects.
- **inscription**: Stone-text record from the Epigraphik-Datenbank, whose text the EDCS provider skips when missing and turns into a work.
- **iūd**: Classical substitution key matching a Latin stem fragment, rewritten to the j form jūd before phonemes are mapped.
- **iūe**: Classical substitution key matching a Latin stem fragment, rewritten to the j form jūe before phonemes are mapped.
- **iūg**: Classical substitution key matching a Latin stem fragment, rewritten to the j form jūg before phonemes are mapped.
- **iūn**: Classical substitution key matching a Latin stem fragment, rewritten to the j form jūn before phonemes are mapped.
- **iūr**: Classical substitution key matching a Latin stem fragment, rewritten to the j form jūr before phonemes are mapped.
- **iūt**: Classical substitution key matching a Latin stem fragment, rewritten to the j form jūt before phonemes are mapped.
- **iūv**: Classical substitution key matching a Latin stem fragment, rewritten to the j form jūv before phonemes are mapped.
- **justin**: Literature constants slug for Justin, expanded to marcus iunianus iustinus, the epitomist whose name the constants spell out.
- **juvenal**: Literature constants slug expanded to decimus iunius iuvenalis, the satirist whose full Latin name the constants supply.
- **law**: Path segment /law/ that the Latin Library crawler matches, and part of the roman-law literature slug mapped to ius romanum.
- **leaf**: Terminal node of the Perseus text tree that writes one markdown file, using p or l nodes or a fallback.
- **letter**: Part-of-speech value that the lexemes service skips entirely, because a letter entry is not ingested as a lexeme.
- **lexeme**: Core entity for one dictionary entry, saved per lemma and disambiguator, holding translations, forms, and principal parts.
- **literature**: Lexico-cli stage that ingests lines and tokens of each text loaded from the library, run by the literature command.
- **livy**: Literature constants slug for Livy, expanded to titus livius, the historian whose name the literature ingestion uses.
- **lucan**: Literature constants slug for Lucan, expanded to marcus annaeus lucanus, the epic poet whose name the constants supply.
- **lucretius**: Literature constants slug expanded to titus lucretius carus, the philosopher-poet whose text the literature ingestion loads.
- **martial**: Literature constants slug for Martial, expanded to marcus valerius martialis, the epigrammatist the literature ingestion loads.
- **mela**: Second half of the author slug pomponius-mela, whose De chorographia the library ingests as a work.
- **perfect**: Verb tense family covering perfect, future perfect, and pluperfect, which the part-of-speech forms service maps by name.
- **perseus**: Source and command for the Perseus Digital Library, which the perseus stage converts from XML into markdown library works.
- **phase**: Stage of a multi-step chunk run, such as the chunk phase in EDCS ingestion, where undefined entries are skipped.
- **pronunciation**: Module and service that derive phonemic and phonetic spellings for each Wiktionary entry, in classical or ecclesiastical mode.
- **selector**: CSS selector string passed to the test mock Cheerio helper, which selects one element from loaded HTML for assertions.
- **self**: Adjective for a link that points back to its own page, which the Latin Library builder skips as self-referential.
- **slaby**: Name part of Epigraphik-Datenbank Clauss-Slaby, the EDCS source whose command and chunk schema live in this project.
- **splice**: Array method that removes matched items from existing forms, used in the forms service to reuse saved row IDs.
- **terence**: Literature constants slug expanded to publius terentius afer, the comic playwright whose name the constants supply.
- **tibullus**: Literature constants slug expanded to albius tibullus, the elegiac poet whose name the constants supply for lookups.
- **trace**: Stack-trace text the logger records with an error, and the call chain callidescope follows when measuring depth.
- **translation**: Gloss entity for one meaning of a lexeme, saved per lexeme and parsed from the Wiktionary translations list.
- **valerius**: Name part shared by the Catullus, Martial, and Valerius Flaccus literature slugs, which each expand to a full Valerius name.
- **varro**: Literature constants slug for Varro, expanded to marcus terentius varro, whose Res rusticae the library ingests.
- **vellius**: Literature constants slug expanded to gaius velleius patereculus, the historian whose name the constants supply.
- **verb**: Part-of-speech tag for verbs, which the forms builder uses to build finite and non-finite verb forms through the verb builder service.
- **vergil**: Literature constants slug expanded to publius vergilius maro, also a Latin Library path segment for Vergil's works.
- **victor**: Second word of the aurelius-victor literature slug, which the constants expand to sextus aurelius victor.
- **virgil**: Path segment and literature name for Virgil, a spelling variant of vergil that the Latin Library crawler matches.
- **vitruvius**: Literature constants slug expanded to marcus vitruvius pollio, the architectural writer whose name the constants supply.
- **vol**: Praenomen abbreviation key vol, expanded to feminine volusa or masculine volesus in the manual praenomen table.
- **vop**: Praenomen abbreviation key vop, expanded to feminine vopisca or masculine vopiscus in the manual praenomen table.
- **vulgate**: Literature constants slug part for the Vulgate Bible, expanded to biblia sacra vulgata testamentum novum or vetum.
- **whitespace**: Character class of spaces and tabs that the library utilities strip from lines, such as padded end-of-line poetry numbers.
- **wikipedia**: Source dump, a data/wikipedia folder kept out of git, whose extraction the dictionary command requires first.
- **wiktionary**: Dictionary source of raw HTML lemma pages that the stage downloads and caches under data/wiktionary.

<!-- coinagerie:end -->

<!-- codometer:start -->

## ⏲️ Codometer

### Project

![Lines of Code](https://img.shields.io/badge/Lines_of_Code-33647-22c55e?style=flat-square)
![Repository Size](https://img.shields.io/badge/Repository_Size-2.08_MB-6b7280?style=flat-square)
![Folders](https://img.shields.io/badge/Folders-31-4a4a4a?style=flat-square)
![Source Files](https://img.shields.io/badge/Source_Files-160-3178c6?style=flat-square)

### Measured Targets

![Compiled JavaScript Size](https://img.shields.io/badge/Compiled_JavaScript_Size-98.90_kB_gzip-6b7280?style=flat-square)

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

![Markdown Files](https://img.shields.io/badge/Markdown_Files-10-083fa1?style=flat-square)
![Markdown Lines](https://img.shields.io/badge/Markdown_Lines-5407-1f6feb?style=flat-square)
![H1](https://img.shields.io/badge/H1-8-7c3aed?style=flat-square)
![H2](https://img.shields.io/badge/H2-10-8b5cf6?style=flat-square)
![H3](https://img.shields.io/badge/H3-21-a78bfa?style=flat-square)
![H4](https://img.shields.io/badge/H4-0-c4b5fd?style=flat-square)
![H5](https://img.shields.io/badge/H5-0-ddd6fe?style=flat-square)
![H6](https://img.shields.io/badge/H6-0-ede9fe?style=flat-square)
![Paragraphs](https://img.shields.io/badge/Paragraphs-1940-64748b?style=flat-square)
![Lists](https://img.shields.io/badge/Lists-7-16a34a?style=flat-square)
![List Items](https://img.shields.io/badge/List_Items-36-22c55e?style=flat-square)
![Task List Items](https://img.shields.io/badge/Task_List_Items-0-4ade80?style=flat-square)
![Tables](https://img.shields.io/badge/Tables-7-0284c7?style=flat-square)
![Table Rows](https://img.shields.io/badge/Table_Rows-311-0ea5e9?style=flat-square)
![Links](https://img.shields.io/badge/Links-12-059669?style=flat-square)
![Images](https://img.shields.io/badge/Images-0-10b981?style=flat-square)
![Code Blocks](https://img.shields.io/badge/Code_Blocks-44-dc2626?style=flat-square)
![Inline Code](https://img.shields.io/badge/Inline_Code-1303-ef4444?style=flat-square)
![Block Quotes](https://img.shields.io/badge/Block_Quotes-0-ca8a04?style=flat-square)
![Thematic Breaks](https://img.shields.io/badge/Thematic_Breaks-0-a16207?style=flat-square)
<!-- codometer:end -->
