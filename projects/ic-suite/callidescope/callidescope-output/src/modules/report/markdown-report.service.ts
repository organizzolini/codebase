import { Injectable } from "@nestjs/common";

import { MermaidReportService } from "./mermaid-report.service";
import {
  MARKDOWN_DEEP_STACKS_HEADING,
  MARKDOWN_PROJECT_LIMIT_NAMES,
  MARKDOWN_PROJECT_LIMITS_HEADER,
  MARKDOWN_PROJECT_LIMITS_HEADING,
  MARKDOWN_PROJECT_LIMITS_SUMMARY,
  MARKDOWN_SUMMARY_HEADER,
  MARKDOWN_WIDE_CALLABLES_HEADER,
  MARKDOWN_WIDE_CALLABLES_HEADING,
  NO_LIMIT_LABEL,
} from "./report.constants";
import { ReportService } from "./report.service";
import { WorkspaceReportService } from "./workspace-report.service";

import type {
  RenderFindingsArguments,
  RenderProjectSectionArguments,
  RenderRunArguments,
  RenderStacksArguments,
  StackRendering,
} from "./report.types";
import type { ProjectLimits } from "@callidescope/configuration";
import type {
  CallableBreadthReport,
  CallGraphSummary,
  CallStack,
  WideCallableFinding,
} from "@callidescope/core";

/**
 * Renders a run, or one project's slice of it, as markdown.
 *
 * Markdown rather than a bespoke text format because the same rendering has to
 * serve three places — a terminal, a report file, and a section spliced into a
 * project's own README — and only one of those can read anything else.
 */
@Injectable()
export class MarkdownReportService {
  // 🏗 Dependency Injection

  constructor(
    private readonly mermaidReportService: MermaidReportService,
    private readonly reportService: ReportService,
    private readonly workspaceReportService: WorkspaceReportService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Renders each callable's breadth, the first few openly and the rest behind a disclosure, shared
   * by project and run sections.
   */
  private renderCallableBreadths(args: {
    previewCount: number;
    reports: readonly CallableBreadthReport[];
  }): string {
    const toRow = (report: CallableBreadthReport): string =>
      `| \`${report.displayName}\` | ${String(report.breadth)} | ${report.callees.map((callee) => `\`${callee.displayName}\``).join(", ")} | \`${report.location.filePath}:${String(report.location.line)}\` |`;
    const preview = args.reports.slice(0, args.previewCount);
    const remaining = args.reports.slice(args.previewCount);
    const previewTable = this.renderTable({
      header: MARKDOWN_WIDE_CALLABLES_HEADER,
      rows: preview.map((report) => toRow(report)),
    });

    if (remaining.length === 0) {
      return previewTable;
    }

