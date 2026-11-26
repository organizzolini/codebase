# GraphQL Modules

`nx g conformetry:nestjs-graphql-module --name=<domain>` generates a resolver, a service, a dataloader, entities, and argument types beside the files in [SKILL.md](../SKILL.md). Register the module in the API's root module after `GraphQLModule.forRoot(...)`, then fill in the generated files.

## Resolver

Section comments keep a resolver scannable. Inject the loaders and the service; keep queries thin and put the logic in the service:

```ts
@Resolver(() => Lexeme)
export class LexemeResolver {
  // 🏗 Dependency Injection
  constructor(
    private readonly lexemeLoader: LexemeLoader,
    private readonly lexemeService: LexemeService,
  ) {}

  // 🔎 Queries
  @Query(() => LexemeConnection)
  async lexemes(@Args() args: FindLexemesArgs): Promise<LexemeConnection> {
    return this.lexemeService.findAll(args);
  }

  // 🖋️ Mutations
  // 🔗 Relations
}
```

## One Batch per Relation (DataLoader)

Resolve every relation field through a dataloader, so a list of 100 parents makes one query for their children instead of 100:

```ts
@ResolveField(() => Author)
async author(@Parent() lexeme: Lexeme): Promise<Author | null> {
  return this.authorLoader.byId.load(lexeme.authorId);
}
```

Loading a related entity inside a field resolver without batching is the N+1 problem, and a review will flag it.

## Lists Are Relay Connections

Every list query returns a Relay connection. `@codebase/interface` provides the pieces: `Paginated` and `createEdgeType` build a node's connection and edge object types, and `createConnection`, `createEdge`, and `mapConnection` build and map the page, with opaque cursors (`toCursor`, `fromCursor`). Its [README](../../../../projects/common/interface/README.md#graphql-server) lists them all, and `@codebase/interface/testing` has the oracle for checking a SQL-backed page.

## When the Schema Will Not Generate

Check that `autoSchemaFile` in `GraphQLModule.forRoot` is the API's `GRAPHQL_SCHEMA_FILE` constant, and that every type carries `@ObjectType()` and its fields `@Field()`. The APIs set `playground: false`; explore a schema through an introspection query or the emitted schema file.
