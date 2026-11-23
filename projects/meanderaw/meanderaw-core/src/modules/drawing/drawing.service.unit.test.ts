import { beforeAll, describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { CodeService } from "../code/code.service";
import { GeometryService } from "../geometry/geometry.service";
import { SvgService } from "../svg/svg.service";
import { SymmetryService } from "../symmetry/symmetry.service";
import { TileService } from "../tile/tile.service";

import { DrawingService } from "./drawing.service";

import type { CodeObject } from "../code/code.types";
import type { TestingModuleOptions } from "@codebase/testing/nestjs";

// 🧪 Tests

// 🎯 Fixtures are drawn at 5 rows, where `GeometryService.compute(5)` gives a
// unit of 10, an offset of 2.5 and a stroke width of 5, so numbers can be checked.
/** What the class under test is built with. */
const MODULE_OPTIONS: TestingModuleOptions = {
  providers: [
    CodeService,
    SymmetryService,
    TileService,
    GeometryService,
    SvgService,
  ],
};

describe(DrawingService, () => {
  let service: DrawingService;

  /** Built directly, not parsed, so fixtures may be shorter. */
  const code = (digits: string, columns: number, repeats = 1): CodeObject => ({
    columns,
    digits,
    repeats,
    rows: 5,
  });

  beforeAll(async () => {
    const built = await buildTestingModule(DrawingService, MODULE_OPTIONS);

    service = built.instance;
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      DrawingService,
      MODULE_OPTIONS,
    );

    expect(instance).toBeInstanceOf(DrawingService);
  });

  describe("render", () => {
    it("draws a bare point as a filled square of the stroke width centered on it, not as a zero-length stroke", () => {
      const svg = service.render(code("0", 1));

      expect(svg).toContain('<path d="M0 10H5V15H0Z');
      expect(svg).toContain('" fill="black" stroke="none"/>');
      expect(svg).not.toContain("M2.5 12.5H2.5");
    });

    it("gathers every dot into one filled path, after the stroked paths", () => {
      const svg = service.render(code("00", 2));

      expect(svg).toContain('<path d="M0 10H5V15H0ZM10 10H15V15H10Z');
      expect(svg.indexOf('stroke="black"')).toBeLessThan(
        svg.indexOf('stroke="none"'),
      );
    });

    it("draws no dot path where every point owns or is reached by an edge", () => {
      expect(service.render(code("99999", 1))).not.toContain('stroke="none"');
    });

    it("draws an owned eastward edge as a one-unit horizontal segment", () => {
      expect(service.render(code("2", 1))).toContain("M2.5 12.5H12.5");
    });

    it("draws an owned southward edge as a one-unit vertical segment", () => {
      expect(service.render(code("4", 1))).toContain("M2.5 12.5V22.5");
    });

    it("draws both of a point's owned edges where it owns both, with no case of its own", () => {
      const svg = service.render(code("6", 1));

      expect(svg).toContain("M2.5 12.5H12.5");
      expect(svg).toContain("M2.5 12.5V22.5");
    });

    it("draws nothing of its own for a point reached only by a neighbor's north or west bit — that segment is the neighbor's own", () => {
      // 🎯 Not a dot either: a dot is a point neither owning nor reached by
      // any direction bit at all, and this one carries two.
      expect(service.render(code("99999", 1))).toContain(
        '<path d="" stroke="black"',
      );
    });

    it("draws every point of a multi-column Code, each at its own column's offset", () => {
      const svg = service.render(code("20", 2));

      expect(svg).toContain("M2.5 12.5H12.5");
      expect(svg).toContain("M10 10H15V15H10Z");
    });

    it("draws every row of a multi-row Code, each one grid unit further down", () => {
      const svg = service.render(code("40", 1));

      expect(svg).toContain("M2.5 12.5V22.5");
      expect(svg).toContain("M0 20H5V25H0Z");
    });

    it("closes the drawing with a border rule along the top and bottom of the grid", () => {
      const svg = service.render(code("0", 1));

      expect(svg).toContain('<path d="M12.5 62.5H2.5M12.5 2.5H2.5"');
    });

    it("widens the border rule to match a wider grid", () => {
      const svg = service.render(code("00", 2));

      expect(svg).toContain('<path d="M22.5 62.5H2.5M22.5 2.5H2.5"');
    });

    it("wraps the drawn ink in a complete SVG document sized to the grid", () => {
      const svg = service.render(code("0", 1));

      expect(svg).toContain('width="15"');
      expect(svg).toContain('height="65"');
      expect(svg).toContain("<svg");
      expect(svg).toContain("</svg>");
    });

    it("repeats patterns horizontally and widens canvas when repeats > 1", () => {
      const svg = service.render(code("2", 1, 3));

      expect(svg).toContain("M2.5 12.5H12.5");
      expect(svg).toContain("M12.5 12.5H22.5");
      expect(svg).toContain("M22.5 12.5H32.5");
      expect(svg).toContain('<path d="M32.5 62.5H2.5M32.5 2.5H2.5"');
      expect(svg).toContain('width="35"');
    });
  });
});
