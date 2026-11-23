import { useMemo } from "react";

import { useElementBox } from "../../../hooks/use-element-box/use-element-box";
import { GalleryEmpty } from "../gallery-empty/gallery-empty";
import { GalleryError } from "../gallery-error/gallery-error";
import { GroupedItem } from "../grouped-item/grouped-item";
import { getColumnCount } from "../meander-gallery/meander-gallery.utilities";

import { buildGroupedItems, indexGroups } from "./grouped-gallery.utilities";

import type { GalleryView } from "../../../hooks/use-gallery-search/use-gallery-search.types";
import type { GroupField } from "../gallery-group-by/gallery-group-by.types";
import type {
  GalleryCharacteristic,
  GalleryGroup,
  GalleryMeander,
} from "../meander-gallery/meanders-api.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The meanders, the groups with their counts, and the view.
 */
export interface GroupedGalleryProperties {
  /** Characteristics the page is grouped, sorted or filtered by. */
  activeKeys: readonly string[];
  /** The catalog, which groups each card's pills. */
  catalog: readonly GalleryCharacteristic[];
  className?: string;
  fields: readonly GroupField[];
  /** The levels the meanders are ordered by first, outermost first. */
  grouping: readonly string[];
  /** Every group of the filtered meanders, with its exact count. */
  groups: readonly GalleryGroup[];
  /** Whether a filter narrows the meanders, for the empty notice. */
  isFiltered: boolean;
  loadError: unknown;
  /** The meanders of the pages showing, ordered by the levels, then the sorts. */
  meanders: readonly GalleryMeander[];
  /** How many meanders come before the first, over every page. */
  offset: number;
  onRetry: () => void;
  repeats: number;
  view: GalleryView;
}

// 🧩 Component

/**
 * Renders the meanders of the pages showing under a header wherever a group begins, the cards of each group in a masonry.
 */
export function GroupedGallery(
  properties: Readonly<GroupedGalleryProperties>,
): ReactNode {
  const {
    activeKeys,
    catalog,
    className,
    fields,
    grouping,
    groups,
    isFiltered,
    loadError,
    meanders,
    offset,
    onRetry,
    repeats,
    view,
  } = properties;

  // 🪝 Hooks
  const { setElement, width } = useElementBox();
  const columns = getColumnCount(width, view);
  const extents = useMemo(() => indexGroups(groups), [groups]);
  const items = useMemo(
    () => buildGroupedItems(meanders, { extents, fields, grouping, offset }),
    [extents, fields, grouping, meanders, offset],
  );

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (meanders.length === 0) {
    return <GalleryEmpty isFiltered={isFiltered} />;
  }

  // 🎨 Markup
  return (
    <div
      ref={setElement}
      className={className}
      data-testid="grouped-gallery"
    >
      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <GroupedItem
            key={item.key}
            activeKeys={activeKeys}
            catalog={catalog}
            columns={columns}
            item={item}
            repeats={repeats}
          />
        ))}
      </div>
      {loadError === undefined ? null : (
        <GalleryError
          className="pt-2"
          error={loadError}
          onRetry={onRetry}
        />
      )}
    </div>
  );
}
