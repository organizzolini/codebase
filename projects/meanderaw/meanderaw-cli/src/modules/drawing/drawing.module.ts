import { Module } from "@nestjs/common";

import { CodeModule } from "../code/code.module";
import { GeometryModule } from "../geometry/geometry.module";

import { DrawingService } from "./drawing.service";
import { SvgModule } from "./modules/svg/svg.module";

/**
 * Wires up everything that concerns a meander as a drawing:
 * {@link DrawingService}, which goes from a Code to an SVG document.
 *
 * It goes one way only. The reader that ran the other way, from a drawing back
 * to its Code, has served its purpose and is gone.
 */
@Module({
  controllers: [],
  exports: [DrawingService],
  imports: [CodeModule, GeometryModule, SvgModule],
  providers: [DrawingService],
})
export class DrawingModule {}
