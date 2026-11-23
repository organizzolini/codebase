import { beforeAll, describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { SvgService } from "./svg.service";

describe(SvgService, () => {
  let service: SvgService;

  beforeAll(async () => {
    const built = await buildTestingModule(SvgService);

    service = built.instance;
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(SvgService);

    expect(instance).toBeInstanceOf(SvgService);
  });

  describe("render", () => {
    it("assembles a single-path document matching the reference markup shape", () => {
      const svg = service.render({
        dots: [],
        height: "66",
        paths: ["M3 15H39V51H3V27H27V39H15"],
        strokeWidth: "6",
        width: "282",
      });

      expect(svg).toBe(
        '<svg width="282" height="66" viewBox="0 0 282 66" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
          '<path d="M3 15H39V51H3V27H27V39H15" stroke="black" stroke-width="6" stroke-linecap="square"/>\n' +
          "</svg>\n",
      );
    });

    it("renders one path element per entry, in order", () => {
      const svg = service.render({
        dots: [],
        height: "10",
        paths: ["M0 0H1", "M1 1H2"],
        strokeWidth: "2",
        width: "20",
      });

      expect(svg).toContain('<path d="M0 0H1"');
      expect(svg).toContain('<path d="M1 1H2"');
      expect(svg.indexOf('d="M0 0H1"')).toBeLessThan(svg.indexOf('d="M1 1H2"'));
    });

    it("adds one filled path with no stroke for the dots after the stroked ones", () => {
      const svg = service.render({
        dots: ["M0 0H3V3H0Z", "M5 0H8V3H5Z"],
        height: "10",
        paths: ["M0 5H4"],
        strokeWidth: "3",
        width: "20",
      });

      expect(svg).toBe(
        '<svg width="20" height="10" viewBox="0 0 20 10" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
          '<path d="M0 5H4" stroke="black" stroke-width="3" stroke-linecap="square"/>\n' +
          '<path d="M0 0H3V3H0ZM5 0H8V3H5Z" fill="black" stroke="none"/>\n' +
          "</svg>\n",
      );
    });
  });
});
