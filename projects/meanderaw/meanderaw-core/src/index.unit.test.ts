import { describe, expect, it } from "vitest";

import {
  CodeService,
  DrawingService,
  GeometryService,
  SvgService,
  SymmetryService,
  TileService,
} from "./index";

describe("drawing services built by hand", () => {
  it("draws a Code without a Nest container", () => {
    const drawing = new DrawingService(
      new CodeService(new SymmetryService(new TileService())),
      new GeometryService(),
      new SvgService(),
    );

    const svg = drawing.render({
      columns: 1,
      digits: "0",
      repeats: 1,
      rows: 5,
    });

    expect(svg).toContain("M2.5 12.5H2.5");
  });
});
