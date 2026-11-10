import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EMPTY_EVENT_FILTER } from "../calendar-filters/event-filter-tree.constants";

import { PresetPicker } from "./preset-picker";

const PRESET = {
  description: "Every ingress.",
  filter: {
    combinator: "and" as const,
    id: "planet-sign-events-0",
    rules: [
      {
        id: "planet-sign-events-0-0",
        operator: "is_any_of",
        path: ["tag:tag-type"],
        type: "rule" as const,
        value: ["tag-ingress"],
      },
    ],
    type: "group" as const,
  },
  id: "planet-sign-events",
  name: "Planet-sign events",
};

describe(PresetPicker, () => {
  it("applies its class name", () => {
    render(
      <PresetPicker
        className="preset-picker"
        onSelect={vi.fn<(filter: unknown) => void>()}
        presets={[PRESET]}
        query={EMPTY_EVENT_FILTER}
      />,
    );

    expect(screen.getByTestId("preset-picker").className).toBe("preset-picker");
  });

  it("shows the preset whose filters the tree holds", () => {
    render(
      <PresetPicker
        onSelect={vi.fn<(filter: unknown) => void>()}
        presets={[PRESET]}
        query={PRESET.filter}
      />,
    );

    expect(
      screen.getByRole("combobox", { name: "Preset" }).textContent,
    ).toContain("Planet-sign events");
  });

  it("shows all events when nothing is filtered, with no label or note", () => {
    render(
      <PresetPicker
        onSelect={vi.fn<(filter: unknown) => void>()}
        presets={[PRESET]}
        query={EMPTY_EVENT_FILTER}
      />,
    );

    expect(
      screen.getByRole("combobox", { name: "Preset" }).textContent,
    ).toContain("All events");
    expect(screen.queryByText(/every event in the data/u)).toBeNull();
    expect(screen.queryByText("Preset")).toBeNull();
  });

  it("shows custom for filters no preset holds, and cannot be picked", async () => {
    render(
      <PresetPicker
        onSelect={vi.fn<(filter: unknown) => void>()}
        presets={[PRESET]}
        query={{
          ...PRESET.filter,
          rules: PRESET.filter.rules.map((rule) => ({
            ...rule,
            value: ["tag-other"],
          })),
        }}
      />,
    );

    const picker = screen.getByRole("combobox", { name: "Preset" });

    expect(picker.textContent).toContain("Custom");

    fireEvent.click(picker);

    const custom = await screen.findByRole("option", { name: "Custom" });

    expect(custom.getAttribute("aria-disabled")).toBe("true");
  });

  it("applies a preset picked", async () => {
    const onSelect = vi.fn<(filter: unknown) => void>();

    render(
      <PresetPicker
        onSelect={onSelect}
        presets={[PRESET]}
        query={EMPTY_EVENT_FILTER}
      />,
    );
    fireEvent.click(screen.getByRole("combobox", { name: "Preset" }));
    fireEvent.keyDown(
      await screen.findByRole("option", { name: "Planet-sign events" }),
      {
        key: "Enter",
      },
    );

    expect(onSelect).toHaveBeenCalledWith(PRESET.filter);
  });

  it("clears the filters when all events is picked", async () => {
    const onSelect = vi.fn<(filter: unknown) => void>();

    render(
      <PresetPicker
        onSelect={onSelect}
        presets={[PRESET]}
        query={PRESET.filter}
      />,
    );
    fireEvent.click(screen.getByRole("combobox", { name: "Preset" }));
    fireEvent.keyDown(
      await screen.findByRole("option", { name: "All events" }),
      {
        key: "Enter",
      },
    );

    expect(onSelect).toHaveBeenCalledWith(EMPTY_EVENT_FILTER);
  });
});
