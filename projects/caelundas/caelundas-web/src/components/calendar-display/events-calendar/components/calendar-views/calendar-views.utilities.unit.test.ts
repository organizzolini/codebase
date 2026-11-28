import { describe, expect, it } from "vitest";

import {
  CALENDAR_VIEW_LABELS,
  CALENDAR_VIEW_PERIODS,
  CALENDAR_VIEWS,
} from "./calendar-views.constants";
import {
  isMetricView,
  parseCalendarView,
  toEventCalendarView,
} from "./calendar-views.utilities";

describe("calendar-views utilities", () => {
  describe(isMetricView, () => {
    it("is true for the Charts and the Totals only", () => {
      expect(CALENDAR_VIEWS.filter((view) => isMetricView(view))).toStrictEqual(
        ["charts", "totals"],
      );
    });

    it("is false for no view", () => {
      expect(isMetricView(undefined)).toBe(false);
    });
  });

  describe(parseCalendarView, () => {
    it("reads the Charts and the Totals, after the table", () => {
      expect(parseCalendarView("charts")).toBe("charts");
      expect(parseCalendarView("totals")).toBe("totals");
      expect(CALENDAR_VIEWS.indexOf("charts")).toBe(
        CALENDAR_VIEWS.indexOf("table") + 1,
      );
    });

    it("names them for the toolbar and for an empty notice", () => {
      expect(CALENDAR_VIEW_LABELS.charts).toBe("Charts");
      expect(CALENDAR_VIEW_LABELS.totals).toBe("Totals");
      expect(CALENDAR_VIEW_PERIODS.charts).toBe("in these days");
      expect(CALENDAR_VIEW_PERIODS.totals).toBe("in these days");
    });
  });

  describe(toEventCalendarView, () => {
    it("names the calendar's own view", () => {
      expect(toEventCalendarView("week")).toBe("week");
    });
  });
});
