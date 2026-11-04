import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OutsideDataset } from "./outside-dataset";

import type { EventsDataset } from "../events-calendar/events-database.types";

const DATASET: EventsDataset = {
  count: 2,
  end: new Date("2026-12-31T00:00:00.000Z"),
  start: new Date("2026-01-01T00:00:00.000Z"),
  timezone: "UTC",
};

describe(OutsideDataset, () => {
  it("applies its class name", () => {
    render(
      <OutsideDataset
        className="outside-dataset"
        dataset={DATASET}
        jumpTo={DATASET.start}
        onJump={vi.fn<(date: Date) => void>()}
      />,
    );

    expect(screen.getByTestId("outside-dataset").className).toBe(
      "outside-dataset",
    );
  });

  it("jumps to the nearest date the data covers", () => {
    const onJump = vi.fn<(date: Date) => void>();

    render(
      <OutsideDataset
        dataset={DATASET}
        jumpTo={DATASET.start}
        onJump={onJump}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Go to Jan 1, 2026" }));

    expect(onJump).toHaveBeenCalledWith(DATASET.start);
  });
});
