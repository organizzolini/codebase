import { Injectable } from "@nestjs/common";

import {
  ABSENT_LABEL,
  LIMIT_TABLE_COLUMNS,
  LIMITS_HEADING,
  LIMITS_SUMMARY,
  NO_LIMIT_LABEL,
  ROOT_PROJECT_LABEL,
  WORKSPACE_LABEL,
} from "./limits.constants";

import type { ProjectLimitRow } from "./limits.types";

/**
 * Turns the resolved limits into the markdown table a reader gets.
 *
 * Kept apart from the service so resolving the limits never depends on how they are shown.
 */
@Injectable()
export class RenderLimitsService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Names the project a row is about. The workspace default has none; the root project has an empty name.
   */
  private renderProject(project: string | undefined): string {
    if (project === undefined) {
      return WORKSPACE_LABEL;
    }

    return project === "" ? ROOT_PROJECT_LABEL : project;
  }

  /** Renders one markdown table row. */
  private renderRow(cells: readonly string[]): string {
    return `| ${cells.join(" | ")} |`;
  }

  /** Renders every resolved limit as one row apiece. */
  private renderTable(rows: readonly ProjectLimitRow[]): string {
    return [
      this.renderRow(LIMIT_TABLE_COLUMNS),
      this.renderRow(LIMIT_TABLE_COLUMNS.map(() => "---")),
      ...rows.map((row) =>
        this.renderRow([
          this.renderProject(row.project),
          `\`${row.limit}\``,
          row.value === undefined ? NO_LIMIT_LABEL : String(row.value),
          row.path === undefined ? ABSENT_LABEL : `\`${row.path}\``,
        ]),
      ),
    ].join("\n");
  }

  // 🌎 Public Methods

  /** Renders the listing. */
  public render(rows: readonly ProjectLimitRow[]): string {
    return [
      LIMITS_HEADING,
      "",
      LIMITS_SUMMARY,
      "",
      this.renderTable(rows),
    ].join("\n");
  }
}
