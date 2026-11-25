# coinagerie-vocabulary

File discovery, word splitting, folding, and exclusion that turn a codebase into a sorted list of headwords. It depends on `@coinagerie/configuration`, `@coinagerie/languages`.

## Modules

- `discovery/` — Lists the files a run scans (`DiscoveryService`).
- `folding/` — Folds a word's surface forms into one headword, so each term is listed once (`FoldingService`).
- `vocabulary/` — The coinagerie pipeline: from a configuration to the sorted words the code uses (`VocabularyService`).
- `words/` — Splits names into the words a glossary lists (`WordsService`).