    return [
      previewTable,
      "",
      "<details>",
      `<summary>${String(remaining.length)} more callables</summary>`,
      "",
      this.renderTable({
        header: MARKDOWN_WIDE_CALLABLES_HEADER,
        rows: remaining.map((report) => toRow(report)),
      }),
      "",
      "</details>",
    ].join("\n");
  }

  /**
   * Renders one limit's value cell, printing `none` for an undeclared limit rather than a number
   * that implies a gate.
   */
  private renderLimitCell(value: number | undefined): string {
    return value === undefined ? NO_LIMIT_LABEL : String(value);
  }

  /**
   * Renders the two limits one project is judged against, since a limit is a fact about that
   * project alone.
   */
  private renderProjectLimits(limits: ProjectLimits): string {
    return [
      MARKDOWN_PROJECT_LIMITS_HEADER,
      ...MARKDOWN_PROJECT_LIMIT_NAMES.map(
        (name) => `| \`${name}\` | ${this.renderLimitCell(limits[name])} |`,
      ),
    ].join("\n");
  }

  /** Renders one stack: a labelled heading line and its tree in a fence. */
  private renderStack(args: { index: number; stack: CallStack }): string {
    const { stack } = args;
    const entry = stack.frames[0]?.displayName ?? "unknown";
    const depth = stack.isLowerBound
      ? `≥ ${String(stack.depth)}`
      : String(stack.depth);

    return [
      `**${String(args.index + 1)}. \`${entry}\`** — depth ${depth} · ${stack.entryPointKind}`,
      "",
      "```text",
      this.reportService.renderStackTree(stack),
      "```",
    ].join("\n");
  }

  /** Renders the stacks of one scope, drawn or printed as asked. */
  private renderStacksAs(args: {
    previewCount: number;
    rendering: StackRendering;
    stacks: readonly CallStack[];
  }): string {
    return args.rendering === "diagram"
      ? this.mermaidReportService.renderStacks({ stacks: args.stacks })
      : this.renderStacks({
          previewCount: args.previewCount,
          stacks: args.stacks,
        });
  }

  /** Renders the counts describing what a run, or a project, produced. */
  private renderSummaryTable(summary: CallGraphSummary): string {
    return [
      MARKDOWN_SUMMARY_HEADER,
      `| Callables | ${String(summary.callableCount)} |`,
      `| Files | ${String(summary.fileCount)} |`,
      `| Calls traced | ${String(summary.edgeCount)} |`,
      `| Call stacks | ${String(summary.entryPointCount)} |`,
      `| Deepest stack | ${String(summary.maximumDepth)} |`,
      `| Stacks through recursion | ${String(summary.cyclicComponentCount)} |`,
      `| Unfollowable calls | ${String(summary.unresolvedCallCount)} |`,
    ].join("\n");
  }

  /** Renders a table, or says plainly that there was nothing to put in one. */
  private renderTable(args: {
    header: string;
    rows: readonly string[];
  }): string {
    return args.rows.length === 0
      ? "None."
      : `${args.header}\n${args.rows.join("\n")}`;
  }

  /**
   * Names each callable that broke its breadth limit, one line each, printing the project's `limit`
   * beside it.
   */
  private renderWideCallableLines(
    findings: readonly WideCallableFinding[],
  ): string {
    if (findings.length === 0) {
      return "None.";
    }

    return findings
      .map(
        (finding) =>
          `- \`${finding.displayName}\` — ${String(finding.breadth)} direct callees, limit ${String(finding.limit)} (${finding.location.filePath})`,
      )
      .join("\n");
  }

  /**
   * The heading prefix one level below the block's own, so a spliced block stays a well-formed
   * subtree.
   */
  private subsectionPrefix(heading: string): string {
    return "#".repeat((/^#+/.exec(heading)?.[0].length ?? 1) + 1);
  }

  // 🌎 Public Methods

  /**
   * Renders the two findings a gate weighs, and nothing else, so a failed pipeline shows why it
   * decided.
   */
  public renderFindings(args: RenderFindingsArguments): string {
    const { deepStacks, wideCallables } = args;

    return [
      `## ${MARKDOWN_DEEP_STACKS_HEADING} (${String(deepStacks.length)})`,
      "",
      this.renderStacks({
        previewCount: args.previewCount,
        stacks: deepStacks,
      }),
      "",
      `## ${MARKDOWN_WIDE_CALLABLES_HEADING} (${String(wideCallables.length)})`,
      "",
      this.renderWideCallableLines(wideCallables),
    ].join("\n");
  }

  /** Renders one project's section, for splicing into its own README. */
  public renderProjectSection(args: RenderProjectSectionArguments): string {
    const { report } = args;

    return [
      args.heading,
      "",
      `Call stacks traced through \`${report.projectName}\`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.`,
      "",
      this.renderSummaryTable(report.summary),
      "",
      `### ${MARKDOWN_PROJECT_LIMITS_HEADING}`,
      "",
      MARKDOWN_PROJECT_LIMITS_SUMMARY,
      "",
      this.renderProjectLimits(
        this.workspaceReportService.limitsFor({
          limits: args.limits,
          projectName: report.projectName,
        }),
      ),
      "",
      "### Call stacks (depth)",
      "",
      this.renderStacksAs({
        previewCount: args.previewCount,
        rendering: args.rendering,
        stacks: report.stacks,
      }),
      "",
      "### Breadth",
      "",
      this.renderCallableBreadths({
        previewCount: args.previewCount,
        reports: report.callableBreadths,
      }),
    ].join("\n");
  }

  /**
   * Renders a whole run, for a terminal or a report file. Opens with the summary, the project index,
   * and the headroom.
   */
  public renderRun(args: RenderRunArguments): string {
    const { result } = args;
    const subsection = this.subsectionPrefix(args.heading);
    const rows = this.workspaceReportService.buildRows({
      limits: args.limits,
      projects: result.projects,
    });

    return [
      args.heading,
      "",
      ...(args.description === undefined ? [] : [args.description, ""]),
      this.renderSummaryTable(result.summary),
      "",
      `${subsection} Projects`,
      "",
      this.workspaceReportService.renderProjectIndex({
        limits: args.limits,
        projects: result.projects,
      }),
      "",
      `${subsection} Depth headroom`,
      "",
      this.workspaceReportService.renderHeadroom(rows),
      "",
      `${subsection} ${MARKDOWN_DEEP_STACKS_HEADING} (${String(result.deepStacks.length)})`,
      "",
      this.renderStacksAs({
        previewCount: args.previewCount,
        rendering: args.rendering,
        stacks: result.deepStacks,
      }),
      "",
      `${subsection} ${MARKDOWN_WIDE_CALLABLES_HEADING} (${String(result.wideCallables.length)})`,
      "",
      this.renderCallableBreadths({
        previewCount: args.previewCount,
        reports: result.wideCallables,
      }),
      "",
    ].join("\n");
  }

  /**
   * Renders every stack, the first few openly and the rest behind a disclosure, so a large package
   * stays complete.
   */
  public renderStacks(args: RenderStacksArguments): string {
    if (args.stacks.length === 0) {
      return "None.";
    }

    const rendered = args.stacks.map((stack, index) =>
      this.renderStack({ index, stack }),
    );
    const preview = rendered.slice(0, args.previewCount).join("\n\n");
    const remaining = rendered.slice(args.previewCount);

    if (remaining.length === 0) {
      return preview;
    }

    return [
      preview,
      "",
      "<details>",
      `<summary>${String(remaining.length)} more call stacks</summary>`,
      "",
      remaining.join("\n\n"),
      "",
      "</details>",
    ].join("\n");
  }
}
