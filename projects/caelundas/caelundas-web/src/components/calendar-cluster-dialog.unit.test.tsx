import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CalendarClusterDialog } from "./calendar-cluster-dialog";

import type { CalendarEventRecord } from "../lib/events-database/events-database.types";

const MEMBER: CalendarEventRecord = {
  color: "#f43f5e",
  description: "Mars and Saturn stand ninety degrees apart",
  durationMinutes: 0,
  end: new Date("2026-03-03T10:00:00.000Z"),
  groups: [],
  id: "event-mars-square-saturn",
  location: null,
  start: new Date("2026-03-03T10:00:00.000Z"),
  summary: "Mars Square Saturn",
  tags: [],
  timezone: "America/New_York",
};

describe(CalendarClusterDialog, () => {
  it("applies its class name", () => {
    render(
      <CalendarClusterDialog
        className="calendar-cluster-dialog"
        members={undefined}
        onClose={vi.fn<() => void>()}
        timeZone="America/New_York"
        title="2 major aspects"
      />,
    );

    expect(screen.getByTestId("calendar-cluster-dialog").className).toBe(
      "calendar-cluster-dialog",
    );
  });

  it("stays closed without events", () => {
    render(
      <CalendarClusterDialog
        members={undefined}
        onClose={vi.fn<() => void>()}
        timeZone="America/New_York"
        title="2 major aspects"
      />,
    );

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("lists the events the cluster stands for under its title", async () => {
    render(
      <CalendarClusterDialog
        members={[MEMBER]}
        onClose={vi.fn<() => void>()}
        timeZone="America/New_York"
        title="2 major aspects"
      />,
    );

    await expect(screen.findByRole("dialog")).resolves.toBeDefined();
    expect(screen.getByText("2 major aspects")).toBeDefined();
  });

  it("reports being closed", async () => {
    const onClose = vi.fn<() => void>();

    render(
      <CalendarClusterDialog
        members={[MEMBER]}
        onClose={onClose}
        timeZone="America/New_York"
        title="2 major aspects"
      />,
    );
    await screen.findByRole("dialog");
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

    await vi.waitFor(() => {
      expect(onClose).toHaveBeenCalledExactlyOnceWith();
    });
  });
});
