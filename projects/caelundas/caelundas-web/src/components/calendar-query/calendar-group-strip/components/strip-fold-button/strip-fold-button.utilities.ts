import { FOLDABLE_STRIPS } from "./strip-fold-button.constants";

import type { FoldableStrip, StripFold } from "./strip-fold-button.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * The fold of each strip from the folded strips the link lists; none where a change cannot be written.
 */
export function createStripFolds(
  folded: readonly FoldableStrip[],
  onChange: ((fold: string | undefined) => void) | undefined,
): Record<FoldableStrip, StripFold | undefined> {
  const folds: Record<FoldableStrip, StripFold | undefined> = {
    filter: undefined,
    group: undefined,
    select: undefined,
    sort: undefined,
  };

  if (onChange === undefined) {
    return folds;
  }

  for (const strip of FOLDABLE_STRIPS) {
    const isFolded = folded.includes(strip);
    const write = (next: boolean): void => {
      onChange(
        toFoldSearch(
          FOLDABLE_STRIPS.filter((other) =>
            other === strip ? next : folded.includes(other),
          ),
        ),
      );
    };

    folds[strip] = {
      isFolded,
      onFold: () => {
        write(true);
      },
      onUnfold: () => {
        write(false);
      },
    };
  }

  return folds;
}

/**
 * The count button's text: how many facets are folded away, singular for one.
 */
export function formatFoldCount(count: number): string {
  return `${String(count)} ${count === 1 ? "Facet" : "Facets"}`;
}

/**
 * The strips a link lists as folded, as one comma-separated value or a list, in the strips' order; unknown names are ignored.
 */
export function parseFoldedStrips(value: unknown): FoldableStrip[] {
  const names = new Set(
    (typeof value === "string" ? value.split(",") : []).map((name) =>
      name.trim(),
    ),
  );

  return FOLDABLE_STRIPS.filter((strip) => names.has(strip));
}

/**
 * The fold a strip draws: its own while folded with a facet to fold, none otherwise, so a strip with no facets stays plain.
 */
export function toFoldedStrip(
  fold: StripFold | undefined,
  count: number,
): StripFold | undefined {
  return fold?.isFolded === true && count > 0 ? fold : undefined;
}

/**
 * The link's value for the folded strips; none when none are folded.
 */
export function toFoldSearch(
  strips: readonly FoldableStrip[],
): string | undefined {
  return strips.length === 0 ? undefined : strips.join(",");
}
