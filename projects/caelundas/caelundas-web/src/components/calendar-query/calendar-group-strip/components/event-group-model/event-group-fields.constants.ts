/**
 * The default grouping's name.
 */
export const DEFAULT_GROUP_LABEL = "Tags";

/**
 * What a field every menu offers says: all four flags on.
 */
export const ALL_MENUS = {
  isFilterable: true,
  isGroupable: true,
  isSelectable: true,
  isSortable: true,
} as const;

/**
 * The field of a level over every tag root.
 */
export const ALL_TAGS_FIELD = "tag:*";
