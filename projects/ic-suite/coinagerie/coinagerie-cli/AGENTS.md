# coinagerie-cli

Command-line tool that lists the vocabulary of a codebase and keeps a glossary of it in step with the code.

## Commands

- `batch` — Check or write the glossaries of every named project directory, printing a JSON verdict for each. (`src/modules/batch/batch.command.ts`)
- `collect` — List the words the code uses, and check or write a glossary of them. (`src/modules/collect/collect.command.ts`)
