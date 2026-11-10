import { ConfigurationModule } from "@callidescope/configuration";
import {
  CallablesModule,
  ClassesModule,
  DocumentationModule,
  EdgesModule,
  EntriesModule,
  GraphModule,
  ProgramModule,
  SignaturesModule,
  WorkspaceModule,
} from "@callidescope/graph";
import {
  OutputJsonModule,
  OutputMarkdownModule,
  ProjectReportsModule,
  ReportModule,
} from "@callidescope/output";

/** Every analysis module, imported wholesale so any service's dependencies resolve without each test restating them. */
export const ANALYSIS_MODULES = [
  CallablesModule,
  ConfigurationModule,
  DocumentationModule,
  EdgesModule,
  EntriesModule,
  GraphModule,
  ClassesModule,
  OutputJsonModule,
  OutputMarkdownModule,
  ProgramModule,
  ProjectReportsModule,
  ReportModule,
  SignaturesModule,
  WorkspaceModule,
];
