# persistence

**Type**: NestJS library package (`@codebase/persistence`) and nest-commander
command line (`postgresql-export`, `postgresql-import`, `typeorm-migration-sql`,
and the drawing commands `render-tree-data`,
`render-directed-acyclic-graph-data`, and `render-graph-data`)

**Purpose**: Three jobs. The library is the one way a database-backed project
connects to Postgres: the `<PROJECT>_POSTGRES_*` environment fragment, the
TypeORM options factory, the NestJS module and command-line data source built
from it, and the naming convention behind them. The command line moves
selected tables between databases through `pg_dump` and `pg_restore`, each
database named by a URI. See the [README](README.md) for the exports, the
naming table, and every command-line option. The third job is drawing: the
drawing commands read a `@Tree` entity, or a `@DirectedAcyclicGraph` or `@Graph` entity's edge
rows, and print them as a Mermaid flowchart on stdout or write them to files.
The README's [Drawing diagrams](README.md#drawing-diagrams) section documents
their options, decorators, and output streams.

This package may import one workspace package, `@codebase/observability`, for its
command line's logger, and never any other, or every database-backed project
inherits that edge. Logging has no workspace dependencies, so the edge makes
no cycle, and lexico-cli, lexico-api, meanderaw-cli, and caelundas-cli
already depend on it; lexico-db gains it only transitively.

- **ORM**: TypeORM against Postgres 18, with `typeorm-naming-strategies`' snake case
- **Env validation**: `zod`, as a fragment each application spreads into its own schema
- **Language**: Strict TypeScript

```text
src/
  index.ts                          # Public API, the library only
  persistence.main.ts               # The command line's entry point
  persistence.module.ts             # MainModule: the command line's root, not PostgresqlModule
  persistence.repl.ts               # NestJS REPL over MainModule
  modules/
    postgresql/
      postgresql.constants.ts         # Variable suffixes and connection defaults
      postgresql.module.ts            # PostgresqlModule.forRoot over TypeOrmModule.forRootAsync
      postgresql.service.ts           # The TypeORM options factory forRoot hands TypeORM
      postgresql.types.ts
      postgresql.utilities.ts         # postgresEnvironmentSchema, postgresDataSourceOptions, createDataSource, variable names
      modules/base-entities/        # identifiable → creatable → updatable → deletable
      postgresql-container.*.ts       # startPostgresContainer, the testing entry's harness
    postgresql-export/              # The postgresql-export command: options, plan, dry run, atomic write
    postgresql-import/              # The postgresql-import command: options, plan, --clean (no prompt), dry run
    postgresql-utilities/           # pg_dump, pg_restore, and truncate behind one service
    render/                         # RenderService: connects, reads, draws, and writes for every drawing command
      modules/render-command/       # RenderCommand: the flags and run flow every drawing command shares
      modules/render-entities/      # @DirectedAcyclicGraph, @Graph (two forms), the endpoint and reverse-relation decorators, the generated edge entity; globs to entity classes; the @Tree pick
      modules/render-options/       # Options every drawing command shares: connection, filter, sort, paging, caps, outputs
      modules/render-edges/         # Reads an edge table, finds roots and cycles, then pages and caps the edges
      modules/render-nodes/         # Reads the labels of only the drawn nodes and owners, and relabels them through the edge's relations
      modules/render-mermaid/       # Pure renderer: a graph model to Mermaid text, with its limit warnings
      modules/render-trees/         # Reads a @Tree table in its storage, then filters, sorts, pages, and caps it
      modules/render-tree-data/     # The render-tree-data command: draws a @Tree entity
      modules/render-directed-acyclic-graph-data/      # The render-directed-acyclic-graph-data command: refuses a @Graph entity
      modules/render-graph-data/    # The render-graph-data command: refuses a @DirectedAcyclicGraph entity
    typeorm-migration-sql/          # The typeorm-migration-sql command: check or write each migration's SQL
testing/
  index.ts                          # The @codebase/persistence/testing entry
  persistence-testing.*.ts          # startDatabaseTestingModule, the entry's Nest helper
  command-line-runner.ts            # runCliCommandLine: argv through the real nest-commander runner
  fixture-persistence.ts            # A migrated container for the command line's integration tests
  fixtures/                         # Entities, modules, and the widgets and parts migrations
  fixtures/graphs/, fixtures/trees/ # @DirectedAcyclicGraph and @Graph edge entities (graphs/generated/ for the generated form), and @Tree entities, for the drawing commands
  setup.ts, mocks.ts                # Vitest setup and mocks
```

## Rules this package holds

- **Never read an unprefixed `POSTGRES_*` variable.** They are the shared
  container's admin login, loaded by Nx into every task.
- **Never let `synchronize` be configured on.** The schema changes only
  through reviewed migrations, which Postgres runs as their own step.
- **Never name a schema in code.** It comes from `<PROJECT>_POSTGRES_SCHEMA`.
- **Never run migrations from `PostgresqlModule.forRoot`.** It takes none;
  `createDataSource` and `startPostgresContainer` do.
- **Keep Postgres testing helpers with this package.** Export them through
  `@codebase/persistence/testing`; they may use this package's own database
  APIs but must not depend on `@codebase/testing`.
- **Never name a real project in this package's tests.** Use `fixture`, and
  `sample` where a second is needed.
- **Keep the command line connectionless.** `MainModule` holds no
  `PostgresqlModule`, TypeORM, or `ConfigModule`, so it needs no
  `<PROJECT>_POSTGRES_*` variable and opens no connection at startup. Never
  export `MainModule` from `src/index.ts` or `testing/index.ts`.
