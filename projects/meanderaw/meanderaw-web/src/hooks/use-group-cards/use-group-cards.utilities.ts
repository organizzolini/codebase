import type { GroupCards } from "../../components/gallery/grouped-gallery/grouped-gallery.types";
import type { MeandersPage } from "../../components/gallery/meander-gallery/meanders-api.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * Adds a page read to a group's cards, clearing any earlier failure.
 */
export function appendPage(
  cards: Readonly<Record<string, GroupCards>>,
  id: string,
  page: MeandersPage,
): Record<string, GroupCards> {
  const meanders = [...(cards[id]?.meanders ?? [])];
  const seen = new Set<string>();

  for (const { id: meanderId } of meanders) {
    seen.add(meanderId);
  }

  // A loop rather than a mapping callback, which would count as one more
  // frame on the stack beneath it. A meander read twice shows once.
  for (const { node } of page.edges) {
    if (!seen.has(node.id)) {
      meanders.push(node);
    }
  }

  return {
    ...cards,
    [id]: {
      endCursor: page.pageInfo.endCursor,
      error: undefined,
      hasMore: page.pageInfo.hasNextPage,
      meanders,
    },
  };
}

/**
 * How to read a group's next page: after the cursor of the last, or past the
 * cards held when several sorts leave no cursor.
 */
export function planCardsRead(
  current: Readonly<GroupCards> | undefined,
  sorts: number,
): { after?: null | string | undefined; offset?: number } {
  return sorts <= 1
    ? { after: current?.endCursor }
    : { offset: current?.meanders.length ?? 0 };
}

/**
 * Keeps a failed read with the group, with what was read before it.
 */
export function recordFailure(
  cards: Readonly<Record<string, GroupCards>>,
  id: string,
  error: unknown,
): Record<string, GroupCards> {
  return {
    ...cards,
    [id]: {
      endCursor: cards[id]?.endCursor,
      error,
      hasMore: true,
      meanders: cards[id]?.meanders ?? [],
    },
  };
}
