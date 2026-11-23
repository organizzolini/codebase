import type { LoggerService } from "@codebase/observability";

// 🏷️ Types

/** A command with its own Nx target; a check has no `write`. */
export interface SynchronizableCommand {
  /** What fixes a failure, when it is not the command's own `:write` target. */
  readonly fixCommand?: string;
  readonly synchronizationLabel: string;
  synchronize(mode: SynchronizationMode): Promise<boolean>;
}

/** Supported synchronization execution modes. */
export type SynchronizationMode = "check" | "write";

/** Shared options for resolving and validating synchronization command mode arguments. */
export interface SynchronizationModeResolutionOptions {
  readonly defaultMode?: SynchronizationMode;
  readonly invalidModeLabel: string;
  readonly loggerService: LoggerService;
  readonly passedParameters: string[];
  readonly usageMessage: string;
}

/** Result of mode parsing before command-specific error handling is applied. */
export type SynchronizationModeResolutionResult =
  | {
      modeValue: string;
      valid: false;
    }
  | {
      modeValue: SynchronizationMode;
      valid: true;
    };

/** Outcome of one command within a run of every synchronization. */
export interface SynchronizationResult {
  readonly fix: string;
  readonly label: string;
  readonly succeeded: boolean;
}
