import { Module } from "@nestjs/common";

import { RenderModule } from "../../render.module";
import { RenderEdgesModule } from "../render-edges/render-edges.module";
import { RenderEntitiesModule } from "../render-entities/render-entities.module";
import { RenderNodesModule } from "../render-nodes/render-nodes.module";
import { RenderOptionsModule } from "../render-options/render-options.module";

import { RenderDirectedAcyclicGraphDataCommand } from "./render-directed-acyclic-graph-data.command";

/**
 * Registers the `render-directed-acyclic-graph-data` command, which draws a `@DirectedAcyclicGraph` entity as a
 * Mermaid flowchart, and the services its entity, option, edge, and render
 * steps are built from.
 */
@Module({
  controllers: [],
  exports: [RenderDirectedAcyclicGraphDataCommand],
  imports: [
    RenderEdgesModule,
    RenderEntitiesModule,
    RenderNodesModule,
    RenderOptionsModule,
    RenderModule,
  ],
  providers: [RenderDirectedAcyclicGraphDataCommand],
})
export class RenderDirectedAcyclicGraphDataModule {}
