import { Inject, Injectable } from "@nestjs/common";

import { CodeService } from "../code/code.service";
import { GeometryService } from "../geometry/geometry.service";
import { SvgService } from "../svg/svg.service";

import type { CodeObject } from "../code/code.types";
import type { Geometry } from "../geometry/geometry.types";
import type { Directions } from "../tile/tile.types";
import type { CanvasPoint } from "./drawing.types";

/**
 * Draws a Code to SVG. Each point owns two of its four direction bits: `east`
 * draws one unit right, `south` one unit down. A point owning neither is a dot: a filled square of the stroke width.
 *
 * No repeat unit or overhang: a Code is one whole meander.
 */
@Injectable()
export class DrawingService {
  // 🏗 Dependency Injection

  constructor(
    @Inject(CodeService)
    private readonly codeService: CodeService,
    @Inject(GeometryService)
    private readonly geometryService: GeometryService,
    @Inject(SvgService)
    private readonly svgService: SvgService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** The stroked edges and the filled dot squares every point of the Code draws, in reading order. */
  private codeInk(
    geometry: Geometry,
    code: CodeObject,
  ): { dots: string[]; edges: string } {
    const { repeats } = code;
    const dots: string[] = [];
    const segments: string[] = [];

    for (let repeatIndex = 0; repeatIndex < repeats; repeatIndex += 1) {
      const columnOffset = repeatIndex * code.columns;

      for (let row = 0; row < code.rows; row += 1) {
        for (let column = 0; column < code.columns; column += 1) {
          const absoluteColumn = columnOffset + column;
          const directions: Directions = this.codeService.directionsAt(
            code,
            row,
            column,
          );
          const origin: CanvasPoint = {
            x: geometry.offset + absoluteColumn * geometry.unit,
            y: geometry.offset + (row + 1) * geometry.unit,
          };

          if (this.isBare(directions)) {
            dots.push(this.dotSquare(geometry, origin));
          } else {
            segments.push(this.pointSegments(geometry, directions, origin));
          }
        }
      }
    }

    return { dots, edges: segments.join("") };
  }

  /** The path data of a filled square of the stroke width, centered on a point. */
  private dotSquare(geometry: Geometry, origin: CanvasPoint): string {
    const half = geometry.strokeWidth / 2;
    const left = this.format(origin.x - half);
    const right = this.format(origin.x + half);
    const top = this.format(origin.y - half);
    const bottom = this.format(origin.y + half);

    return `M${left} ${top}H${right}V${bottom}H${left}Z`;
  }

  /** Rounds and trims one pixel coordinate for interpolation into path data. */
  private format(value: number): string {
    return this.geometryService.formatCoordinate(value);
  }

  /** Whether a point carries no direction bit at all, own or neighbor's. */
  private isBare(point: Directions): boolean {
    return !point.east && !point.north && !point.south && !point.west;
  }

  /** The path data of the edges one point owns; a bare point owns none. */
  private pointSegments(
    geometry: Geometry,
    point: Directions,
    origin: CanvasPoint,
  ): string {
    const startX = this.format(origin.x);
    const startY = this.format(origin.y);

    const east = point.east
      ? `M${startX} ${startY}H${this.format(origin.x + geometry.unit)}`
      : "";
    const south = point.south
      ? `M${startX} ${startY}V${this.format(origin.y + geometry.unit)}`
      : "";

    return `${east}${south}`;
  }

  // 🌎 Public Methods

  /**
   * Renders a Code to a complete SVG document: `rows` units tall, `columns`
   * units wide, with no repeat since a Code names one whole meander.
   */
  render(code: CodeObject): string {
    const { columns, repeats, rows } = code;
    const totalColumns = columns * repeats;
    const geometry = this.geometryService.compute(rows);
    const rightEdge = geometry.offset + totalColumns * geometry.unit;
    const { dots, edges } = this.codeInk(geometry, code);
    const paths = [edges, this.geometryService.borderPath(geometry, rightEdge)];

    return this.svgService.render({
      dots,
      height: this.format(
        geometry.offset + geometry.height + geometry.strokeWidth / 2,
      ),
      paths,
      strokeWidth: this.format(geometry.strokeWidth),
      width: this.format(rightEdge + geometry.strokeWidth / 2),
    });
  }
}
