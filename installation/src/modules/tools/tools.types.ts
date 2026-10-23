// 🏷️ Types

import type { environmentSchema } from "../../installation.constants";
import type { z } from "zod";

/** A tool the command can install, by the name it is asked for with. */
export type ToolName = "gitleaks" | "postgres-client" | "trivy";

/** The validated shape of the variables the command reads. */
export type ToolsEnvironment = z.infer<typeof environmentSchema>;
