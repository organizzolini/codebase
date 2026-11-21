import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useMemo } from "react";

import { useElementBox } from "../../../hooks/use-element-box/use-element-box";
import { useGroupCards } from "../../../hooks/use-group-cards/use-group-cards";
import { GalleryEmpty } from "../gallery-empty/gallery-empty";
import { GroupedItem } from "../grouped-item/grouped-item";
import {
  OVERSCAN_ROWS,
  ROW_ESTIMATES,
} from "../meander-gallery/meander-gallery.constants";
import { getColumnCount } from "../meander-gallery/meander-gallery.utilities";

import { HEADER_ESTIMATE, STATUS_ESTIMATE } from "./grouped-gallery.constants";
import { buildGroupedItems } from "./grouped-gallery.utilities";

import type {
  MeanderFilterGroupInput,
  MeanderSortInput,
} from "../../../graphql/generated/operations";
import type { GalleryView } from "../../../hooks/use-gallery-search/use-gallery-search.types";
import type { GroupField } from "../gallery-group-by/gallery-group-by.types";
import type {
  GalleryCharacteristic,
  GalleryGroup,
} from "../meander-gallery/meanders-api.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The groups with their counts, what selects their cards, and the view.
 */
export interface GroupedGalleryProperties {
  /** The catalog, which groups each card's pills. */
  catalog: readonly GalleryCharacteristic[];
  className?: string;
  fields: readonly GroupField[];
  groups: readonly GalleryGroup[];
  /** What every group's cards are read with: the page's filter, repeats, sort. */
  query: Readonly<{
    filter: MeanderFilterGroupInput | undefined;
    repeats: number;
    sort: MeanderSortInput | undefined;
  }>;
  view: GalleryView;
}

// 🧩 Component

/**
 * Renders the groups as one virtualized list of headers and rows of cards,
 * reading a group's cards as its header comes near.
 */
export function GroupedGallery(
  properties: Readonly<GroupedGalleryProperties>,
): ReactNode {
  const { catalog, className, fields, groups, query, view } = properties;

  // 🪝 Hooks
  const { setElement, top, width } = useElementBox();
  const { cards, load } = useGroupCards(query);
  const columns = getColumnCount(width, view);
  const items = useMemo(
    () =>
      buildGroupedItems(groups, {
        cards,
        columns,
        fields,
        filter: query.filter,
      }),
    [cards, columns, fields, groups, query.filter],
  );
  const virtualizer = useWindowVirtualizer({
    count: items.length,
    estimateSize: (index) => {
      const kind = items[index]?.kind;

      if (kind === "header") {
        return HEADER_ESTIMATE;
      }

      return kind === "cards" ? ROW_ESTIMATES[view] : STATUS_ESTIMATE;
    },
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

  useEffect(() => {
    for (const { index } of visible) {
      const item = items[index];

      if (item?.kind === "pending") {
        load(item.leaf);
      }
    }
  }, [items, load, visible]);

  // 🏁 Early Returns
  if (groups.length === 0) {
    return <GalleryEmpty />;
  }

  // 🎨 Markup
  return (
    <div
      ref={setElement}
      className={className}
      data-testid="grouped-gallery"
    >
      <p
        className="sr-only"
        role="status"
      >
        {visible.some(({ index }) => items[index]?.kind === "pending")
          ? "Loading groups…"
          : ""}
      </p>
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
                catalog={catalog}
                columns={columns}
                item={item}
                onRetry={load}
                repeats={query.repeats}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
