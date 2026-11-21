import { Module } from "@nestjs/common";

import { SvgService } from "./svg.service";

/**
 * Wires up the service that turns finished path data into an SVG document.
 *
 * A meander is a database row now, so no files are named or written here.
 */
@Module({
  controllers: [],
  exports: [SvgService],
  imports: [],
  providers: [SvgService],
})
export class SvgModule {}