- **Pass credentials to client tools only through `PG*` environment
  variables,** never argv, and mask every URI and password that reaches a log
  line or an error.
- **Never import GraphQL into the base entities.** Meanderaw and caelundas
  must not depend on it; lexico layers its `@Field` decorators on top.
- **Draw a diagram only through `RenderService`.** It writes the diagram to
  stdout, or to the files named, and the warnings to stderr. Never send the
  diagram through the logger.
- **Give a shared drawing flag its help text once,** in
  `render-options.constants.ts`, so a flag reads the same in every drawing
  command.
- **Check a drawing command's entity kind before connecting.** A `@DirectedAcyclicGraph` command
  refuses a `@Graph` entity, and the reverse, naming the other command.

### Drawing internals

- **Entity columns:** TypeORM's `filterColumns` matches one class exactly, so
  `entityColumnNames` asks each class up the inheritance chain in turn.
- **Filters:** `=`, `!=`, and `~=` compare a column's text, so a NULL matches
  only `!=`. `~=` wraps its value in wildcards, with the value's own wildcards
  escaped.
- **Tree caps:** a node past `--truncate-depth` hides all its children, and one past
  `--truncate-breadth` keeps its first children in row order. Each hidden group is
  drawn as one "… K more" truncation node under its parent and warned about.
  Nodes no root reaches, such as a cycle, stay as drawn.
- **Graph trees:** a node entity whose generated `@Graph` edge joins its own rows
  (`@Graph({ edge, nodes: () => Itself })`) is also a `render-tree-data` pick, the way
  a `@Tree` is, for a tree whose nodes may have several parents. `treeTable` reads its
  edge table: a row's `parentId` is its lowest parent id and `otherParentIds` the rest
  (`GraphTreeRow`), so the level-by-level read still finds every row by one parent and
  `buildTreeGraph`, the match walks, paging and the caps follow all of them. A node with
  two parents is one node with two edges in the flowchart, and the file tree lists it under
  each parent (a walk ends at a node it is already inside of, so a cycle cannot loop).
- **Tree matches:** the ancestor and descendant walks each join a row once, so a
  cycle ends them instead of looping.
- **Mermaid:** `renderGraphMermaid` draws short node ids, escaped labels, and
  styled roots and truncation nodes.
- **File tree:** `--diagram filetree` (`render-tree-data` only; the plan's
  `diagram` defaults to `flowchart`) makes `RenderMermaidService` call
  `renderGraphFileTree`, Mermaid's beta `treeView-beta` (needs Mermaid 11.14 or
  later; Obsidian may not render it). It nests children under roots by edge
  order, quotes labels, and marks a node with children with a trailing `/`
  inside the quotes. It ignores edge labels, weights, markers, and direction,
  and warns only on the 50,000-character limit, not the 500-edge flowchart one.
  The grammar has no quote escape, so a label holding `"` uses single quotes.
- **Neighborhoods:** with two or more weakly connected groups of nodes (edges
  read as undirected), `renderGraphMermaid` wraps each in `subgraph nb<N>`,
  titled by the label all its edges share (then drawn without it), else its
  first root's or first node's label. One neighborhood draws unchanged, and the
  `GraphModel` never carries them.
- **Checks before connecting:** column names and the `@Tree` pick are read from
  decorators first, so a bad flag or pick never reaches the database.
- **Two forms of one decorator:** `@Graph()` and `@DirectedAcyclicGraph()` mark
  either a hand-written edge entity (with `@GraphSource` and `@GraphTarget`), or,
  with `edge` and `nodes` options, the graph entity, which generates the edge
  entity. `generateEdgeEntity` registers a nameless class, its table, key
  columns, cascading relations and indexes with TypeORM's metadata storage when
  the decorator runs; the class is reachable only through
  `generatedEdgeOf` and `withGeneratedEdges`; `postgresDataSourceOptions` applies
  them to its `entities` (`generatedEntitiesOf`), so a project lists only the
  graph entity. A graph entity is a pick candidate, but the
  command reads the generated class, so `--filter` and `--sort` name its columns.
  The generated edge has no owner column, since not every graph has
  subgraphs, only the source and target columns, which default to `sourceNode`
  and `targetNode` (`source_node`, `target_node`); the `sourceColumn` and
  `targetColumn` options rename them. A graph with subgraphs writes its edge
  entity by hand, with an owner column and relations of its own.
- **Labels:** `RenderCommand` calls `RenderNodesService.relabel` after
  `RenderEdgesService` has paged and capped the edges, so node labels and neighborhood titles are read for
  only the nodes drawn. `relabel` reads the entities the edge's relations join:
  the source column's labels each node, and the `@GraphLabel` column's titles
  each neighborhood.
- **Reverse relations** register by the generated entity's name, since its class
  does not exist when a node entity is defined, so a data source that builds the
  node entity must also build the declaring entity.

`postgresql-import --clean` never prompts and has no `--yes`; the preview is
`postgresql-import --dry-run`, which names what `--clean` would drop or truncate. Run it
first.

The `start` configurations run the command line with the working directory at
`projects/common/persistence`, so the drawing commands' `--entities` globs and
output paths resolve from there. Both commands need the PostgreSQL 18 client tools; see
the README's [Moving data between databases](README.md#moving-data-between-databases).

`typeorm-migration-sql` extracts the SQL of each TypeORM migration into the
`-up.sql` and `-down.sql` files beside it. Its `check` mode (the default) reports
drift, comparing normalized SQL because the committed files are lint-fixed and
formatted, and `write` rewrites the files. It imports nothing from `integration`, so it adds no
edge to the CI plumbing.
