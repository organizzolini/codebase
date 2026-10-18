import { Module } from "@nestjs/common";

import { PostgresqlModule } from "../../src/modules/postgresql/postgresql.module";

import { Widget } from "./widget.entity";

/**
 * A project's own database module, of the kind every feature module imports:
 * it connects through `PostgresqlModule.forRoot` and re-exports it.
 */
@Module({
  exports: [PostgresqlModule],
  imports: [
    PostgresqlModule.forRoot({ entities: [Widget], project: "fixture" }),
  ],
})
export class FixtureDatabaseModule {}
