import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useMemo } from "react";

import { useElementBox } from "../../../hooks/use-element-box/use-element-box";
import { GalleryEmpty } from "../gallery-empty/gallery-empty";
import { GalleryError } from "../gallery-error/gallery-error";
import { GroupedItem } from "../grouped-item/grouped-item";
import {
  OVERSCAN_ROWS,
  ROW_ESTIMATES,
} from "../meander-gallery/meander-gallery.constants";
import { getColumnCount } from "../meander-gallery/meander-gallery.utilities";

import { HEADER_ESTIMATE } from "./grouped-gallery.constants";
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
 * Renders the meanders of the pages showing as one virtualized list of rows of cards, a header wherever a group begins.
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
    loadError,
    meanders,
    offset,
    onRetry,
    repeats,
    view,
  } = properties;

  // 🪝 Hooks
  const { setElement, top, width } = useElementBox();
  const columns = getColumnCount(width, view);
  const extents = useMemo(() => indexGroups(groups), [groups]);
  const items = useMemo(
    () =>
      buildGroupedItems(meanders, {
        columns,
        extents,
        fields,
        grouping,
        offset,
      }),
    [columns, extents, fields, grouping, meanders, offset],
  );
  const virtualizer = useWindowVirtualizer({
    count: items.length,
    estimateSize: (index) =>
      items[index]?.kind === "header" ? HEADER_ESTIMATE : ROW_ESTIMATES[view],
    getItemKey: (index) => items[index]?.key ?? index,
    overscan: OVERSCAN_ROWS,
    scrollMargin: top,
  });

  // 🏗 Setup
  const visible = virtualizer.getVirtualItems();

  // 💪 Handlers

  // ♻️ Lifecycle
  useEffect(() => {
    virtualizer.measure();
  }, [columns, view, virtualizer]);

  // 🏁 Early Returns
  if (meanders.length === 0) {
    return <GalleryEmpty />;
  }

  // 🎨 Markup
  return (
    <div
      ref={setElement}
      className={className}
      data-testid="grouped-gallery"
    >
      <ul
        className="relative"
        style={{ height: virtualizer.getTotalSize() }}
      >
        {visible.map((row) => {
          const item = items[row.index];

          return item === undefined ? null : (
            <li
              key={row.key}
              ref={virtualizer.measureElement}
              className="absolute left-0 w-full pb-4"
              data-index={row.index}
              style={{ top: row.start - top }}
            >
              <GroupedItem
                activeKeys={activeKeys}
                catalog={catalog}
                columns={columns}
                item={item}
                repeats={repeats}
              />
            </li>
          );
        })}
      </ul>
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
