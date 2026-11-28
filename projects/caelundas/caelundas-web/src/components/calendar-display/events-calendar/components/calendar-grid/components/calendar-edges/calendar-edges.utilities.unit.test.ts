import { describe, expect, it } from "vitest";

import { createRecord } from "../../../../../../../../testing/calendar/calendar-records";

import { addEdgeBlocks, isEdgeId } from "./calendar-edges.utilities";

const OPTIONS = {
  firstDay: "2026-03-01",
  lastDay: "2026-03-07",
  timeZone: "UTC",
};

describe("the long events' edge blocks", () => {
  describe(addEdgeBlocks, () => {
    it("runs a long event from its real start to midnight on its first day, and from midnight to its real end on its last", () => {
      const long = createRecord(
        "long",
        "2026-03-02T08:10:00Z",
        "2026-03-05T20:00:00Z",
      );
      const { blocks, origins } = addEdgeBlocks([long], OPTIONS);

      expect(blocks.map((block) => block.id)).toStrictEqual([
        "edge:start:long",
        "edge:end:long",
      ]);
      expect(blocks[0]).toMatchObject({
        durationMinutes: 950,
        end: new Date("2026-03-03T00:00:00Z"),
        start: new Date("2026-03-02T08:10:00Z"),
      });
      expect(blocks[1]).toMatchObject({
        end: new Date("2026-03-05T20:00:00Z"),
        start: new Date("2026-03-05T00:00:00Z"),
      });
      expect(origins.get("edge:start:long")).toBe(long);
    });

    it("leaves the days between to the bar", () => {
      const { blocks } = addEdgeBlocks(
        [createRecord("long", "2026-03-02T08:00:00Z", "2026-03-06T08:00:00Z")],
        OPTIONS,
      );

      expect(blocks).toHaveLength(2);
    });

    it("ends a block that finishes at midnight on the day before", () => {
      const { blocks } = addEdgeBlocks(
        [createRecord("long", "2026-03-02T08:00:00Z", "2026-03-05T00:00:00Z")],
        OPTIONS,
      );

      expect(blocks[1]).toMatchObject({
        end: new Date("2026-03-05T00:00:00Z"),
        start: new Date("2026-03-04T00:00:00Z"),
      });
    });

    it("marks only the ends that fall on the days shown", () => {
      const { blocks } = addEdgeBlocks(
        [createRecord("long", "2026-02-20T08:00:00Z", "2026-03-04T08:00:00Z")],
        OPTIONS,
      );

      expect(blocks.map((block) => block.id)).toStrictEqual(["edge:end:long"]);
      expect(
        addEdgeBlocks(
          [
            createRecord(
              "past",
              "2026-03-04T08:00:00Z",
              "2026-03-20T08:00:00Z",
            ),
          ],
          OPTIONS,
        ).blocks.map((block) => block.id),
      ).toStrictEqual(["edge:start:past"]);
    });

    it("reads the time of day in a zone whose formatter writes literals, never a NaN", () => {
      // The formatter's ":" parts are no numbers; they once made every block's time invalid.
      const { blocks } = addEdgeBlocks(
        [createRecord("long", "2026-11-02T08:15:30Z", "2026-11-05T20:45:10Z")],
        { ...OPTIONS, timeZone: "America/New_York" },
      );

      for (const block of blocks) {
        expect(Number.isFinite(block.start.getTime())).toBe(true);
        expect(Number.isFinite(block.end.getTime())).toBe(true);
      }
    });

    it("leaves an event of a day or less alone", () => {
      expect(
        addEdgeBlocks(
          [
            createRecord("day", "2026-03-02T00:00:00Z", "2026-03-03T00:00:00Z"),
            createRecord("instant", "2026-03-02T10:00:00Z"),
          ],
          OPTIONS,
        ).blocks,
      ).toStrictEqual([]);
    });

    it("reads the days in the data's zone", () => {
      // 22:00 on 1 March in New York is 03:00 on 2 March UTC: before the days shown.
      const { blocks } = addEdgeBlocks(
        [createRecord("long", "2026-03-02T03:00:00Z", "2026-03-04T12:00:00Z")],
        { ...OPTIONS, firstDay: "2026-03-02", timeZone: "America/New_York" },
      );

      expect(blocks.map((block) => block.id)).toStrictEqual(["edge:end:long"]);
      // Midnight in New York, 05:00 UTC on 4 March.
      expect(blocks[0]?.start).toStrictEqual(new Date("2026-03-04T05:00:00Z"));
    });
  });

  describe(isEdgeId, () => {
    it("names the blocks", () => {
      expect(isEdgeId("edge:start:a")).toBe(true);
      expect(isEdgeId("a")).toBe(false);
    });
  });
});
