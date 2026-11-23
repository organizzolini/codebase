import { Module } from "@nestjs/common";

import { RenderModule } from "../../render.module";
import { RenderEdgesModule } from "../render-edges/render-edges.module";
import { RenderEntitiesModule } from "../render-entities/render-entities.module";
import { RenderNodesModule } from "../render-nodes/render-nodes.module";
import { RenderOptionsModule } from "../render-options/render-options.module";

import { RenderGraphDataCommand } from "./render-graph-data.command";

/**
 * Registers the `render-graph-data` command, which draws a `@Graph` entity as a
 * Mermaid flowchart, and the services its entity, option, edge, and render
 * steps are built from.
 */
@Module({
  controllers: [],
  exports: [RenderGraphDataCommand],
  imports: [
    RenderEdgesModule,
    RenderEntitiesModule,
    RenderNodesModule,
    RenderOptionsModule,
    RenderModule,
  ],
  providers: [RenderGraphDataCommand],
})
export class RenderGraphDataModule {}
