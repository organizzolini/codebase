import { Module } from "@nestjs/common";

import { RenderModule } from "../../render.module";
import { RenderEntitiesModule } from "../render-entities/render-entities.module";
import { RenderNodesModule } from "../render-nodes/render-nodes.module";
import { RenderOptionsModule } from "../render-options/render-options.module";

import { RenderTreeDataCommand } from "./render-tree-data.command";
import { RenderTreeDataService } from "./render-tree-data.service";

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
    RenderNodesModule,
    RenderOptionsModule,
    RenderModule,
  ],
  providers: [RenderTreeDataCommand, RenderTreeDataService],
})
export class RenderTreeDataModule {}
