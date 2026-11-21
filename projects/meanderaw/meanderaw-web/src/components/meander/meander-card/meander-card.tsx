import { useEffect, useState } from "react";

import { MeanderCharacteristics } from "../meander-characteristics/meander-characteristics";

import { COPIED_MILLISECONDS, COPY_LABELS } from "./meander-card.constants";
import {
  formatCode,
  readDrawingSize,
  toSvgDataUri,
} from "./meander-card.utilities";

import type {
  GalleryCharacteristic,
  GalleryMeander,
} from "../../gallery/meander-gallery/meanders-api.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The meander, the catalog categorizing its pills, and its repeats.
 */
export interface MeanderCardProperties {
  /** Characteristics the page is grouped, sorted or filtered by. */
  activeKeys: readonly string[];
  catalog: readonly GalleryCharacteristic[];
  className?: string;
  meander: GalleryMeander;
  repeats: number;
}

// 🧩 Component

/**
 * Renders one meander: its drawing on top, then its Code and the
 * characteristics it holds as pills.
 */
export function MeanderCard(
  properties: Readonly<MeanderCardProperties>,
): ReactNode {
  const { activeKeys, catalog, className, meander, repeats } = properties;

  // 🪝 Hooks
  const [copy, setCopy] = useState<"copied" | "failed" | "idle">("idle");

  // 🏗 Setup
  const size = readDrawingSize(meander.svg);
  // The Code format spells repeats `r<n>`, so the shown Code is a Code the CLI
  // reads as this drawing; copying takes the same text.
  const code = formatCode(meander.code, repeats);

  // 💪 Handlers
  const handleCopy = (): void => {
    navigator.clipboard
      .writeText(code)
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
      <article className="flex flex-col gap-3 rounded-(--radius-card) border border-(--line) bg-(--surface-raised) p-3">
        <div className="rounded-md border border-(--line) bg-(--drawing-panel) p-4">
          <img
            alt={`Drawing of meander ${meander.code}`}
            className="mx-auto h-auto max-h-56 max-w-full object-contain"
            height={size.height}
            src={toSvgDataUri(meander.svg)}
            style={{ aspectRatio: `${size.width} / ${size.height}` }}
            width={size.width}
          />
        </div>
        <p className="flex items-center gap-2">
          <code
            className="flex min-w-0 flex-1 text-sm"
            title={code}
          >
            <span className="truncate">{meander.code}</span>
            <span className="shrink-0">r{repeats}</span>
          </code>
          {meander.isHardcoded ? (
            <span className="rounded-full bg-(--brand) px-2 py-0.5 text-xs text-(--brand-ink)">
              Hardcoded
            </span>
          ) : null}
          <button
            aria-label={`Copy the Code of meander ${meander.code}`}
            className="rounded-md border border-(--line) px-2 py-0.5 text-xs"
            onClick={handleCopy}
            type="button"
          >
            {COPY_LABELS[copy]}
          </button>
        </p>
        <MeanderCharacteristics
          activeKeys={activeKeys}
          catalog={catalog}
          characteristics={meander.characteristics}
        />
      </article>
    </div>
  );
}
