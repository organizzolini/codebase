// ♟️ Constants

import { z } from "zod";

export const ORGANIZATION_PROJECT_OWNER = "organizzolini";
export const ORGANIZATION_PROJECT_NUMBER = "1";
export const ORGANIZATION_PROJECT_ITEM_LIMIT = "100000";
export const COMPLIANCE_REPOSITORY = "organizzolini/codebase";

export const repositoryResourceUrlsSchema = z.array(z.object({ url: z.url() }));

export const organizationProjectItemsSchema = z.object({
  items: z.array(
    z.object({
      content: z.object({ url: z.url().optional() }).nullable().optional(),
    }),
  ),
});
