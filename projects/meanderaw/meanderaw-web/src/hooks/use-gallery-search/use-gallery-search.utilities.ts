import { z } from "zod";

import type { MeanderSortInput } from "../../graphql/generated/operations";

// 🔏 Private Functions

/**
 * Reads a link's sorts: a list, each field once and capped; or a lone field
 * with the link's direction.
 */
export function readSorts(
  request: Readonly<{
    direction: "asc" | "desc" | undefined;
    maximum: number;
    sort: unknown;
  }>,
): { direction: "asc" | "desc"; field: string }[] {
  const { direction, maximum, sort } = request;

  if (typeof sort === "string") {
    return [{ direction: direction ?? "asc", field: sort }];
  }

  const entries: { direction: "asc" | "desc"; field: string }[] = [];

  const listed = z.array(z.unknown()).safeParse(sort);

  for (const item of listed.success ? listed.data : []) {
    const entry = readEntry(item);

    if (
      entry !== undefined &&
      !entries.some(({ field }) => field === entry.field)
    ) {
      entries.push(entry);
    }
  }

  return entries.slice(0, maximum);
}

// 🌎 Public Functions

/**
 * Words a link's sorts as the API's sort argument.
 */
export function toSortInput(
  sorts: readonly { direction: "asc" | "desc"; field: string }[],
): MeanderSortInput[] {
  return sorts.map(({ direction, field }): MeanderSortInput => ({
    direction: direction === "desc" ? "DESC" : "ASC",
    field,
  }));
}

/**
 * Reads one sort of a link: a field and a direction, ascending when it is no
 * direction; nothing for anything else.
 */
function readEntry(
  item: unknown,
): undefined | { direction: "asc" | "desc"; field: string } {
  const parsed = z
    .object({
      direction: z.enum(["asc", "desc"]).catch("asc"),
      field: z.string().min(1).max(64),
    })
    .safeParse(item);

  return parsed.success ? parsed.data : undefined;
}
