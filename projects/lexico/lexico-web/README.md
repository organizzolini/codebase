# 🐺 Lexico

**A Latin–English dictionary, rebuilt.**

> ⚠️ **Work in progress.** The old application is being replaced one page at
> a time. Search is the first page rebuilt: it answers from the
> [lexico-api](../lexico-api/README.md) GraphQL endpoint. Bookmarks, literature,
> grammar, and accounts are gone until their replacements land.

Lexico is a server-side rendered web application built with TanStack Start and
React 19. It is the front end of a small suite: the dictionary's shape lives in
[lexico-db](../lexico-db/README.md), the data that
fills it is gathered by
[lexico-cli](../lexico-cli/README.md), and the interface is built
from [presentation](../../common/presentation/README.md).

## Projects

| Project | Role |
| ------- | ---- |
| 🐺 [lexico-web](README.md) | The SSR web application — routes, server functions, pages |
| 🎨 [presentation](../../common/presentation/README.md) | Shared React component library on shadcn/ui and Base UI primitives |
| 📖 [lexico-db](../lexico-db/README.md) | TypeORM entities and migrations for the dictionary and literature schema |
| 🚰 [lexico-cli](../lexico-cli/README.md) | CLI that scrapes and loads dictionary, literature, and etymology sources |

## Quick Start

```bash
pnpm install
nx run lexico-web:start     # http://localhost:7797
```

| Target | Does |
| ------ | ---- |
| `start` | Vite dev server with hot reload, once the API is ready |
| `stop` | Free port 7797; `nx stop lexico-api` stops this and then the API |
| `build` | Production SSR bundle |
| `codegen` | Generate typed GraphQL operations, Zod schemas, and MSW handlers |
| `codegen-watch` | Regenerate GraphQL artifacts as operations or schema change |
| `preview` | Build, then serve the production build locally |
| `codometer` | Measure the entry, route, CSS, and server bundles and gate the limit each declares |
| `vitest` | Tests — `:unit`, `:integration`, `:end-to-end` |
| `lint-code` | All static analysis; `--configuration=write` to auto-fix |

## Structure

```text
src/
├── routes/              # File-based routing (TanStack Router)
│   ├── __root.tsx       # Root layout and sidebar
│   ├── index.tsx        # / (redirects to /search)
│   └── search.tsx       # /search — loader, server function, page
├── routeTree.gen.ts     # Generated route tree, never edited
├── components/          # One component and its test per file
├── styles/              # Lexico's accent color over the shadcn tokens
├── client.tsx           # Client entry
└── router.tsx           # Router construction
```

Routes are defined by file structure: `src/routes/search.tsx` serves `/search`.

Data access goes through a TanStack Start **server function** — type-safe RPC
from client to server — defined beside the route that uses it and called from
its loader, so the first render is already populated. `/search` asks the API
for Latin and English matches at once and merges them, best first; set
`LEXICO_API_URL` to point it somewhere other than `http://localhost:5003/graphql`.
GraphQL documents live in `src/graphql/operations/*.graphql` and are compiled
into `src/graphql/generated/` by GraphQL Code Generator, which emits operation
types, Zod validators, and MSW mock helpers for tests.

## Technology

- **React 19** with TanStack Router for file-based routing
- **TanStack Start** for SSR and server functions
- **Tailwind CSS** with shadcn/ui components from
  [presentation](../../common/presentation/README.md)
- **Vite 7** with Nitro for the SSR bundle
- **TypeScript 5.9**, strict mode throughout

## Documentation

- [AGENTS.md](AGENTS.md) — architecture and development patterns
- [Codebase AGENTS.md](../../../AGENTS.md) — workspace conventions and Nx workflows
- [TanStack Start](https://tanstack.com/router/latest/docs/framework/react/start/overview)

## Develop

```bash
nx run lexico-web:start
```

## Test

```bash
nx run lexico-web:vitest
```

## 👔 Conformetry

This project was generated from the [tanstack-application](/configuration/conformetry-templates/tanstack-application) conformetry template.

## License

MIT — see [LICENSE](../../../LICENSE).

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run lexico-web:coinagerie-check:write`.

- **alt**: Alternate text on the Lexico logo image, so screen readers announce the brand name rather than the file.
- **breadth**: Callidescope measure of how many callees one frame fans out to, bounded by maximumBreadth in each project's config.
- **degree**: Comparison grade of an adjective or adverb, such as positive, shown in lexeme inflection data and header details.
- **dictionary**: Latin reference the app searches in Latin and English, shown as the sidebar brand and as each lexeme entry.
- **disambiguator**: Float field on GraphQL search results giving a numeric index that tells apart lexemes sharing a headword.
- **element**: Generic DOM node in tests, such as a found link whose href is checked to confirm navigation to a route.
- **fire**: Test verb: fireEvent dispatches a DOM event, such as click or focus, on an element rendered under test.
- **grammar**: Word in code comments naming grammar-book conventions, such as the short labels and case order in form tables.
- **headword**: Dictionary entry's main Latin form, the lemma a search matches exactly, shown as exact-headword in match kinds.
- **letter**: Count of extra letters in a fuzzy headword match, shown in the tooltip for a prefix match beyond the query.
- **lexeme**: Dictionary entry for one headword with its forms, pronunciations and etymology, the core record every card shows.
- **literature**: GraphQL type for literature search results, present in generated mocks and operations but not yet rebuilt as a page.
- **perfect**: Verb tense name for the perfect, abbreviated PERF in identifiers and listed among the finite verb tenses.
- **presentation**: Shared component library package @codebase/presentation, built on shadcn/ui, supplying Card, Badge, Tabs and Button.
- **pronunciation**: Spoken form of a lexeme, a list of phonetic variants with their variant label, rendered in the lexeme pronunciations section.
- **role**: ARIA role attribute set to navigation on the application sidebar and to search on the search bar form.
- **selector**: Not used in lexico-web source; tests find elements by role and test id rather than through any selector abstraction.
- **translation**: English or Latin rendering of a lexeme, listed as bullets by LexemeTranslations and matched by search.
- **verb**: Part of speech whose forms render as a conjugation table, routed to the VerbForms component when partOfSpeech is verb.
- **visible**: Tailwind overflow-visible class on the search bar card, so content can extend past the card edges.

<!-- coinagerie:end -->
