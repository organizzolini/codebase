import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { CalendarLayoutMenu } from "./calendar-layout-menu";

const display = vi.hoisted(() => ({
  handlers: {
    handleScaleChange: vi.fn<() => void>(),
    handleViewChange: vi.fn<(view: string) => void>(),
  },
}));

vi.mock(
  import("../../../hooks/use-calendar-display/use-calendar-display"),
  () => ({
    useCalendarDisplay: () =>
      ({
        change: vi.fn<() => void>(),
        constellations: [],
        handlers: display.handlers,
        sky: {},
        state: { scale: "month" },
      }) as never,
  }),
);

const PROPERTIES = {
  timeZone: "UTC",
  view: "timeline",
} as const;

describe(CalendarLayoutMenu, () => {
  // The list scrolls its active item into view, which jsdom cannot do.
  beforeAll(() => {
    globalThis.HTMLElement.prototype.scrollIntoView = vi.fn<() => void>();
  });

  it("applies its class name", () => {
    render(
      <CalendarLayoutMenu
        {...PROPERTIES}
        className="calendar-layout-menu"
      />,
    );

    expect(screen.getByTestId("calendar-layout-menu").className).toBe(
      "calendar-layout-menu",
    );
  });

  it("names the view shown on a chip beside the Layout button", () => {
    render(<CalendarLayoutMenu {...PROPERTIES} />);

    expect(screen.getByRole("group", { name: "Layout" }).textContent).toBe(
      "LayoutTimeline",
    );
  });

  it("leads the chip with the icon the layout has in the list", () => {
    render(<CalendarLayoutMenu {...PROPERTIES} />);

    expect(
      screen
        .getByRole("button", { name: "Timeline" })
        .querySelector("svg")
        ?.classList.contains("lucide-chart-gantt"),
    ).toBe(true);
  });

  it("leads the button with the layout icon", () => {
    render(<CalendarLayoutMenu {...PROPERTIES} />);

    expect(
      screen
        .getByRole("button", { name: "Layout" })
        .querySelector("svg")
        ?.classList.contains("lucide-layout-dashboard"),
    ).toBe(true);
  });

  it("opens its list from the chip as well as the button", async () => {
    render(<CalendarLayoutMenu {...PROPERTIES} />);
    fireEvent.click(screen.getByRole("button", { name: "Timeline" }));

    await expect(screen.findByTestId("query-cascader")).resolves.toBeDefined();
  });

  it("lists the layouts at the top, the timeline's scales beneath it", async () => {
    render(<CalendarLayoutMenu {...PROPERTIES} />);
    fireEvent.click(screen.getByRole("button", { name: "Layout" }));

    for (const label of ["Charts", "Totals", "Table", "Quarter"]) {
      await expect(screen.findByText(label)).resolves.toBeDefined();
    }

    expect(screen.queryByText("Symbols")).toBeNull();
    expect(screen.queryByText("Skyfield")).toBeNull();
  });

  it("sets a layout from the list", async () => {
    render(<CalendarLayoutMenu {...PROPERTIES} />);
    fireEvent.click(screen.getByRole("button", { name: "Layout" }));

    // The timeline is shown, so its own Week scale is listed after the layout's.
    const weeks = await screen.findAllByText("Week");

    fireEvent.click(weeks.at(0) ?? document.body);

    expect(display.handlers.handleViewChange).toHaveBeenCalledWith("week");
  });

  it("sets a timeline scale from the choices nested beneath the Timeline layout", async () => {
    render(<CalendarLayoutMenu {...PROPERTIES} />);
    fireEvent.click(screen.getByRole("button", { name: "Layout" }));
    fireEvent.click(await screen.findByText("Quarter"));

    expect(display.handlers.handleScaleChange).toHaveBeenCalledWith("quarter");
  });

  it("indents the nested timeline scales beneath their parent row", () => {
    render(<CalendarLayoutMenu {...PROPERTIES} />);
    fireEvent.click(screen.getByRole("button", { name: "Layout" }));

    expect(screen.getByTestId("query-cascader").className).toContain(
      "--cascader-indent,0px)*2",
    );
  });

  it("finds a layout by searching for it", async () => {
    render(<CalendarLayoutMenu {...PROPERTIES} />);
    fireEvent.click(screen.getByRole("button", { name: "Layout" }));
    fireEvent.change(await screen.findByPlaceholderText("Search layouts"), {
      target: { value: "table" },
    });
    fireEvent.click(await screen.findByRole("treeitem", { name: /^Table/u }));

    expect(display.handlers.handleViewChange).toHaveBeenCalledWith("table");
  });
});
