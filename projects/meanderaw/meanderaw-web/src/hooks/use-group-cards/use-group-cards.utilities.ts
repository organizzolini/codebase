import type { GroupCards } from "../../components/grouped-gallery/grouped-gallery.types";
import type { MeandersPage } from "../../components/meander-gallery/meanders-api.types";

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

  // A loop rather than a mapping callback, which would count as one more
  // frame on the stack beneath it.
  for (const { node } of page.edges) {
    meanders.push(node);
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
