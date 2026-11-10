## Start

```bash
nx run lexico-api:start
```

## Test

```bash
nx run lexico-api:vitest
```

## GraphQL types

The API's object types are its own, not lexico-db' TypeORM entities.
Each one, such as `LexemeType` in `src/modules/lexemes/lexeme.entities.ts`,
implements `GraphQLObjectOf<Entity, Self, DatabaseOnlyField, RelationField>`
from `src/lexico-api.types.ts`, which fails the typecheck when the type and its
entity drift apart:

- **Every entity field is declared or excluded by name.** A column only the
  database needs, such as `Translation.translationFullTextSearch`, is listed
  in the type's `*DatabaseOnlyField` union in the module's `*.types.ts`. A new
  column, or a dropped exclusion, fails until someone decides on it.
- **Every declared field has its column's type.** Retyping a column, or
  making a nullable one non-null in the API, fails.
- **Relations are retyped as GraphQL types.** The fields named in the type's
  `*RelationField` union are declared as GraphQL types, and must keep the
  entity relation's cardinality and nullability.

Resolvers never return an entity. Each module's `*.utilities.ts` maps an
entity to its type, such as `toLexemeType`, copying only the fields the type
declares; a relation the query did not join stays unset. The `Form` and
`Inflection` interfaces resolve by the class a row is mapped to, so their
object types are registered as `ORPHANED_GRAPHQL_TYPES` in
`src/modules/lexemes/lexemes.constants.ts`.

## 👔 Conformetry

This project was generated from the [nestjs-graphql-application](../../../configuration/conformetry-templates/nestjs-graphql-application) conformetry template.
