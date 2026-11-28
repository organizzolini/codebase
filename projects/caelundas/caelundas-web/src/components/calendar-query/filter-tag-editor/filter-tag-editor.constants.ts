// ♟️ Constants

import { z } from "zod";

/** The note a tag option carries. */
export const TAG_NOTE = z.object({ note: z.string() });

/** Whether a tag option is a folder, which only opens. */
export const TAG_FOLDER = z.object({ folder: z.boolean() });

/** The other parents a tag listed under several carries. */
export const TAG_ALSO_UNDER = z.object({ alsoUnder: z.array(z.string()) });

export const INDENT_REM = 0.875;

// A partly ticked tag is a box with a dash in place of the check.
export const INDETERMINATE_CLASS_NAME =
  "pointer-events-none before:hidden before:h-0.5 before:w-2 before:rounded-full before:bg-primary data-indeterminate:border-primary data-indeterminate:before:block data-indeterminate:[&_svg]:hidden";
