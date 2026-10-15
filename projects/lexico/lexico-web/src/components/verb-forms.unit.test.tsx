/* cspell:words amabam amem */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { VerbForms } from "./verb-forms";

import type { VerbFormRow } from "./verb-forms";

/**
 * Builds a finite form with only the fields a test varies.
 */
function finite(word: string, fields: Partial<VerbFormRow> = {}): VerbFormRow {
  return {
    kind: "FiniteVerbForm",
    mood: "indicative",
    number: "singular",
    person: "first",
    tense: "present",
    voice: "active",
    word,
    ...fields,
  };
}

const rows: VerbFormRow[] = [
  finite("amo"),
  finite("amas", { person: "second" }),
  finite("amabam", { tense: "imperfect" }),
  finite("amem", { mood: "subjunctive" }),
  finite("amor", { voice: "passive" }),
  { kind: "InfinitiveForm", tense: "present", voice: "active", word: "amare" },
];

describe(VerbForms, () => {
  it("applies its class name", () => {
    render(
      <VerbForms
        className="verb-forms"
        rows={rows}
      />,
    );

    expect(screen.getByTestId("verb-forms").className).toBe("verb-forms");
  });

  it("opens on the active present indicative", () => {
    render(<VerbForms rows={rows} />);

    expect(screen.getByText("amo")).toBeDefined();
    expect(screen.getByText("amas")).toBeDefined();
    expect(screen.queryByText("amabam")).toBeNull();
  });

  it("switches mood and tense by tab", () => {
    render(<VerbForms rows={rows} />);

    fireEvent.click(screen.getByRole("tab", { name: "imperfect" }));

    expect(screen.getByText("amabam")).toBeDefined();

    fireEvent.click(screen.getByRole("tab", { name: "subjunctive" }));

    expect(screen.getByText("amem")).toBeDefined();
  });

  it("keeps the chosen mood when the voice changes, if the new voice has it", () => {
    render(<VerbForms rows={rows} />);

    fireEvent.click(screen.getByRole("tab", { name: "passive" }));

    expect(screen.getByText("amor")).toBeDefined();
  });

  it("lists the forms with no person under a non-finite tab", () => {
    render(<VerbForms rows={rows} />);

    fireEvent.click(screen.getByRole("tab", { name: "non-finite" }));

    expect(screen.getByText("amare")).toBeDefined();
    expect(screen.getByText("infinitive present active")).toBeDefined();
  });
});
