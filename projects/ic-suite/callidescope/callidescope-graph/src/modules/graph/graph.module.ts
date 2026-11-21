import { Module } from "@nestjs/common";

import { DocumentationModule } from "../documentation/documentation.module";
import { EdgesModule } from "../edges/edges.module";
import { SignaturesModule } from "../signatures/signatures.module";

import { GraphAssemblyService } from "./graph-assembly.service";
import { GraphService } from "./graph.service";
import { AddressDepthService } from "./modules/measurement/address-depth.service";
import { BreadthService } from "./modules/measurement/breadth.service";
import { GraphDepthService } from "./modules/measurement/graph-depth.service";
import { ComponentsService } from "./modules/traversal/components.service";
import { PathsService } from "./modules/traversal/paths.service";

/**
 * Provides graph assembly, cycle condensation, and depth and breadth measurement.
 */
@Module({
  controllers: [],
  exports: [
    BreadthService,
    AddressDepthService,
    ComponentsService,
    GraphDepthService,
    GraphAssemblyService,
    GraphService,
    PathsService,
  ],
  imports: [DocumentationModule, EdgesModule, SignaturesModule],
  providers: [
    BreadthService,
    AddressDepthService,
    ComponentsService,
    GraphDepthService,
    GraphAssemblyService,
    GraphService,
    PathsService,
  ],
})
export class GraphModule {}
