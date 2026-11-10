import { CallablesModule } from "../src/modules/callables/callables.module";
import { ClassesModule } from "../src/modules/classes/classes.module";
import { DocumentationModule } from "../src/modules/documentation/documentation.module";
import { EdgesModule } from "../src/modules/edges/edges.module";
import { EntriesModule } from "../src/modules/entries/entries.module";
import { GraphModule } from "../src/modules/graph/graph.module";
import { ProgramModule } from "../src/modules/program/program.module";
import { SignaturesModule } from "../src/modules/signatures/signatures.module";
import { WorkspaceModule } from "../src/modules/workspace/workspace.module";

/** Every analysis module, imported wholesale so any service's dependencies resolve without each test restating them. */
export const ANALYSIS_MODULES = [
  CallablesModule,
  DocumentationModule,
  EdgesModule,
  EntriesModule,
  GraphModule,
  ClassesModule,
  ProgramModule,
  SignaturesModule,
  WorkspaceModule,
];
