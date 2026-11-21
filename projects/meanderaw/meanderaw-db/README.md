# 🏺 Meanderaw Database

**The meander's shape.** The Postgres schema for
[meanderaw-cli](../meanderaw-cli/README.md) and the apps that read the meanders: the TypeORM
entities for a meander row, the catalog of characteristics, and the bridge between them,
and the migrations that build their tables.

The tables are built by migration, never by synchronizing. Run
`nx run meanderaw-db:migration:run` before the first draw run, and again whenever a new
migration lands.
