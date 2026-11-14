import { useEffect, useState } from "react";

import {
  COPIED_MILLISECONDS,
  COPY_LABELS,
  VIEW_CLASSES,
} from "./meander-card.constants";
import { formatShape, toSvgDataUri } from "./meander-card.utilities";

import type { GalleryView } from "../../hooks/use-gallery-search/use-gallery-search.types";
import type { GalleryMeander } from "../meander-gallery/meanders-api.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The meander a card shows, and the view that decides its layout.
 */
export interface MeanderCardProperties {
  className?: string;
  meander: GalleryMeander;
  view: GalleryView;
}

// 🧩 Component

/**
 * Renders one meander: its drawing, shape, Code and the characteristics it
 * holds, the same fields in a grid card as in a list row.
 */
export function MeanderCard(
  properties: Readonly<MeanderCardProperties>,
): ReactNode {
  const { className, meander, view } = properties;

  // 🪝 Hooks
  const [copy, setCopy] = useState<"copied" | "failed" | "idle">("idle");

  // 🏗 Setup
  const classes = VIEW_CLASSES[view];
  const patterns = meander.characteristics.filter(({ isPattern }) => isPattern);

  // 💪 Handlers
  const handleCopy = (): void => {
    navigator.clipboard
      .writeText(meander.code)
      .then(() => {
        setCopy("copied");
      })
      .catch(() => {
        setCopy("failed");
      });
  };

  // ♻️ Lifecycle
  // The notice goes after a moment, and with the card if it leaves first.
  useEffect(() => {
    const timer =
      copy === "idle"
        ? undefined
        : setTimeout(() => {
            setCopy("idle");
          }, COPIED_MILLISECONDS);

    return () => {
      clearTimeout(timer);
    };
  }, [copy]);

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="meander-card"
    >
      <article
        className={`flex gap-3 rounded-(--radius-card) border border-(--line) bg-(--surface-raised) p-3 ${classes.root}`}
      >
        <img
          alt={`Drawing of meander ${meander.code}`}
          className={`rounded-md bg-(--surface-sunken) object-contain ${classes.drawing}`}
          height={classes.size}
          src={toSvgDataUri(meander.svg)}
          width={classes.size}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="text-sm">
            <span>{formatShape(meander.rows, meander.columns)}</span>
            <span className="text-(--ink-muted)">
              {" "}
              · lattice {meander.lattice} · repeats {meander.repeats}
            </span>
            {meander.isHardcoded ? (
              <span className="ml-2 rounded-full bg-(--accent) px-2 py-0.5 text-xs text-(--accent-ink)">
                Hardcoded
              </span>
            ) : null}
          </p>
          <p className="flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate text-xs">
              {meander.code}
            </code>
            <button
              aria-label={`Copy the Code of meander ${meander.code}`}
              className="rounded-md border border-(--line) px-2 py-0.5 text-xs"
              onClick={handleCopy}
              type="button"
            >
              {COPY_LABELS[copy]}
            </button>
          </p>
          <ul
            aria-label="Pattern characteristics"
            className="flex flex-wrap gap-1"
          >
            {patterns.map(({ key, name }) => (
              <li
                key={key}
                className="rounded-full border border-(--accent) px-2 py-0.5 text-xs text-(--accent)"
              >
                {name}
              </li>
            ))}
          </ul>
          <details className="text-xs">
            <summary className="cursor-pointer text-(--ink-muted)">
              All values ({meander.characteristics.length})
            </summary>
            <dl className="mt-1 grid grid-cols-[1fr_auto] gap-x-3">
              {meander.characteristics.map(({ key, name, value }) => (
                <div
                  key={key}
                  className="contents"
                >
                  <dt>{name}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </details>
        </div>
      </article>
    </div>
  );
}
