import { beforeAll, describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { CodeModule } from "../../../code/code.module";
import { MatrixModule } from "../../../matrix/matrix.module";
import { MatrixService } from "../../../matrix/matrix.service";

import { RunUtilitiesService } from "./run-utilities.service";

describe(RunUtilitiesService, () => {
  let matrixService: MatrixService;
  let service: RunUtilitiesService;

  beforeAll(async () => {
    const built = await buildTestingModule(RunUtilitiesService, {
      imports: [CodeModule, MatrixModule],
    });

    matrixService = await built.module.resolve(MatrixService);
    service = built.instance;
  });

  describe("longestHorizontalRunLength", () => {
    it("reports zero for an empty matrix", () => {
      expect(service.longestHorizontalRunLength([])).toBe(0);
    });

    it("caps a wrapped run at the column count", () => {
      const matrix = matrixService.fromCode({
        columns: 2,
        digits: "3333",
        repeats: 1,
        rows: 2,
      });

      expect(service.longestHorizontalRunLength(matrix)).toBe(2);
    });

    it("finds the longer of two rows", () => {
      const matrix = matrixService.fromCode({
        columns: 2,
        digits: "ecf0",
        repeats: 1,
        rows: 2,
      });

      expect(service.longestHorizontalRunLength(matrix)).toBe(1);
    });
  });

  describe("longestVerticalRunLength", () => {
    it("reports zero for an empty matrix", () => {
      expect(service.longestVerticalRunLength([])).toBe(0);
    });

    it("never wraps a run across the band's own border rules", () => {
      // A south arm at row 0 and another at row 2, with a bare row 1
      // between them. Vertical runs do not wrap the way east arms do, so
      // the longest run is the lone edge from row 0 to row 1.
      const matrix = matrixService.fromCode({
        columns: 1,
        digits: "404",
        repeats: 1,
        rows: 3,
      });

      expect(service.longestVerticalRunLength(matrix)).toBe(1);
    });

    it("finds the longer of two columns", () => {
      const matrix = matrixService.fromCode({
        columns: 2,
        digits: "ecf0",
        repeats: 1,
        rows: 2,
      });

      expect(service.longestVerticalRunLength(matrix)).toBe(2);
    });
  });
});
