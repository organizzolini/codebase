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

/** Every analysis module, imported so service dependencies resolve in tests. */
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
