# GraphQL Code Generator plan for `lexico-web` from `lexico-api` `schema.gql`

Date: 2026-10-18

## Why this note lives in `documentation/research/`

This repository’s authoring convention says documentation should be written under `documentation/` (with `docs/` only as a symlink), and there is already an established date-prefixed research-notes pattern in `documentation/research/`.  
Repo citations: `AGENTS.md:296-312`, `documentation/research/2026-10-17-alternatives-to-nxignore-for-generator-templates.md:1`, `documentation/research/2026-10-17-task-based-affected-ci-precommit-optimization.md:1`.

---

## 1) Current-state fit for this repo

- `lexico-api` is NestJS GraphQL code-first and already emits schema via `autoSchemaFile`, wired to `GRAPHQL_SCHEMA_FILE`. Repo citations: `projects/lexico/lexico-api/src/lexico-api.module.ts:29-31`, `projects/lexico/lexico-api/src/lexico-api.constants.ts:24-30`.
- `GRAPHQL_SCHEMA_FILE` points to `src/schema.gql` beside the module. Repo citation: `projects/lexico/lexico-api/src/lexico-api.constants.ts:30`.
- `lexico-web` currently uses direct `fetch` with a JSON `{ query, variables }` body and manual GraphQL string assembly in `search.tsx`. Repo citations: `projects/lexico/lexico-web/src/routes/search.tsx:201-212`, `projects/lexico/lexico-web/src/routes/search.tsx:230-233`, `projects/lexico/lexico-web/src/routes/search.tsx:298-301`.
- Current tests stub global `fetch` manually and return ad-hoc GraphQL JSON payloads. Repo citation: `projects/lexico/lexico-web/src/routes/search.integration.test.tsx:44-57`.
- Nx already starts API before web dev server (`lexico-web:start` depends on `lexico-api:start`), so schema emission is naturally aligned with frontend dev flow. Repo citations: `projects/lexico/lexico-web/project.json:46-54`, `projects/lexico/lexico-web/project.json:48`, `projects/lexico/lexico-api/project.json:49-56`.

**Conclusion:** the architecture is already a strong fit for file-based GraphQL Codegen (`../lexico-api/src/schema.gql`) with low migration friction.

---

## 2) Options comparison

## Option A — `client` preset

- The `client` preset provides typed GraphQL operations and is designed to integrate with common clients (`@apollo/client`, `urql`, `graphql-request`, etc.).  
  Source: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client
- Good if `lexico-web` adopts a client abstraction later.

## Option B — explicit plugin stack (`typescript` + `typescript-operations` + `typed-document-node`)

- Codegen config supports explicit `schema` / `documents` / `generates` outputs.  
  Source: https://the-guild.dev/graphql/codegen/docs/config-reference/codegen-config
- `typed-document-node` generates pre-compiled `DocumentNode` values with typed result/variables and is intended to be used with operation typings.  
  Source: https://the-guild.dev/graphql/codegen/plugins/typescript/typed-document-node
- Best fit for your current direct-fetch architecture because it adds types without forcing a runtime GraphQL client rewrite.

## Option C — Option B + runtime schemas (`typescript-validation-schema`)

- Validation plugin supports Zod (`zod` / `zodv4`) and operation-result schema generation (`withOperationType`).  
  Sources:  
  - https://the-guild.dev/graphql/codegen/plugins/typescript/typescript-validation-schema  
  - https://github.com/Code-Hex/graphql-codegen-typescript-validation-schema
- Use when you want runtime guards in addition to compile-time typing.

---

## 3) Recommended stack (practical, for this monorepo)

Recommend **Option B + selective Option C**:

1. `@graphql-codegen/cli`
2. `@graphql-codegen/typescript`
3. `@graphql-codegen/typescript-operations`
4. `@graphql-codegen/typed-document-node`
5. `@graphql-codegen/typescript-msw` (for test mocks)
6. `graphql-codegen-typescript-validation-schema` (optional but recommended for critical server-function boundaries)

Why:

- Keeps the existing `fetch` transport and TanStack Start server-function shape.
- Eliminates manual operation/result typing drift from string-based queries.
- Adds typed MSW handlers for integration tests.
- Keeps migration incremental (route-by-route).

Package sources:

- https://the-guild.dev/graphql/codegen/docs/config-reference/codegen-config
- https://the-guild.dev/graphql/codegen/plugins/typescript/typed-document-node
- https://the-guild.dev/graphql/codegen/plugins/typescript/typescript-msw
- https://the-guild.dev/graphql/codegen/plugins/typescript/typescript-validation-schema
- https://github.com/Code-Hex/graphql-codegen-typescript-validation-schema

---

## 4) Exact config examples (files, scripts, output locations)

## 4.1 Operation documents location

Move operations from template strings in `search.tsx` to static `.graphql` files:

