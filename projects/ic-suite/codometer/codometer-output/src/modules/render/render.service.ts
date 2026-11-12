import { Injectable } from "@nestjs/common";

import { HEADING, TABLE_HEADER } from "./render.constants";
import { formatDelta, formatValue, hasChanged } from "./render.utilities";

import type { MetricRow, ProjectFailure } from "../changes/changes.types";
import type { RenderSectionArguments } from "./render.types";

/** Renders codometer's measured changes as the body of the report. */
@Injectable()
export class RenderService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Groups items by whatever project name a case picks out of each one. */
  private groupByProject<Item>(
    items: readonly Item[],
    readProject: (item: Item) => string,
  ): Map<string, Item[]> {
    const groups = new Map<string, Item[]>();

    for (const item of items) {
      const project = readProject(item);
      const existing = groups.get(project);
      if (existing === undefined) groups.set(project, [item]);
      else existing.push(item);
    }

    return groups;
  }

  /**
   * Whether a project's block opens expanded. Only a breach or a failure opens it; a metric that merely changed stays collapsed.
   */
  private readIsOpen(
    rows: readonly MetricRow[],
    failures: readonly ProjectFailure[],
  ): boolean {
    return failures.length > 0 || rows.some((row) => row.breach !== undefined);
  }

  /** Every project name either a row or a failure mentions, in sorted order. */
  private readProjects(args: RenderSectionArguments): string[] {
    const projects = new Set([
      ...args.rows.map((row) => row.project),
      ...args.failures.map((failure) => failure.project),
    ]);
    return [...projects].toSorted();
  }

  /**
   * Picks the icon for one row: removed outranks empty, which outranks a breach, which outranks plain growth.
   */
  private readStatus(row: MetricRow): string {
    if (row.removed) return "🗑️";
    if (row.empty) return "⁉️";
    if (row.breach !== undefined) return row.breach === "warn" ? "❗" : "❌";
    if (row.baseValue === undefined) return "🆕";
    return row.value > row.baseValue ? "📈" : "📉";
  }

  /** Names the run the baseline came from, when there was one to compare against. */
  private renderComparison(baselineUrl: string | undefined): string[] {
    if (baselineUrl === undefined) return [];
    return [`_Compared against [\`main\`](${baselineUrl})._`, ""];
  }

  /**
   * Names what the run could not do, above the table. A failed target has no row, so this is the only place it appears.
   */
  private renderFailures(failures: readonly ProjectFailure[]): string[] {
    if (failures.length === 0) return [];

    return [
      "> [!CAUTION]",
      `> **could not be measured:**`,
      ">",
      "> | Subject | Why |",
      "> |---------|-----|",
      ...failures.map(
        (failure) => `> | ${failure.subject} | ${failure.reason} |`,
      ),
      "",
    ];
  }

  /** Renders one project's block, or nothing if it has nothing to show. */
  private renderProject(
    project: string,
    rows: readonly MetricRow[],
    failures: readonly ProjectFailure[],
  ): string[] {
    const changed = rows.filter((row) => hasChanged(row));
    if (changed.length === 0 && failures.length === 0) return [];

    const open = this.readIsOpen(changed, failures) ? " open" : "";
    const summary =
      changed.length === 0
        ? `\`${project}\``
        : `\`${project}\` — ${changed.length} changed`;

    return [
      `<details${open}>`,
      `<summary>${summary}</summary>`,
      "",
      ...this.renderFailures(failures),
      ...(changed.length === 0
        ? []
        : [...TABLE_HEADER, ...changed.map((row) => this.renderRow(row))]),
      "</details>",
      "",
    ];
  }

  /** Renders one table row. */
  private renderRow(row: MetricRow): string {
    const delta =
      row.baseValue === undefined ? undefined : row.value - row.baseValue;
    const cells = [
      this.readStatus(row),
      row.removed ? `~~${row.label}~~` : row.label,
      row.removed ? "—" : formatValue(row.value, row.unit),
      row.baseValue === undefined ? "—" : formatValue(row.baseValue, row.unit),
      formatDelta(delta, row.unit),
    ];

    return `| ${cells.join(" | ")} |`;
  }

  // 🌎 Public Methods

  /**
   * Renders the report body: its heading, and one block per project with
   * something to show.
   */
  renderSection(args: RenderSectionArguments): string {
    const rowsByProject = this.groupByProject(args.rows, (row) => row.project);
    const failuresByProject = this.groupByProject(
      args.failures,
      (failure) => failure.project,
    );

    const blocks = this.readProjects(args).flatMap((project) =>
      this.renderProject(
        project,
        rowsByProject.get(project) ?? [],
        failuresByProject.get(project) ?? [],
      ),
    );

    const comparison = this.renderComparison(args.baselineUrl);
    const body =
      blocks.length === 0
        ? [
            ...comparison,
            "No codometer changes to report for this pull request.",
          ]
        : [
            ...comparison,
            ...blocks,
            "*Updated automatically when you push new commits.*",
          ];

    return [HEADING, "", ...body].join("\n");
  }
}
