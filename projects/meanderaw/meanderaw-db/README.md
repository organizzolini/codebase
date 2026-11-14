# 🏺 Meanderaw Database

**The meander's shape.** The Postgres schema for
[meanderaw-cli](../meanderaw-cli/README.md) and the apps that read the meanders: the TypeORM
entity for a meander row, and the migrations that build its table.

The `meanders` table is built by migration, never by synchronizing. Run
`nx run meanderaw-db:migration:run` before the first draw run, and again whenever a new
migration lands.
