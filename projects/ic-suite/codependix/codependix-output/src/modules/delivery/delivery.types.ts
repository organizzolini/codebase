// 🏷️ Types

import type { ResolvedCodependixGraphOutput } from "@codependix/configuration";
import type {
  CodependixRunMode,
  MarkdownSectionArguments,
} from "@codependix/core";

/** Arguments shared by every method that delivers one file destination. */
export interface DeliverFileArguments {
  absoluteRoot: string;
  content: string;
  mode: CodependixRunMode;
  relativePath: string;
}

/** Caller-rendered JSON and Markdown, made only when the target needs them. */
export interface DeliverGraphOutputArguments {
  jsonContent: string | undefined;
  markdownContent: string | undefined;
  /**
   * The heading used to auto-create a missing anchor's section on write.
   * `undefined` for a standalone Markdown destination, which has no section.
   */
  markdownSection: MarkdownSectionArguments | undefined;
  mode: CodependixRunMode;
  project: DeliveryProject;
  resolvedOutput: ResolvedCodependixGraphOutput;
}

/** The project (or workspace) a graph export is delivered relative to. */
export interface DeliveryProject {
  absoluteRoot: string;
  name: string;
}
