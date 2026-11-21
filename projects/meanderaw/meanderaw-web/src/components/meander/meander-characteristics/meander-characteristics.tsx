import { groupCharacteristics } from "./meander-characteristics.utilities";

import type {
  GalleryCharacteristic,
  GalleryMeander,
} from "../../gallery/meander-gallery/meanders-api.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The characteristics a meander holds, and the catalog that categorizes them.
 */
export interface MeanderCharacteristicsProperties {
  catalog: readonly GalleryCharacteristic[];
  characteristics: GalleryMeander["characteristics"];
  className?: string;
}

// 🧩 Component

/**
 * Renders the characteristics a meander holds as pills, in a labelled group
 * for the patterns and one for each catalog category.
 */
export function MeanderCharacteristics(
  properties: Readonly<MeanderCharacteristicsProperties>,
): ReactNode {
  const { catalog, characteristics, className } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const groups = groupCharacteristics(characteristics, catalog);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="meander-characteristics"
    >
      {groups.map(({ label, pills }) => (
        <div
          key={label}
          aria-label={label}
          className="mt-2 first:mt-0"
          role="group"
        >
          <h4 className="text-xs text-(--ink-muted)">{label}</h4>
          <ul className="mt-1 flex flex-wrap gap-1">
            {pills.map(({ description, isNumeric, key, name, value }) => (
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
          </ul>
        </div>
      ))}
    </div>
  );
}
