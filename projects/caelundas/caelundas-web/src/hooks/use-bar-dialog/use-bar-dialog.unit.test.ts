import { act, renderHook } from "@testing-library/react";
import { isValidElement } from "react";
import { describe, expect, it } from "vitest";

import { useBarDialog } from "./use-bar-dialog";

import type { TimelineBar } from "../../types/calendar-timeline.types";
import type { CalendarEventRecord } from "../../types/events-database.types";
import type { GanttOccurrence } from "@codebase/presentation";

const RECORD: CalendarEventRecord = {
  color: null,
  description: "Mars enters Aries",
  durationMinutes: 0,
  end: new Date(Date.UTC(2026, 2, 4)),
  groups: [],
  id: "a",
  location: null,
  start: new Date(Date.UTC(2026, 2, 4)),
  summary: "♂️ → ♈ Mars enters Aries",
  tags: [],
  timezone: "UTC",
};

function readDialog(dialog: unknown): { members: unknown; title: unknown } {
  if (!isValidElement<{ members: unknown; title: unknown }>(dialog)) {
    throw new Error("Expected the dialog to be an element");
  }

  return dialog.props;
}

describe(useBarDialog, () => {
  it("returns its result", () => {
    const { result } = renderHook(() => useBarDialog("UTC"));

    expect(readDialog(result.current.dialog)).toStrictEqual(
      expect.objectContaining({ members: undefined, title: "" }),
    );
    expect(result.current).toStrictEqual({
      dialog: expect.anything(),
      handleEventClick: expect.any(Function),
    });
  });

  it("opens the dialog on the events of the marker clicked", () => {
    const { result } = renderHook(() => useBarDialog("UTC"));
    const occurrence = {
      event: { data: { names: ["Mars enters Aries"], records: [RECORD] } },
    } as unknown as GanttOccurrence<TimelineBar>;

    act(() => {
      result.current.handleEventClick(occurrence);
    });

    expect(readDialog(result.current.dialog)).toStrictEqual(
      expect.objectContaining({
        members: [RECORD],
        title: "Mars enters Aries",
      }),
    );
  });
});
