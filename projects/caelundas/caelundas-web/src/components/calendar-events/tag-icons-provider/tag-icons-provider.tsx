import { useMemo } from "react";

import { TagIconsContext } from "../tag-pill-label/tag-pill-label.constants";
import { createTagIcons } from "../tag-pill-label/tag-pill-label.utilities";

import type { EventFacet } from "../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type { ReactNode } from "react";

// 🔖 Type

/** The facets whose tags' icons the pills beneath draw. */
export interface TagIconsProviderProperties {
  children?: ReactNode;
  className?: string;
  facets: readonly EventFacet[];
}

// 🧩 Component

/**
 * Passes each tag's icon, read once from the facets, to every pill beneath it, so no view threads them through.
 */
export function TagIconsProvider(
  properties: Readonly<TagIconsProviderProperties>,
): ReactNode {
  const { children, className, facets } = properties;

  // 🪝 Hooks
  const icons = useMemo(() => createTagIcons(facets), [facets]);

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="tag-icons-provider"
    >
      <TagIconsContext value={icons}>{children}</TagIconsContext>
    </div>
  );
}