- `projects/lexico/lexico-web/src/graphql/operations/searchLatin.graphql`
- `projects/lexico/lexico-web/src/graphql/operations/searchEnglish.graphql`
- `projects/lexico/lexico-web/src/graphql/operations/lexemeForms.graphql`

Reason: Codegen `documents` scanning is designed for `.graphql` files and/or pluckable GraphQL in code (`gql` tag or `/* GraphQL */`), while your current dynamic string interpolation is brittle for static extraction.  
Source: https://the-guild.dev/graphql/codegen/docs/config-reference/documents-field

## 4.2 `projects/lexico/lexico-web/codegen.ts`

```ts
import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "../lexico-api/src/schema.gql",
  documents: ["src/graphql/operations/**/*.graphql"],
  ignoreNoDocuments: false,
  generates: {
    "./src/graphql/generated/operations.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        "typed-document-node",
      ],
      config: {
        useTypeImports: true,
        strictScalars: true,
        scalars: {
          ID: { input: "string", output: "string" },
        },
      },
    },
    "./src/graphql/generated/validation.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        {
          "typescript-validation-schema": {
            schema: "zodv4",
            withOperationType: true,
            importFrom: "./operations",
            useTypeImports: true,
          },
        },
      ],
      config: {
        useTypeImports: true,
      },
    },
    "./src/graphql/generated/mocks.ts": {
      plugins: ["typescript", "typescript-operations", "typescript-msw"],
      config: {
        useTypeImports: true,
      },
    },
  },
};

export default config;
```

Config basis sources:

- Config shape (`schema`, `documents`, `generates`): https://the-guild.dev/graphql/codegen/docs/config-reference/codegen-config
- `schema` field (local file path support): https://the-guild.dev/graphql/codegen/docs/config-reference/schema-field
- `documents` field and scanning behavior: https://the-guild.dev/graphql/codegen/docs/config-reference/documents-field
- Plugin config scoping (`config` at root/output/plugin): https://the-guild.dev/graphql/codegen/docs/config-reference/config-field
- Typed document generation: https://the-guild.dev/graphql/codegen/plugins/typescript/typed-document-node
- Validation plugin options (`schema`, `withOperationType`, `importFrom`): https://github.com/Code-Hex/graphql-codegen-typescript-validation-schema
- MSW plugin requirements and generated mocks: https://the-guild.dev/graphql/codegen/plugins/typescript/typescript-msw

## 4.3 `projects/lexico/lexico-web/package.json` scripts (or Nx targets wrapping these)

```json
{
  "scripts": {
    "codegen": "graphql-codegen --config codegen.ts",
    "codegen:watch": "graphql-codegen --config codegen.ts --watch"
  }
}
```

Watch/script guidance source: https://the-guild.dev/graphql/codegen/docs/getting-started/development-workflow

---

## 5) Nx integration suggestion

Add these targets to `projects/lexico/lexico-web/project.json`:

```json
{
  "targets": {
    "codegen": {
      "executor": "nx:run-commands",
      "options": {
        "cwd": "{projectRoot}",
        "command": "pnpm graphql-codegen --config codegen.ts"
      },
      "inputs": [
        "{projectRoot}/codegen.ts",
        "{projectRoot}/src/graphql/operations/**/*.graphql",
        "{workspaceRoot}/projects/lexico/lexico-api/src/schema.gql"
      ],
      "outputs": ["{projectRoot}/src/graphql/generated"]
    },
    "codegen-watch": {
      "continuous": true,
      "executor": "nx:run-commands",
      "options": {
        "cwd": "{projectRoot}",
        "command": "pnpm graphql-codegen --config codegen.ts --watch"
      }
    }
  }
}
```

Practical repo fit:

- Uses existing `nx:run-commands` target style already used by `start`/`build`. Repo citation: `projects/lexico/lexico-web/project.json:15-23`, `projects/lexico/lexico-web/project.json:46-54`.
- Uses file schema emitted by API (`src/schema.gql`). Repo citation: `projects/lexico/lexico-api/src/lexico-api.constants.ts:30`.
- Keeps web startup dependency on API startup intact. Repo citation: `projects/lexico/lexico-web/project.json:48`.

Monorepo install guidance source: https://the-guild.dev/graphql/codegen/docs/getting-started/development-workflow

---

## 6) Watch mode / dev flow

Recommended developer loop:

1. Run `nx run lexico-api:start` (or `nx run lexico-web:start`, which already starts API first).
2. Run `nx run lexico-web:codegen-watch` in parallel.
3. Edit `.graphql` documents and route code; generated files update automatically.

Why this flow:

- Codegen watch mode is first-class (`--watch`, also `watch: true` config option).  
  Source: https://the-guild.dev/graphql/codegen/docs/getting-started/development-workflow
- In pnpm monorepos, Codegen docs recommend root installation and shared usage patterns.  
  Source: https://the-guild.dev/graphql/codegen/docs/getting-started/development-workflow

---

## 7) Test mocking approach

Use generated MSW handlers from `typescript-msw` instead of manually stubbing `fetch`.

