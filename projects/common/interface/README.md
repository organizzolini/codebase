# interface

Shared GraphQL package for the workspace's APIs and their clients, as
[persistence](../persistence) is for Postgres. Two modules, one for each side
of the wire, each behind its own entry so a client never imports the Nest
decorators a server needs.

## graphql-server

From `@codebase/interface`, for an API built on `@nestjs/graphql`:

| Export                                                                                       | What it is                                                        |
| -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `PageInfo`                                                                                   | Relay page info object type                                       |
| `Paginated`, `createEdgeType`                                                                | Mixins that build a node's Relay connection and edge object types |
| `createConnection`, `createEdge`, `mapConnection`                                            | Build and map Relay connections                                   |
| `toCursor`, `fromCursor`, `fromCursorSafe`, `encodeOffsetCursor`, `decodeOffsetCursor`       | Opaque and offset cursors                                         |
| `mapRelation`, `mapRelations`, `mapRelationConnection`, `mapNullable*`                       | Map an entity's relations, keeping `null` and unjoined relations  |
| `Connection`, `Edge`, `GraphQLFields`, `GraphQLObjectOf`, `MappedFields`, `RelationKey`, ... | Types, including the entity-to-GraphQL-object contract            |

## graphql-client

From `@codebase/interface/client`, for a web client of such an API:
`createGraphqlCodegenConfig`, the GraphQL Code Generator configuration every
client shares. A client's `codegen.ts` passes only the schema its API emits and
gets typed operations, Zod validators, and MSW handlers.

## Testing

From `@codebase/interface/testing`:

- For a client: `graphqlMockServer` with `startGraphqlMockServer`,
  `resetGraphqlMockServer`, and `stopGraphqlMockServer`, the MSW server its
  tests answer GraphQL requests with.
- For a server: `paginateArray`, `paginationMatrix`, `expectedPage`, and
  `summarize`, the oracle a SQL-backed page is checked against.

## Test

```bash
nx run interface:vitest
```

## 👔 Conformetry

This project was generated from the [nestjs-service-project](../../../configuration/conformetry-templates/nestjs-service-project) conformetry template.

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run interface:coinagerie-check:write`.

- **breadth**: The callee-count limit callidescope applies per callable, set to seven in this project.
- **large**: Size word in test names for first and last counts beyond the array length, such as largeFirstResult.
- **quick**: A pagination matrix with only the none, first and last cases, built by the quick option.
- **self**: The implementing class of a type, named Self in generics so a shape requires its own fields.

<!-- coinagerie:end -->
