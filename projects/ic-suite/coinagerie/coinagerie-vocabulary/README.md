# @coinagerie/vocabulary

[![npm](https://img.shields.io/npm/v/@coinagerie/vocabulary?logo=npm&label=npm)](https://www.npmjs.com/package/@coinagerie/vocabulary)

File discovery, word splitting, folding, and exclusion: the part of coinagerie that turns a codebase into a sorted list of headwords.

```bash
npm install @coinagerie/vocabulary
```

## Test

```bash
nx run coinagerie-vocabulary:vitest
```

## 👔 Conformetry

This project was generated from the [nestjs-service-project](../../configuration/conformetry-templates/nestjs-service-project) conformetry template.

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this package uses that the root glossary does not define, regenerated with `nx run coinagerie-vocabulary:coinagerie-check:write`.

- **aspect**: Example word in folding tests, where aspects folds into the singular aspect; also a fixture file name.
- **breadth**: The maximumBreadth limit, set to seven in this project's callidescope configuration, bounding callees per function.
- **bundle**: Fixture path dist/bundle.js that discovery tests use to check an exclude list drops the dist folder.
- **discovery**: The DiscoveryModule and its walk that collects every file no ignore file claims, skipping symbolic links.
- **glossary**: The GLOSSARY.md file discovery skips so a glossary's own headwords never count as codebase vocabulary.
- **headword**: The single form a word folds into, which the glossary lists once and exclusion compares against.
- **phase**: A word split from the fixture file aspect-phase-emoji.service.ts, testing that hyphenated names split into words.
- **scoped**: Describing an ignore rule set that applies only inside its own folder, as in a nested gitignore scope.
- **singular**: The form pluralize.singular returns, which folding uses as the first step toward a word's headword.
- **term**: A word of at least two code points that counts toward the vocabulary, as defined by TERM_LENGTH_PATTERN.
- **tokenizer**: The language function that splits a file's content into identifiers, looked up by path through LanguagesService.tokenizerFor.
- **verb**: Lemmatizer step from wink-lemmatizer reducing an inflected verb form to its base, as configuring to configure.
- **verdict**: Result an ignore matcher returns for a path, flagging whether a pattern ignored it or re-included it.
- **vocabulary**: The sorted list of every word the codebase uses, produced by VocabularyService.collect after folding and exclusion.

<!-- coinagerie:end -->
