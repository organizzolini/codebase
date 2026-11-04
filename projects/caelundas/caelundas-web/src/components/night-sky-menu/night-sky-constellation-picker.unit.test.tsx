import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { NightSkyConstellationPicker } from "./night-sky-constellation-picker";

import type { ConstellationListing } from "../../hooks/use-night-sky/night-sky.types";

const LISTING: readonly ConstellationListing[] = [
  { name: "Aries", zodiac: true },
  { name: "Orion", zodiac: false },
  { name: "Ursa Major", zodiac: false },
];

describe(NightSkyConstellationPicker, () => {
  it("applies its class name", () => {
    render(
      <NightSkyConstellationPicker
        className="night-sky-constellation-picker"
        constellations={LISTING}
        onWordsChange={vi.fn<() => void>()}
        words={["zodiac"]}
      />,
    );

    expect(screen.getByTestId("night-sky-constellation-picker").className).toBe(
      "night-sky-constellation-picker",
    );
  });

  it("marks the constellations the link shows", () => {
    render(
      <NightSkyConstellationPicker
        constellations={LISTING}
        onWordsChange={vi.fn<() => void>()}
        words={["zodiac"]}
      />,
    );

    expect(screen.queryByRole("button", { name: "All" })).toBeNull();
    expect(
      screen
        .getByRole("checkbox", { name: "Aries" })
        .getAttribute("aria-checked"),
    ).toBe("true");
    expect(
      screen
        .getByRole("checkbox", { name: "Other constellations" })
        .getAttribute("aria-checked"),
    ).toBe("false");
  });

  it("picks every constellation and none from the folder checkboxes", () => {
    const onWordsChange = vi.fn<(words: string[]) => void>();

    render(
      <NightSkyConstellationPicker
        constellations={LISTING}
        onWordsChange={onWordsChange}
        words={["zodiac"]}
      />,
    );

    fireEvent.click(
      screen.getByRole("checkbox", { name: "Other constellations" }),
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "Zodiac" }));

    expect(onWordsChange.mock.calls).toStrictEqual([[["all"]], [[]]]);
  });

  it("adds one constellation to the zodiac", () => {
    const onWordsChange = vi.fn<(words: string[]) => void>();

    render(
      <NightSkyConstellationPicker
        constellations={LISTING}
        onWordsChange={onWordsChange}
        words={["zodiac"]}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Expand Other constellations" }),
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "Orion" }));

    expect(onWordsChange.mock.calls).toStrictEqual([[["zodiac", "orion"]]]);
  });
});
