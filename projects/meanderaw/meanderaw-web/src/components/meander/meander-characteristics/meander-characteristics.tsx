import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@codebase/presentation";

import {
  listCharacteristics,
  splitPills,
} from "./meander-characteristics.utilities";

import type {
  GalleryCharacteristic,
  GalleryMeander,
} from "../../gallery/meander-gallery/meanders-api.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The held characteristics, the catalog, and the active keys.
 */
export interface MeanderCharacteristicsProperties {
  /** Characteristics the page is grouped, sorted or filtered by: always shown. */
  activeKeys: readonly string[];
  catalog: readonly GalleryCharacteristic[];
  characteristics: GalleryMeander["characteristics"];
  className?: string;
}

// 🧩 Component

/**
 * Renders characteristics as pills, active ones first and always shown, at most four otherwise, the rest under a +N hover card.
 */
export function MeanderCharacteristics(
  properties: Readonly<MeanderCharacteristicsProperties>,
): ReactNode {
  const { activeKeys, catalog, characteristics, className } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const { hidden, shown } = splitPills(
    listCharacteristics(characteristics, catalog, activeKeys),
    activeKeys,
  );

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (shown.length === 0) {
    return null;
  }

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="meander-characteristics"
    >
      <ul className="flex flex-wrap gap-1">
        {shown.map(({ description, isNumeric, key, name, value }) => (
          <li
            key={key}
            className="rounded-full border border-(--line) px-2 py-0.5 text-xs"
            title={description}
          >
            <span className="text-(--ink-muted)">{name}</span>
            {isNumeric ? (
              <>
                {" "}
                <strong>{value}</strong>
              </>
            ) : null}
          </li>
        ))}
        {hidden.length === 0 ? null : (
          <li>
            <HoverCard>
              <HoverCardTrigger
                closeDelay={100}
                delay={0}
                render={
                  <button
                    aria-label={`${String(hidden.length)} more characteristics`}
                    className="rounded-full border border-(--line) px-2 py-0.5 text-xs text-(--ink-muted)"
                    type="button"
                  />
                }
              >
                +{hidden.length}
              </HoverCardTrigger>
              <HoverCardContent className="w-auto max-w-sm">
                <ul
                  className="flex flex-wrap gap-1"
                  data-testid="hidden-characteristics"
                >
                  {hidden.map(
                    ({ description, isNumeric, key, name, value }) => (
                      <li
                        key={key}
                        className="rounded-full border border-(--line) px-2 py-0.5 text-xs"
                        title={description}
                      >
                        <span className="text-(--ink-muted)">{name}</span>
                        {isNumeric ? (
                          <>
                            {" "}
                            <strong>{value}</strong>
                          </>
                        ) : null}
                      </li>
                    ),
                  )}
                </ul>
              </HoverCardContent>
            </HoverCard>
          </li>
        )}
      </ul>
    </div>
  );
}