Example shape (in test setup):

```ts
import { setupServer } from "msw/node";
import { HttpResponse } from "msw";
import { mockSearchLatinQuery, mockSearchEnglishQuery } from "../src/graphql/generated/mocks";

const server = setupServer(
  mockSearchLatinQuery(({ variables }) => {
    return HttpResponse.json({
      data: {
        searchLatin: { edges: [] },
      },
    });
  }),
  mockSearchEnglishQuery(() => {
    return HttpResponse.json({
      data: {
        searchEnglish: { edges: [] },
      },
    });
  }),
);
```

Primary sources:

- `typescript-msw` generates typed mock wrappers and documents naming/requirements: https://the-guild.dev/graphql/codegen/plugins/typescript/typescript-msw
- MSW Node `setupServer` API in official source: https://github.com/mswjs/msw/blob/main/src/node/setup-server.ts
- MSW GraphQL endpoint scoping (`graphql.link`) in official source: https://github.com/mswjs/msw/blob/main/src/graphql/graphql.ts

Current-state contrast (what this replaces): `projects/lexico/lexico-web/src/routes/search.integration.test.tsx:44-57`.

---

## 8) Migration plan from manual query strings in `search.tsx`

## Phase 0 — install and scaffold

1. Add Codegen packages at workspace root.
2. Add `codegen.ts` in `lexico-web`.
3. Add Nx `codegen` and `codegen-watch` targets.

## Phase 1 — extract static operations

1. Create `searchLatin.graphql` and `searchEnglish.graphql` from current dynamic `searchLanguage(field, ...)` query construction.
2. Create `lexemeForms.graphql` from current `getLexemeForms` query.

Current dynamic callsites to migrate:

- `projects/lexico/lexico-web/src/routes/search.tsx:226-233`
- `projects/lexico/lexico-web/src/routes/search.tsx:295-301`

## Phase 2 — switch to generated typed documents

1. Introduce a tiny `executeGraphql<TData, TVariables>()` helper that accepts a `TypedDocumentNode<TData, TVariables>` and variables.
2. Replace manual string calls with imports from `src/graphql/generated/operations.ts`.
3. Preserve current fetch endpoint behavior (`LEXICO_API_URL` fallback) and error handling.

Current transport reference: `projects/lexico/lexico-web/src/routes/search.tsx:201-220`.

## Phase 3 — runtime validation hardening (optional but recommended)

1. Use generated Zod schemas from `validation.ts` for operation result validation in server functions with `.parse`/`.safeParse`.
2. Remove `z.custom<ResultNode>()` trust boundaries where generated schemas make this redundant.

Zod parse behavior source: https://github.com/colinhacks/zod

## Phase 4 — test migration

1. Add MSW server setup for route integration tests.
2. Replace `vi.stubGlobal("fetch", ...)` fixtures with generated typed handlers.
3. Keep edge-case tests for API failures by returning GraphQL `errors` payloads in handlers.

## Phase 5 — cleanup and enforce

1. Remove obsolete inline GraphQL selection constants from `search.tsx`.
2. Add a CI/pre-merge step to run `nx run lexico-web:codegen` and verify generated outputs are current.

---

## Practical notes / risks

- `schema.gql` must exist before codegen runs. In local dev, this is naturally satisfied by current `lexico-web:start -> lexico-api:start` dependency chain. Repo citations: `projects/lexico/lexico-web/project.json:48`, `projects/lexico/lexico-api/src/lexico-api.module.ts:29-31`.
- Keep operation documents static (no dynamic `${field}` interpolation) for stable tooling and better editor support.  
  Sources:  
  - https://the-guild.dev/graphql/codegen/docs/config-reference/documents-field  
  - `projects/lexico/lexico-web/src/routes/search.tsx:230-232`

---

## Primary sources used

- https://the-guild.dev/graphql/codegen/docs/config-reference/codegen-config
- https://the-guild.dev/graphql/codegen/docs/config-reference/schema-field
- https://the-guild.dev/graphql/codegen/docs/config-reference/documents-field
- https://the-guild.dev/graphql/codegen/docs/config-reference/config-field
- https://the-guild.dev/graphql/codegen/docs/getting-started/development-workflow
- https://the-guild.dev/graphql/codegen/plugins/presets/preset-client
- https://the-guild.dev/graphql/codegen/plugins/typescript/typed-document-node
- https://the-guild.dev/graphql/codegen/plugins/typescript/typescript-operations
- https://the-guild.dev/graphql/codegen/plugins/typescript/typescript-msw
- https://the-guild.dev/graphql/codegen/plugins/typescript/typescript-validation-schema
- https://github.com/Code-Hex/graphql-codegen-typescript-validation-schema
- https://github.com/mswjs/msw/blob/main/src/graphql/graphql.ts
- https://github.com/mswjs/msw/blob/main/src/node/setup-server.ts
- https://github.com/colinhacks/zod
