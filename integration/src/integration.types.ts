import type { environmentSchema } from "./integration.constants";
import type { z } from "zod";

/** The validated shape of the environment the commands read. */
export type Environment = z.infer<typeof environmentSchema>;
