import { z } from "zod";

// 🌱 Add environment schema fields here
export const environmentSchema = z.object({
  /** Set by most CI providers; `installed-skills` words its remediation for a cloud agent. */
  CI: z.string().optional(),
  /** Set by GitHub Actions; read the same way as `CI`. */
  GITHUB_ACTIONS: z.string().optional(),
});
