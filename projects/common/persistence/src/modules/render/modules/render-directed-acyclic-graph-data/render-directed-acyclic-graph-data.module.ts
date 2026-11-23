import { Module } from "@nestjs/common";

import { GraphEdgesModule } from "../../../graph-edges/graph-edges.module";
import { GraphEntitiesModule } from "../../../graph-entities/graph-entities.module";
import { GraphOptionsModule } from "../../../graph-options/graph-options.module";
import { RenderModule } from "../../render.module";

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
    GraphEdgesModule,
    GraphEntitiesModule,
    GraphOptionsModule,
    RenderModule,
  ],
  providers: [RenderDirectedAcyclicGraphDataCommand],
})
export class RenderDirectedAcyclicGraphDataModule {}
