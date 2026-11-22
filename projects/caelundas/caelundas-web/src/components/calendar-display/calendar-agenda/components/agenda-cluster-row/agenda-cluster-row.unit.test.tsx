import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AgendaClusterRow } from "./agenda-cluster-row";

import type { AgendaRow } from "../../calendar-agenda.types";

const ROW: Extract<AgendaRow, { kind: "cluster" }> = {
  count: 12,
  expanded: false,
  id: "cluster-id",
  kind: "cluster",
  label: "Ongoing Major aspects",
  ongoing: true,
};

describe(AgendaClusterRow, () => {
  it("applies its class name", () => {
    render(
      <AgendaClusterRow
        className="agenda-cluster-row"
        row={ROW}
      />,
    );

    expect(screen.getByTestId("agenda-cluster-row").className).toContain(
      "agenda-cluster-row",
    );
  });

  it("names the cluster and its size, and opens or closes it by its id", () => {
    const onToggle = vi.fn<(id: string) => void>();

    render(
      <AgendaClusterRow
        onToggle={onToggle}
        row={ROW}
      />,
    );

    const button = screen.getByRole("button", {
      name: /Ongoing Major aspects/u,
    });

    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(button.textContent).toContain("12 events");

    fireEvent.click(button);

    expect(onToggle).toHaveBeenCalledWith("cluster-id");
  });

  it("says it is open when its events are listed", () => {
    render(<AgendaClusterRow row={{ ...ROW, expanded: true }} />);

    expect(screen.getByRole("button").getAttribute("aria-expanded")).toBe(
      "true",
    );
  });
});
