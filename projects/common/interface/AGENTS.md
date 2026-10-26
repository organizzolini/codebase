# Interface: Shared GraphQL Package

## Quick Start

**Type**: NestJS library package (`@codebase/interface`)

**Purpose**: The one place a GraphQL API and its clients keep shared symbols
and logic, as `@codebase/persistence` is for Postgres. Two modules: `graphql-server`
holds the Relay connection, edge, and page info types, offset cursor and
relation-mapping helpers, and the type contract that ties a GraphQL object to
its TypeORM entity; `graphql-client` holds the code generation configuration web
clients share. See the [README](README.md) for the exports.

This package imports no workspace package, so any API can depend on it without
inheriting an edge. It never imports an application.

## Architecture Overview

### Tech Stack

- **GraphQL**: `@nestjs/graphql` decorators, code-first
- **Language**: Strict TypeScript

### Directory Layout

```text
src/
  index.ts                          # Public API, the server module only
  modules/
    graphql-server/
      graphql-server.entities.ts    # PageInfo
      graphql-server.types.ts       # Connection, Edge, GraphQLObjectOf, GraphQLFields
      graphql-server.utilities.ts   # Paginated, cursors, mapRelation* helpers
    graphql-client/
      graphql-client.constants.ts   # Scalar map and generated paths
      graphql-client.types.ts       # GraphqlCodegenOptions
      graphql-client.utilities.ts   # createGraphqlCodegenConfig, the @codebase/interface/client entry
testing/
  index.ts                          # The @codebase/interface/testing entry
  graphql-mock-server.ts            # The client's MSW server and its start, reset, and stop
  pagination.ts                     # paginateArray and the page matrix, the oracle SQL paging agrees with
  setup.ts, mocks.ts                # Vitest setup and mocks
```

## Development

### Adding Shared GraphQL Logic

Add a symbol here only when two APIs, or one API and a test harness, need it.
Put it in the module for the side it serves. Anything naming a specific API's entities, such as `DeletableType`, stays in
that API.

### Code Generation

A web client's `codegen.ts` calls `createGraphqlCodegenConfig` from
`@codebase/interface/client` and passes its schema path. Keep `graphql-client` free
of Nest decorators and server imports, since the code generator loads it
directly and a client must not inherit `@nestjs/graphql`. The plugins the
configuration names are installed by the client that runs `graphql-codegen`.

### Key Commands

```bash
nx run interface:typecheck-code,lint-code,format-code,deprecate-code,guard-code
nx run interface:vitest:unit
nx run interface:type-coverage
```

Unit tests co-locate with the source as `*.unit.test.ts`; see the
[testing-strategy skill](../../../.agents/skills/testing-strategy/SKILL.md).
