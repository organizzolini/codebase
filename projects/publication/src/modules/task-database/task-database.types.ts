// 🏷️ Types

/** What adopting a restored database comes to. */
export type AdoptionPlan =
  | {
      /** Where the restored database goes: this machine's id, the same schema. */
      adopted: string;
      kind: "adopt";
      /** The newest restored database, which is the one adopted. */
      restored: string;
    }
  | {
      kind: "skip";
      /** Why nothing is adopted, as the line to print. */
      line: string;
    };

/** Where a merge's incoming database goes. */
export type MergePlan =
  | {
      kind: "adopt";
    }
  | {
      kind: "merge";
      /** This cache's newest database, which the rows go into. */
      target: string;
    }
  | {
      kind: "skip";
      reason: string;
    };

/** The database a merge reads from, or why the source cannot be merged. */
export type MergeSource =
  | {
      /** The source's newest database, sound and of a familiar schema. */
      database: string;
      kind: "source";
    }
  | {
      kind: "skip";
      reason: string;
    };

/** What one task-database step has to say; every step ends with exit code 0. */
export interface TaskDatabaseReport {
  /** The lines to print, in order, each already formatted for the workflow log. */
  lines: readonly string[];
}
