import { describe, expect, it, vi } from "vitest";

import { createDatePicker } from "./events-calendar.utilities";

describe("events-calendar utilities", () => {
  describe(createDatePicker, () => {
    const context = {
      agendaDays: 14,
      anchor: new Date("2026-03-04T12:00:00.000Z"),
      scale: "month" as const,
      timeZone: "America/New_York",
    };

    it("has no picker without a way to apply a range", () => {
      expect(
        createDatePicker({
          ...context,
          onRangeChange: undefined,
          view: "table",
        }),
      ).toBeUndefined();
    });

    it("names the days the view shows, and applies a range as it is handed", () => {
      const onRangeChange = vi.fn<() => void>();
      const picker = createDatePicker({
        ...context,
        onRangeChange,
        view: "charts",
      });

      expect(picker).toStrictEqual({
        onApply: onRangeChange,
        range: { from: "2026-03-04", to: "2026-03-17" },
        timeZone: "America/New_York",
        view: "charts",
      });
    });
  });
});
