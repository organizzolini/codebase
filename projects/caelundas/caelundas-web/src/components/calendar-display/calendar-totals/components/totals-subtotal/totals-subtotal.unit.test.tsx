import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TotalsSubtotal } from "./totals-subtotal";

import type { MetricNode } from "../../../calendar-metrics/calendar-metrics.types";

function createNode(isExpandable: boolean): MetricNode {
  return {
    ancestors: [],
    group: {
      id: "/0:alpha",
      key: "alpha",
      label: "Alpha",
      level: 0,
      orderKey: "alpha",
      path: null,
      values: [
        { metric: "EVENTS", previous: 4, value: 6 },
        { metric: "FIRST_START", previous: null, value: 1_772_366_400_000 },
      ],
    },
    isExpandable,
  };
}

describe(TotalsSubtotal, () => {
  it("shows a group's name, value and share of the whole", () => {
    render(
      <TotalsSubtotal
        compare={false}
        metric="EVENTS"
        node={createNode(false)}
        onToggle={vi.fn<(id: string) => void>()}
        open={false}
        whole={10}
      />,
    );

    expect(screen.getByText("Alpha")).toBeDefined();
    expect(screen.getByText("6")).toBeDefined();
    expect(screen.getByTestId("totals-share")).toBeDefined();
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByTestId("totals-change")).toBeNull();
  });

  it("abbreviates a long duration and keeps the full words in its title", () => {
    const node = createNode(false);

    render(
      <TotalsSubtotal
        compare={false}
        metric="TOTAL_DURATION_MINUTES"
        node={{
          ...node,
          group: {
            ...node.group,
            values: [
              {
                metric: "TOTAL_DURATION_MINUTES",
                previous: null,
                value: 525_600 + 43_200 + 4320 + 720,
              },
            ],
          },
        }}
        onToggle={vi.fn<(id: string) => void>()}
        open={false}
        whole={null}
      />,
    );

    expect(screen.getByText("1 y 1 mo 3 d")).toBeDefined();
    expect(
      screen.getByTitle("1 year, 1 month, 3 days, 12 hours").textContent,
    ).toContain("1 year, 1 month, 3 days, 12 hours");
  });

  it("shows a group with no key", () => {
    const node = createNode(false);

    render(
      <TotalsSubtotal
        compare={false}
        metric="EVENTS"
        node={{
          ...node,
          group: { ...node.group, key: null, label: "No Body" },
        }}
        onToggle={vi.fn<(id: string) => void>()}
        open={false}
        whole={10}
      />,
    );

    expect(screen.getByText("No Body")).toBeDefined();
  });

  it("colors its swatch and bar", () => {
    render(
      <TotalsSubtotal
        color="rgb(255, 0, 0)"
        compare={false}
        metric="EVENTS"
        node={createNode(false)}
        onToggle={vi.fn<(id: string) => void>()}
        open={false}
        whole={10}
      />,
    );

    expect(screen.getByTestId("totals-swatch").style.background).toBe(
      "rgb(255, 0, 0)",
    );
  });

  it("shows its change when compared", () => {
    render(
      <TotalsSubtotal
        metric="EVENTS"
        node={createNode(false)}
        onToggle={vi.fn<(id: string) => void>()}
        open={false}
        whole={10}
        compare
      />,
    );

    expect(screen.getByTestId("totals-change").textContent).toContain("+50%");
  });

  it("draws no share bar for a metric that does not add up", () => {
    render(
      <TotalsSubtotal
        compare={false}
        metric="FIRST_START"
        node={createNode(false)}
        onToggle={vi.fn<(id: string) => void>()}
        open={false}
        timeZone="UTC"
        whole={null}
      />,
    );

    expect(screen.queryByTestId("totals-share")).toBeNull();
  });

  it("reads a metric the group lacks as unknown", () => {
    render(
      <TotalsSubtotal
        metric="SPANS"
        node={createNode(false)}
        onToggle={vi.fn<(id: string) => void>()}
        open={false}
        whole={10}
        compare
      />,
    );

    expect(screen.queryByTestId("totals-change")).toBeNull();
  });

  it("holds the cards nested in it as a card of its own", () => {
    render(
      <TotalsSubtotal
        compare={false}
        metric="EVENTS"
        node={createNode(true)}
        onToggle={vi.fn<(id: string) => void>()}
        whole={10}
        open
      >
        <p>nested</p>
      </TotalsSubtotal>,
    );

    expect(screen.getByTestId("totals-subtotal").textContent).toContain(
      "nested",
    );
  });

  it("opens and closes through a button when it has subgroups", () => {
    const onToggle = vi.fn<(id: string) => void>();

    render(
      <TotalsSubtotal
        compare={false}
        metric="EVENTS"
        node={createNode(true)}
        onToggle={onToggle}
        whole={10}
        open
      />,
    );

    const button = screen.getByRole("button", { name: /Alpha/ });

    expect(button.getAttribute("aria-expanded")).toBe("true");

    fireEvent.click(button);

    expect(onToggle).toHaveBeenCalledWith("/0:alpha");
  });
});
