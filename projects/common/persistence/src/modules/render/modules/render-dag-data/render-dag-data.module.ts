import { Module } from "@nestjs/common";

import { GraphDagModule } from "../../../graph-dag/graph-dag.module";
import { GraphEntitiesModule } from "../../../graph-entities/graph-entities.module";
import { GraphOptionsModule } from "../../../graph-options/graph-options.module";
import { RenderModule } from "../../render.module";

import { RenderDagDataCommand } from "./render-dag-data.command";

/**
 * Registers the `render-dag-data` command, which draws a `@Dag` entity as a
 * Mermaid flowchart, and the services its entity, option, edge, and render
 * steps are built from.
 */
@Module({
  controllers: [],
  exports: [RenderDagDataCommand],
  imports: [
    GraphDagModule,
    GraphEntitiesModule,
    GraphOptionsModule,
    RenderModule,
  ],
  providers: [RenderDagDataCommand],
})
export class RenderDagDataModule {}
