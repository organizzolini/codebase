import { GraphModule, SignaturesModule } from "@callidescope/graph";

import { OutputJsonModule } from "../src/modules/output-json/output-json.module";
import { OutputMarkdownModule } from "../src/modules/output-markdown/output-markdown.module";
import { ProjectReportsModule } from "../src/modules/project-reports/project-reports.module";
import { ReportModule } from "../src/modules/report/report.module";

/** Every output module, imported wholesale so any service's dependencies resolve without each test restating them. */
export const ANALYSIS_MODULES = [
  GraphModule,
  OutputJsonModule,
  OutputMarkdownModule,
  ProjectReportsModule,
  ReportModule,
  SignaturesModule,
];
