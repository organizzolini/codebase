// 🌎 Public Functions

/**
 * The open ids with one more opened, or closed again if it was open.
 */
export function toggleOpen(open: ReadonlySet<string>, id: string): Set<string> {
  const next = new Set(open);

  if (!next.delete(id)) {
    next.add(id);
  }

  return next;
}
