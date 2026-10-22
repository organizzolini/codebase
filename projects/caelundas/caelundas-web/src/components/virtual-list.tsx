import { useEffect, useMemo, useState } from "react";

import {
  getRowOffsets,
  getVirtualWindow,
} from "../lib/calendar/calendar-virtual-window";

import type { ReactNode, UIEvent } from "react";

// 🔖 Type

/**
 * The rows to window, how tall each is, and how to draw one.
 */
export interface VirtualListProperties<Row> {
  className?: string;
  /**
   * A row's height in pixels, which its drawing must keep to.
   */
  getRowHeight: (row: Row) => number;
  /**
   * A key unique to a row, so a row keeps its state as the window slides.
   */
  getRowKey: (row: Row) => string;
  /**
   * Names the scrolling region for assistive technology.
   */
  label: string;
  /**
   * Called when a scroll brings the last row into view.
   */
  onReachEnd?: (() => void) | undefined;
  /**
   * Draws a row; the list places and sizes it.
   */
  renderRow: (row: Row) => ReactNode;
  rows: readonly Row[];
}

// Rows drawn beyond each edge of the viewport, so a fast fling does not
// show blank space before the next render catches up.
const OVERSCAN = 6;

// The height assumed until the viewport is measured, and wherever it never
// is, as under jsdom: about a phone screen of rows.
const UNMEASURED_HEIGHT = 720;

// 🧩 Component

/**
 * Renders a vertically scrolling list that draws only the rows in view, plus
 * a few on each side, however long the list grows. Rows are absolutely
 * placed over a spacer as tall as the whole list, so the scrollbar still
 * reads true.
 */
export function VirtualList<Row>(
  properties: Readonly<VirtualListProperties<Row>>,
): ReactNode {
  const {
    className,
    getRowHeight,
    getRowKey,
    label,
    onReachEnd,
    renderRow,
    rows,
  } = properties;

  // 🪝 Hooks
  const [viewport, setViewport] = useState<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(UNMEASURED_HEIGHT);
  const [answered, setAnswered] = useState<(() => void) | undefined>();
  const offsets = useMemo(
    () => getRowOffsets(rows.map((row) => getRowHeight(row))),
    [getRowHeight, rows],
  );

  // 🏗 Setup
  const { end, start } = getVirtualWindow({
    offsets,
    overscan: OVERSCAN,
    scrollTop,
    viewportHeight,
  });
  const shownRows = rows.slice(start, end);

  // 💪 Handlers
  // Only a scroll can reach the end, so a list too short to scroll never
  // calls back on its own. It calls back once per callback it is handed,
  // however many scroll events land at the end: the owner hands a new one
  // once it has answered, even when that answer added no rows.
  const handleScroll = (event: UIEvent<HTMLDivElement>): void => {
    const top = event.currentTarget.scrollTop;
    const shown = getVirtualWindow({
      offsets,
      overscan: 0,
      scrollTop: top,
      viewportHeight,
    });

    setScrollTop(top);

    if (top > 0 && shown.end === rows.length && answered !== onReachEnd) {
      setAnswered(() => onReachEnd);
      onReachEnd?.();
    }
  };

  // ♻️ Lifecycle
  // A browser reports an observed element's size once as soon as it is
  // observed, and again whenever it changes.
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const { target } of entries) {
        setViewportHeight(target.clientHeight || UNMEASURED_HEIGHT);
      }
    });

    if (viewport !== null) {
      observer.observe(viewport);
    }

    return () => {
      observer.disconnect();
    };
  }, [viewport]);

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="virtual-list"
    >
      <div
        ref={setViewport}
        aria-label={label}
        className="h-full overflow-y-auto overscroll-contain"
        onScroll={handleScroll}
        role="region"
      >
        <div
          className="relative"
          style={{ height: offsets.at(-1) }}
        >
          {shownRows.map((row, at) => (
            <div
              key={getRowKey(row)}
              className="absolute inset-x-0"
              style={{ height: getRowHeight(row), top: offsets[start + at] }}
            >
              {renderRow(row)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
