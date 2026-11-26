# coinagerie-output

Renders and parses the markdown and JSON glossaries and compares them with the vocabulary of a codebase. It depends on `@coinagerie/configuration`, `@coinagerie/core`.

## Modules

- `comparison/` — Compares a glossary with the codebase's vocabulary, and reconciles one to the other (`ComparisonService`).
- `delivery/` — Checks and writes every configured glossary destination (`DeliveryService`).
- `json/` — Renders and parses the JSON glossary: a flat object sorted by word, each value a definition or empty (`JsonService`).
- `markdown/` — Renders, parses, and splices the markdown glossary block: a `## 🪙 Coinagerie` heading, an optional description, and one `- **word**: definition` bullet per word, between anchors (`MarkdownService`).
