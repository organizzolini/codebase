// 🏷️ Types

import type { keyResponseSchema } from "./remote-cache.constants";
import type { z } from "zod";

/** The keys `linode-cli` printed for a new Object Storage key. */
export type KeyResponse = z.infer<typeof keyResponseSchema>;
