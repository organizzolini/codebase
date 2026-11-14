<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with this project's `coinagerie-check:write` Nx target.

- **anchor**: Start and end marker comments bracketing the coinagerie block in a markdown glossary, so a write replaces only that span.
- **angle**: Sample glossary word the end-to-end tests define as the gap between two bodies, used to exercise a failing check.
- **aspect**: Sample glossary word in the collect command's JSON and check-failure fixtures, standing for an identifier that must be defined.
- **batch**: The command that checks or writes the glossaries of many project directories in one process, printing a JSON verdict for each.
- **breadth**: Second limit in callidescope's gate, the count of distinct callees one callable may reach, here capped at five in this package.
- **bullet**: Glossary entry line in the form dash, bold word, colon, which carries the definition beneath it and is what the parser reads.
- **disagree**: Of a glossary whose words differ from the code's, missing some or listing stale ones, so a check fails on it.
- **glossary**: The markdown or JSON file of word-to-definition entries that a run checks against the code and rewrites when asked.
- **lunar**: Sample glossary word in the check-failure fixtures, given an empty definition, which a check still passes though it stays undefined.
- **phase**: Sample glossary word in the check-failure fixtures, given a short definition that the markdown and JSON tests assert on.
- **reconcile**: Method of the comparison service that merges collected words with existing glossary entries, keeping definitions for words still in use.
- **rewrite**: Action of the write mode that rewrites every glossary to hold exactly the code's words, keeping definitions for words still present.
- **sandbox**: Isolated consumer project outside the workspace, where a packed test installs tarballs and runs the real executable. Everyday "sandbox" suggests a safe play area; here it is a disposable directory. Created by `createTarballSandboxRunner` in `@codebase/testing`.
- **vocabulary**: Workspace package that collects the words a codebase uses, depended on by coinagerie-cli to gather its vocabulary.

<!-- coinagerie:end -->
