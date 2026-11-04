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
- **decode**: Reverse of encode, turning a cursor back into its offset or payload via decodeOffsetCursor and similar helpers.
- **floor**: Math.floor rounding that picks the middle id of a test id list in the pagination helper.
- **large**: Size word in test names for first and last counts beyond the array length, such as largeFirstResult.
- **middle**: Position between the first and last members, one of the pagination matrix cursor cases.
- **mismatch**: A relation whose cardinality or nullability differs from the entity, recorded as a mismatchedRelations entry.
- **narrow**: A field type narrower than its column, such as non-null where the entity is nullable, typed as NarrowedField.
- **negative**: Input value below zero, such as an offset or count in pagination, clamped to zero on encode.
- **paginate**: Verb for splitting results into pages of edges and cursors, such as the Paginated helper.
- **pagination**: Relay-style page state, the PageInfo and cursor connections that the GraphQL server returns.
- **payload**: The decoded object a cursor carries, which encode and decode round-trip in the utility tests.
- **quick**: A pagination matrix with only the none, first and last cases, built by the quick option.
- **relate**: Type wrapper naming a related entity class lazily, so circular imports between entities do not break.
- **relation**: A link between two entities in the GraphQL shape, whose cardinality and nullability must match the entity.
- **relay**: Pagination standard the server follows for its Connection, Edge and PageInfo types.
- **scalar**: Custom leaf type that reaches a web client as the string it travels as on the wire.
- **self**: The implementing class of a type, named Self in generics so a shape requires its own fields.
- **summarize**: Test helper that reduces a connection to edge count, page info and cursors for assertions.
- **tail**: The cursor of the last id in a list, the far end of a range in the pagination test helper.
- **upper**: Cursor built from the middle id in uppercase, a non-matching case in the pagination test matrix.
- **violation**: A rule breach found when a GraphQL field declaration disagrees with its entity relation or column.

<!-- coinagerie:end -->
