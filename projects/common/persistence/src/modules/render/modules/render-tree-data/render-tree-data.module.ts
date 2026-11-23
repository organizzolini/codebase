import { Module } from "@nestjs/common";

import { GraphEntitiesModule } from "../../../graph-entities/graph-entities.module";
import { GraphOptionsModule } from "../../../graph-options/graph-options.module";
import { GraphTreeModule } from "../../../graph-tree/graph-tree.module";
import { RenderModule } from "../../render.module";

import { RenderTreeDataCommand } from "./render-tree-data.command";

/**
 * Registers the `render-tree-data` command, which draws a `@Tree` entity as a
 * Mermaid flowchart, and the services its entity, option, tree, and render
 * steps are built from.
 */
@Module({
  controllers: [],
  exports: [RenderTreeDataCommand],
  imports: [
    GraphEntitiesModule,
    GraphOptionsModule,
    RenderModule,
    GraphTreeModule,
  ],
  providers: [RenderTreeDataCommand],
})
export class RenderTreeDataModule {}
