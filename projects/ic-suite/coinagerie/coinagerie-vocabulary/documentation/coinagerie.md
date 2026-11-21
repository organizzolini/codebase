<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with this project's `coinagerie-check:write` Nx target.

- **aspect**: Example word in folding tests, where aspects folds into the singular aspect; also a fixture file name.
- **bundle**: Fixture path dist/bundle.js that discovery tests use to check an exclude list drops the dist folder.
- **glossary**: The GLOSSARY.md file discovery skips so a glossary's own headwords never count as codebase vocabulary.
- **headword**: The single form a word folds into, which the glossary lists once and exclusion compares against.
- **phase**: A word split from the fixture file aspect-phase-emoji.service.ts, testing that hyphenated names split into words.
- **term**: A word of at least two code points that counts toward the vocabulary, as defined by TERM_LENGTH_PATTERN.
- **verb**: Lemmatizer step from wink-lemmatizer reducing an inflected verb form to its base, as configuring to configure.
- **vocabulary**: The sorted list of every word the codebase uses, produced by VocabularyService.collect after folding and exclusion.

<!-- coinagerie:end -->
