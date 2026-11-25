---
name: write-nestjs
description: "NestJS conventions for this codebase: the module, service, constants, and types files, logger context, env validation, and registering a module. Use when adding or changing a NestJS module, service, command, or resolver, or when a dependency fails to inject."
license: MIT
---

# Write NestJS

The conventions every NestJS project here shares: the service and command libraries and CLIs of the IC suite, `compliance`, `integration`, the GraphQL APIs, and the database packages. Project `AGENTS.md` files say only what is specific to their project and link here for the rest.

**Scaffold, then fill in.** Generate the files with [conformetry-generate](../conformetry-generate/SKILL.md) rather than writing them by hand; the generator output is what `conformetry-validate` holds every module to.

```bash
nx g conformetry:nestjs-service-module --name=<domain>   # module, service, constants, types, unit test
nx g conformetry:nestjs-command-module --name=<domain>   # a nest-commander command beside them
nx g conformetry:nestjs-graphql-module --name=<domain>   # resolver, dataloader, entities, args; see references/graphql.md
```

## A Module's Files

Each domain is a folder `src/modules/<domain>/` holding one file per concern, named `<domain>.<concern>.ts`:

| File                      | Holds                                                                          |
| ------------------------- | ------------------------------------------------------------------------------ |
| `<domain>.module.ts`      | The `@Module`: providers, imports, exports, and a JSDoc line on what it owns   |
| `<domain>.service.ts`     | The domain logic, the only place it lives                                      |
| `<domain>.constants.ts`   | Regular expressions, enums, Zod schemas, static values: no inline magic values |
| `<domain>.types.ts`       | Types and interfaces scoped to this module                                     |
| `<domain>.<tier>.test.ts` | Tests beside the file, named per [write-tests](../write-tests/SKILL.md)        |

A class file holds its imports and the class, nothing else at top level: helper types go to `.types.ts`, constants to `.constants.ts`, and a type is imported from where it is declared, never re-exported through the class file. One service per module; when a service grows, split a sub-domain into its own module.

The module provides its service and exports it, so consumers can inject it, and imports `LoggerModule`:

```ts
/** Owns the lexeme lookup. */
@Module({
  controllers: [],
  exports: [LexemeService],
  imports: [LoggerModule],
  providers: [LexemeService],
})
export class LexemeModule {}
```

## A Service's Layout

Section comments keep a large service scannable ([write-comments](../write-comments/SKILL.md) has the emoji list), and every injected dependency is `private readonly`:

```ts
@Injectable()
export class LexemeService {
  // 🏗 Dependency Injection
  constructor(
    private readonly repository: LexemeRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(LexemeService.name);
  }

  // 🔐 Private Fields
  // 🔑 Public Fields
  // 🔏 Private Methods
  // 🌎 Public Methods
}
```

- **`setContext(Class.name)` in every constructor**, never a string literal: it is how a log line says where it came from.
- **`LoggerService` is the last constructor parameter**, after the domain and repository dependencies.
- **Private methods first**, and expose only what callers need.

## Logging

`LoggerService` and `LoggerModule` come from `@codebase/observability`, a pino-backed logger that prints JSON when `NODE_ENV=production` and readable lines otherwise. A project never defines its own: list `"@codebase/observability": "workspace:*"` in its `dependencies`. `LoggerService` is transient, so each class gets its own instance, which is why `setContext` belongs in the constructor. Log with `this.logger.error(message, trace, context)` and `info`, not `console`, except in a script with no container.

## Environment

Declare every environment variable once, as a Zod schema in the root module's constants file, and read it through `ConfigService`, never `process.env`. Add the variable to the project's `configuration/.env.default` too, or startup validation fails for the next person. A missing variable fails at boot with the schema's message, not at first use.

## Registering a Module

Import the new module in the project's root module, beside `ConfigModule.forRoot(...)` and `LoggerModule`:

```ts
@Module({
  imports: [ConfigModule.forRoot({ ... }), LoggerModule, LexemeModule],
})
export class MainModule {}
```

A command-line project's `<name>.main.ts` only calls `CommandFactory.run`, and a server's only calls `NestFactory.create`: no logic lives there. A library has neither, and exports its public surface from `src/index.ts` only.

## When Injection Fails

| Symptom                                      | Check                                                                                                                |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `Nest can't resolve dependencies of X`       | `X` is `@Injectable()`, the provider is in its module's `providers`, and that module is imported where `X` lives     |
| A dependency resolves in the app, not a test | The test gave `buildTestingModule` a `mocks` entry or `providers` for it, per [write-tests](../write-tests/SKILL.md) |
| Env validation fails on startup              | The variable is in the schema and in `configuration/.env.default`                                                    |
| A resolver is never called                   | It is in a module's `providers` and that module reaches the root module                                              |

## References

- [graphql.md](references/graphql.md) — resolvers, dataloaders, and Relay connections
- [write-typescript](../write-typescript/SKILL.md) — strict typing, naming, and error handling every module follows
- [write-tests](../write-tests/SKILL.md) — `buildTestingModule` and the module-wiring assertions
