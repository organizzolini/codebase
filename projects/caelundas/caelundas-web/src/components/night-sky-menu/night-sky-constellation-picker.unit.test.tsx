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

  it("marks the choice the link holds and the constellations it shows", () => {
    render(
      <NightSkyConstellationPicker
        constellations={LISTING}
        onWordsChange={vi.fn<() => void>()}
        words={["zodiac"]}
      />,
    );

    expect(
      screen
        .getByRole("button", { name: "Zodiac" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
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

  it("sends a one-press choice, and a constellation added to the choice", () => {
    const onWordsChange = vi.fn<(words: string[]) => void>();

    render(
      <NightSkyConstellationPicker
        constellations={LISTING}
        onWordsChange={onWordsChange}
        words={["zodiac"]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "None" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Expand Other constellations" }),
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "Orion" }));

    expect(onWordsChange.mock.calls).toStrictEqual([
      [[]],
      [["zodiac", "orion"]],
    ]);
  });
});
