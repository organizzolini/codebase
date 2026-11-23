import { Module } from "@nestjs/common";

import { GraphTreeModule } from "../../../graph-tree/graph-tree.module";
import { RenderModule } from "../../render.module";
import { RenderEntitiesModule } from "../render-entities/render-entities.module";
import { RenderOptionsModule } from "../render-options/render-options.module";

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
    RenderEntitiesModule,
    RenderOptionsModule,
    RenderModule,
    GraphTreeModule,
  ],
  providers: [RenderTreeDataCommand],
})
export class RenderTreeDataModule {}
