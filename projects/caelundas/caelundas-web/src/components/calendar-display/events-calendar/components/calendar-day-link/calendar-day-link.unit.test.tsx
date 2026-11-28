import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CalendarDayLink } from "./calendar-day-link";
import { listDayLevelItems } from "./calendar-day-link.utilities";

import type { DayOpener } from "../calendar-month/calendar-month.types";

function renderLink(
  properties: {
    className?: string;
    onOpen?: () => void;
    onOpenDay?: DayOpener;
  } = {},
): void {
  render(
    <CalendarDayLink
      day="2026-03-12"
      label="Open the week"
      level="week"
      {...properties}
    >
      12
    </CalendarDayLink>,
  );
}

describe("a day's heading", () => {
  describe(CalendarDayLink, () => {
    it("applies its class name, with no underline", () => {
      renderLink({ className: "calendar-day-link", onOpen: () => {} });

      const { className } = screen.getByTestId("calendar-day-link");

      expect(className).toContain("calendar-day-link");
      expect(className).toContain("no-underline");
      expect(className).not.toContain("hover:underline");
    });

    it("opens when clicked, without the click reaching what it sits in", () => {
      const onOpen = vi.fn<() => void>();
      const onOuter = vi.fn<() => void>();

      render(
        <div
          onClick={onOuter}
          role="presentation"
        >
          <CalendarDayLink
            day="2026-03-12"
            label="Open the week"
            level="week"
            onOpen={onOpen}
          >
            25
          </CalendarDayLink>
        </div>,
      );

      fireEvent.click(screen.getByRole("button", { name: "Open the week" }));

      expect(onOpen).toHaveBeenCalledTimes(1);
      expect(onOuter).not.toHaveBeenCalled();
    });

    it("is a focusable menu trigger, opening nothing, when it has nothing to open", () => {
      renderLink();

      expect(screen.getByTestId("calendar-day-link").tabIndex).toBe(0);
      expect(
        screen.getByRole("button", { name: "Open the week" }).matches("span"),
      ).toBe(true);
    });

    it("offers the day, week and month on a right click, the current one disabled", async () => {
      const onOpenDay = vi.fn<DayOpener>();

      renderLink({ onOpen: () => {}, onOpenDay });
      fireEvent.contextMenu(screen.getByTestId("calendar-day-link"));

      const current = await screen.findByRole("menuitem", {
        name: /Open week \(current\)/u,
      });

      expect(current.getAttribute("aria-disabled")).toBe("true");

      fireEvent.click(screen.getByRole("menuitem", { name: "Open month" }));

      expect(onOpenDay).toHaveBeenCalledExactlyOnceWith("month", "2026-03-12");
    });
  });

  describe(listDayLevelItems, () => {
    it("lists every level from the day up, marking the current one", () => {
      expect(
        listDayLevelItems("month").map(({ isCurrent, label, level }) => [
          level,
          label,
          isCurrent,
        ]),
      ).toStrictEqual([
        ["day", "Open day", false],
        ["week", "Open week", false],
        ["month", "Open month (current)", true],
      ]);
    });
  });
});
