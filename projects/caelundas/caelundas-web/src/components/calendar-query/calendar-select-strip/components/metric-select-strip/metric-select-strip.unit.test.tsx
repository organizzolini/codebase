import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { renderWithCatalog } from "../../../../../../testing/metrics/metric-catalog";

import { MetricSelectStrip } from "./metric-select-strip";

import type { StripFold } from "../../../calendar-group-strip/components/strip-fold-button/strip-fold-button.types";

function renderStrip(metrics: readonly string[]): {
  onMetricsChange: ReturnType<
    typeof vi.fn<(metrics: readonly string[] | undefined) => void>
  >;
} {
  const onMetricsChange =
    vi.fn<(metrics: readonly string[] | undefined) => void>();

  renderWithCatalog(
    <MetricSelectStrip
      metrics={metrics}
      onMetricsChange={onMetricsChange}
    />,
  );

  return { onMetricsChange };
}

describe(MetricSelectStrip, () => {
  // The list scrolls its active item into view, which jsdom cannot do.
  beforeAll(() => {
    globalThis.HTMLElement.prototype.scrollIntoView = vi.fn<() => void>();
  });

  it("applies its class name", () => {
    renderWithCatalog(
      <MetricSelectStrip
        className="metric-select-strip"
        metrics={["events"]}
      />,
    );

    expect(screen.getByTestId("metric-select-strip").className).toBe(
      "metric-select-strip",
    );
  });

  it("offers no dates to the Charts", () => {
    renderWithCatalog(
      <MetricSelectStrip
        metrics={["events"]}
        view="charts"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Select" }));

    expect(screen.queryByText("Times")).toBeNull();
    expect(screen.queryByText("First start")).toBeNull();
  });

  it("leads the Select button with the cursor icon", () => {
    renderStrip(["events"]);

    expect(
      screen
        .getByRole("button", { name: "Select" })
        .querySelector("svg")
        ?.classList.contains("lucide-mouse-pointer-2"),
    ).toBe(true);
  });

  it("shows a chip for each metric, in order", () => {
    renderStrip(["progressive-events", "events"]);

    const names = screen
      .getAllByRole("button")
      .map((button) => button.textContent)
      .filter((name) => name === "Progressive events" || name === "Events");

    expect(names).toStrictEqual(["Progressive events", "Events"]);
  });

  it("lists the metrics under their branches, with their notes", async () => {
    renderStrip(["events"]);

    fireEvent.click(screen.getByRole("button", { name: "Select" }));

    await expect(screen.findByText("Counts")).resolves.toBeDefined();
    expect(screen.getByText("Durations")).toBeDefined();
    expect(
      screen.getByText("How many distinct events there are."),
    ).toBeDefined();
  });

  it("adds a metric picked from the list after the others", async () => {
    const { onMetricsChange } = renderStrip(["events"]);

    fireEvent.click(screen.getByRole("button", { name: "Select" }));
    fireEvent.click(await screen.findByText("Unique names"));

    expect(onMetricsChange).toHaveBeenCalledWith(["events", "unique-names"]);
  });

  it("removes a metric from its ellipsis menu", async () => {
    const { onMetricsChange } = renderStrip(["events", "progressive-events"]);

    fireEvent.click(screen.getByRole("button", { name: "Events options" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Remove" }));

    expect(onMetricsChange).toHaveBeenCalledWith(["progressive-events"]);
  });

  it("cannot remove the last metric", async () => {
    renderStrip(["events"]);

    fireEvent.click(screen.getByRole("button", { name: "Events options" }));

    const item = await screen.findByRole("menuitem", { name: "Remove" });

    expect(item.getAttribute("aria-disabled")).toBe("true");
  });

  it("moves a metric right, and left, from its ellipsis menu", async () => {
    const { onMetricsChange } = renderStrip(["events", "progressive-events"]);

    fireEvent.click(screen.getByRole("button", { name: "Events options" }));
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "Move right" }),
    );

    expect(onMetricsChange).toHaveBeenLastCalledWith([
      "progressive-events",
      "events",
    ]);

    fireEvent.click(
      screen.getByRole("button", { name: "Progressive events options" }),
    );
    fireEvent.click(await screen.findByRole("menuitem", { name: "Move left" }));

    expect(onMetricsChange).toHaveBeenLastCalledWith([
      "progressive-events",
      "events",
    ]);
  });

  it("shows a chip only for a metric the catalog names, with its icon", () => {
    renderStrip(["events", "unknown-slug"]);

    expect(screen.getByRole("button", { name: "Events" })).toBeDefined();
    expect(screen.queryByText("unknown-slug")).toBeNull();
    expect(
      within(screen.getByRole("button", { name: "Events" })).getByTestId(
        "tag-icon",
      ),
    ).toBeDefined();
  });

  it("shows no chip until the catalog is read", () => {
    render(<MetricSelectStrip metrics={["events"]} />);

    expect(screen.queryByRole("button", { name: "Events" })).toBeNull();
  });

  it("does nothing on a change without a handler", async () => {
    renderWithCatalog(
      <MetricSelectStrip metrics={["events", "progressive-events"]} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Events options" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Remove" }));

    expect(screen.getByTestId("metric-select-strip")).toBeDefined();
  });

  it("keeps only a metric from its ellipsis menu", async () => {
    const { onMetricsChange } = renderStrip(["events", "progressive-events"]);

    fireEvent.click(
      screen.getByRole("button", { name: "Progressive events options" }),
    );
    fireEvent.click(await screen.findByRole("menuitem", { name: "Only" }));

    expect(onMetricsChange).toHaveBeenCalledWith(["progressive-events"]);
  });

  it("ticks every metric of a branch from its own checkbox, leaving the others", async () => {
    const { onMetricsChange } = renderStrip(["events", "duration"]);

    fireEvent.click(screen.getByRole("button", { name: "Select" }));
    fireEvent.click(await screen.findByText("Counts"));

    const next = onMetricsChange.mock.lastCall?.[0] ?? [];

    expect(next.slice(0, 2)).toStrictEqual(["events", "duration"]);
    expect(next).toStrictEqual(
      expect.arrayContaining([
        "unique-names",
        "unique-tags",
        "progressive-events",
      ]),
    );
  });

  it("shows a branch ticked when all its metrics are, mixed when some, else cleared", async () => {
    renderStrip([
      "events",
      "unique-names",
      "unique-tags",
      "days-with-events",
      "perfective-events",
      "progressive-events",
      "first-start",
    ]);
    fireEvent.click(screen.getByRole("button", { name: "Select" }));
    await screen.findByText("Counts");

    const row = (name: string): HTMLElement =>
      screen.getByRole("treeitem", { name: new RegExp(name, "u") });

    expect(row("Counts").getAttribute("aria-selected")).toBe("true");
    expect(row("Durations").getAttribute("aria-selected")).not.toBe("true");
    expect(row("Durations").getAttribute("aria-checked")).toBeNull();
  });

  it("shows a branch mixed when only some of its metrics are ticked", async () => {
    renderStrip(["events", "duration"]);
    fireEvent.click(screen.getByRole("button", { name: "Select" }));
    await screen.findByText("Counts");

    expect(
      screen
        .getAllByRole("treeitem")
        .filter((row) => row.getAttribute("aria-checked") === "mixed"),
    ).toHaveLength(2);
  });

  it("checks a branch when the last of its metrics is ticked, and mixes it when one is cleared", async () => {
    const counts = [
      "events",
      "unique-names",
      "unique-tags",
      "days-with-events",
      "perfective-events",
    ];
    const { rerender } = renderWithCatalog(
      <MetricSelectStrip metrics={counts} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Select" }));
    await screen.findByText("Counts");

    expect(getBranch("Counts").getAttribute("aria-checked")).toBe("mixed");

    rerender(<MetricSelectStrip metrics={[...counts, "progressive-events"]} />);

    expect(getBranch("Counts").getAttribute("aria-selected")).toBe("true");
    expect(getBranch("Counts").getAttribute("aria-checked")).toBeNull();

    rerender(<MetricSelectStrip metrics={["events", "progressive-events"]} />);

    expect(getBranch("Counts").getAttribute("aria-checked")).toBe("mixed");
  });

  it("ticks all of a mixed branch's metrics when it is pressed", async () => {
    const { onMetricsChange } = renderStrip(["events"]);

    fireEvent.click(screen.getByRole("button", { name: "Select" }));
    fireEvent.click(await screen.findByText("Counts"));

    expect(onMetricsChange.mock.lastCall?.[0]).toHaveLength(6);
  });

  it("clears all of a full branch's metrics when it is pressed", async () => {
    const { onMetricsChange } = renderStrip([
      "duration",
      "events",
      "unique-names",
      "unique-tags",
      "days-with-events",
      "perfective-events",
      "progressive-events",
    ]);

    fireEvent.click(screen.getByRole("button", { name: "Select" }));
    fireEvent.click(await screen.findByText("Counts"));

    expect(onMetricsChange).toHaveBeenLastCalledWith(["duration"]);
  });

  it("covers only the metrics the Charts offer, so a branch is full without the dates", async () => {
    renderWithCatalog(
      <MetricSelectStrip
        metrics={[
          "events",
          "unique-names",
          "unique-tags",
          "days-with-events",
          "perfective-events",
          "progressive-events",
        ]}
        view="charts"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Select" }));
    await screen.findByText("Counts");

    expect(getBranch("Counts").getAttribute("aria-selected")).toBe("true");
    expect(screen.queryByText("Times")).toBeNull();
  });

  describe("folding", () => {
    function renderFolded(isFolded: boolean): StripFold {
      const fold: StripFold = {
        isFolded,
        onFold: vi.fn<() => void>(),
        onUnfold: vi.fn<() => void>(),
      };

      renderWithCatalog(
        <MetricSelectStrip
          fold={fold}
          metrics={["progressive-events", "events"]}
        />,
      );

      return fold;
    }

    it("shows the Select button and a count of its chips, and unfolds when it is pressed", () => {
      const fold = renderFolded(true);
      const strip = screen.getByRole("group", { name: "Select" });

      expect(strip.querySelectorAll("button")).toHaveLength(2);

      const count = screen.getByRole("button", { name: /2 Facets/u });

      expect(count.title).toBe("Progressive events, Events");

      fireEvent.click(count);

      expect(fold.onUnfold).toHaveBeenCalledTimes(1);
    });

    it("folds from a chip's menu while it is unfolded", async () => {
      const fold = renderFolded(false);

      fireEvent.click(
        screen.getByRole("button", { name: "Progressive events options" }),
      );
      fireEvent.click(await screen.findByRole("menuitem", { name: "Fold" }));

      expect(fold.onFold).toHaveBeenCalledTimes(1);
    });
  });
});

function getBranch(name: string): HTMLElement {
  return screen.getByRole("treeitem", { name: new RegExp(name, "u") });
}
