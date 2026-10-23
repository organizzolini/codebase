// 🏷️ Types

/** Whether a baseline could be fetched, and the run it came from. */
export type CodometerBaseline =
  | {
      kind: "found";
      /** The run page the baseline was downloaded from. */
      url: string;
    }
  | {
      kind: "none";
      line: string;
    };

/** What the report did: lines to print, and the exit code to end with. */
export interface ReportCodometerChangesOutcome {
  exitCode: number;
  lines: string[];
}
