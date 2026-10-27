import { getVisibleTimelineRows } from "../utilities/calendar-timeline-window.utilities";

import { TIMELINE_VIEWPORT } from "./calendar-timeline.constants";

import type { TimelineRowBox } from "../types/calendar-timeline-window.types";
import type { GanttColumn } from "@codebase/presentation";

/**
 * The tree panel's one extra column: how many distinct events each row
 * holds.
 */
export function toCountColumns(
  counts: ReadonlyMap<string, number>,
): GanttColumn[] {
  return [
    {
      align: "end",
      id: "events",
      render: (context) => counts.get(context.resource.id),
      title: "Events",
      width: 64,
    },
  ];
}

/**
 * Reports the timeline body's visible rows once a frame at most, now and on
 * every scroll or resize of the body or its content, until the cleanup it
 * answers is called. The Gantt mounts its body after itself, so the body is
 * looked for again whenever the container's content changes.
 */
export function watchVisibleRows(
  container: HTMLElement,
  onChange: (visible: null | ReadonlySet<string>) => void,
): () => void {
  let frame = 0;
  let viewport: HTMLElement | null = null;
  const measure = (): void => {
    frame = 0;

    if (viewport !== null) {
      onChange(
        getVisibleTimelineRows(readRowBoxes(viewport), readViewport(viewport)),
      );
    }
  };
  const schedule = (): void => {
    frame ||= requestAnimationFrame(measure);
  };
  const resizes = new ResizeObserver(schedule);
  const attach = (): void => {
    // Most changes are the bars redrawn inside a body already found.
    if (viewport?.isConnected === true) {
      return;
    }

    const found = container.querySelector<HTMLElement>(TIMELINE_VIEWPORT);

    if (found === null) {
      return;
    }

    viewport?.removeEventListener("scroll", schedule);
    resizes.disconnect();
    viewport = found;
    viewport.addEventListener("scroll", schedule, { passive: true });
    resizes.observe(viewport);

    if (viewport.firstElementChild !== null) {
      resizes.observe(viewport.firstElementChild);
    }

    schedule();
  };
  const mutations = new MutationObserver(attach);

  mutations.observe(container, { childList: true, subtree: true });
  attach();

  return () => {
    cancelAnimationFrame(frame);
    mutations.disconnect();
    resizes.disconnect();
    viewport?.removeEventListener("scroll", schedule);
  };
}

/**
 * The timeline body's rows in order, each with its height as laid out.
 */
function readRowBoxes(viewport: HTMLElement): TimelineRowBox[] {
  return [...viewport.querySelectorAll<HTMLElement>("[data-gantt-row]")].map(
    (row) => ({
      height: row.getBoundingClientRect().height,
      id: row.dataset["ganttRowId"] ?? "",
    }),
  );
}

/**
 * How far the timeline body's first row has scrolled above its viewport's
 * top, past the axis drawn over it, and how tall the viewport is.
 */
function readViewport(viewport: HTMLElement): {
  scrollTop: number;
  viewportHeight: number;
} {
  const firstRow = viewport.querySelector<HTMLElement>("[data-gantt-row]");
  const top = viewport.getBoundingClientRect().top;

  return {
    scrollTop: top - (firstRow?.getBoundingClientRect().top ?? top),
    viewportHeight: viewport.clientHeight,
  };
}
