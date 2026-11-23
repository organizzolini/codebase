/* cspell:words amandi amari amasse amatum amatus amavisse */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NonFiniteForms } from "./non-finite-forms";

describe(NonFiniteForms, () => {
  it("applies its class name", () => {
    render(
      <NonFiniteForms
        className="non-finite-forms"
        rows={[]}
      />,
    );

    expect(screen.getByTestId("non-finite-forms").className).toBe(
      "non-finite-forms",
    );
  });

  it("tables infinitives and participles by tense and voice", () => {
    render(
      <NonFiniteForms
        rows={[
          {
            kind: "InfinitiveForm",
            tense: "present",
            voice: "active",
            word: "amare",
          },
          {
            kind: "InfinitiveForm",
            tense: "present",
            voice: "passive",
            word: "amari",
          },
          {
            kind: "ParticipleForm",
            tense: "perfect",
            voice: "passive",
            word: "amatus",
          },
        ]}
      />,
    );

    expect(screen.getByText("infinitives")).toBeDefined();
    expect(screen.getByText("participles")).toBeDefined();
    expect(screen.getByText("amare")).toBeDefined();
    expect(screen.getByText("amari")).toBeDefined();
    expect(screen.getByText("amatus")).toBeDefined();
  });

  it("tables gerund and supine side by side, with a dash where one lacks a case", () => {
    render(
      <NonFiniteForms
        rows={[
          { case: "genitive", kind: "GerundForm", word: "amandi" },
          { case: "accusative", kind: "GerundForm", word: "amandum" },
          { case: "accusative", kind: "SupineForm", word: "amatum" },
        ]}
      />,
    );

    expect(screen.getByText("gerund and supine")).toBeDefined();
    expect(screen.getByText("amandi")).toBeDefined();
    expect(screen.getByText("amatum")).toBeDefined();
    expect(screen.getAllByText("–")).toHaveLength(1);
  });

  it("shows a form with two words once each and omits an empty kind", () => {
    render(
      <NonFiniteForms
        rows={[
          {
            kind: "InfinitiveForm",
            tense: "perfect",
            voice: "active",
            word: "amasse",
          },
          {
            kind: "InfinitiveForm",
            tense: "perfect",
            voice: "active",
            word: "amavisse",
          },
          {
            kind: "InfinitiveForm",
            tense: "perfect",
            voice: "active",
            word: "amasse",
          },
        ]}
      />,
    );

    expect(screen.getAllByText("amasse")).toHaveLength(1);
    expect(screen.getByText("amavisse")).toBeDefined();
    expect(screen.queryByText("participles")).toBeNull();
  });
});
