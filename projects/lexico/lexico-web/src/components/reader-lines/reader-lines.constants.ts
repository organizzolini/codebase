import { createServerFn as createServerFunction } from "@tanstack/react-start";

import { getTextInputSchema } from "./reader-lines-api.constants";
import { findText } from "./reader-lines.utilities";

import type { ReaderText } from "./reader-lines.types";

// ♟️ Constants

/**
 * Reads one text with a page of its lines, for the reader.
 */
export const getText = createServerFunction({ method: "GET" })
  .validator(getTextInputSchema)
  .handler(async ({ data }): Promise<null | ReaderText> => findText(data));
