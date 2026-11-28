// 🏷️ Types
import type { LogData } from "@codebase/observability";
import type { Moment } from "moment-timezone";

/**
 * Arguments used to build and log an instantaneous event.
 */
export interface BuildInstantEventArguments {
  date: Moment;
  description: string;
  logger: {
    info: (message: string, context?: string, data?: LogData) => void;
  };
  summary: string;
  tags: string[];
  timezone: string;
}
