import { Module } from "@nestjs/common";

import { RenderModule } from "../../render.module";
import { RenderEntitiesModule } from "../render-entities/render-entities.module";
import { RenderNodesModule } from "../render-nodes/render-nodes.module";
import { RenderOptionsModule } from "../render-options/render-options.module";
import { RenderTreesModule } from "../render-trees/render-trees.module";

import { RenderTreeDataCommand } from "./render-tree-data.command";

/**
 * Registers the `render-tree-data` command, which draws a `@Tree` entity as a
 * Mermaid flowchart, and the modules its entity, option, tree, and render
 * steps are built from.
 */
@Module({
  controllers: [],
  exports: [RenderTreeDataCommand],
  imports: [
    RenderEntitiesModule,
    RenderNodesModule,
    RenderOptionsModule,
    RenderTreesModule,
    RenderModule,
  ],
  providers: [RenderTreeDataCommand],
})
export class RenderTreeDataModule {}
