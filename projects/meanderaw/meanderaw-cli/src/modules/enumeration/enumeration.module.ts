import { Module } from "@nestjs/common";

import {
  CodeModule,
  SymmetryModule,
  TileModule,
} from "@codebase/meanderaw-core";

import { EnumerationService } from "./enumeration.service";
import { TileEnumerationService } from "./tile-enumeration.service";

/**
 * Wires the walk over the lattice's unit space, folding tiles by symmetry class
 * and spelling them into Codes.
 *
 * Nothing here names tiles, so {@link CodeModule} can use the symmetry group without a cycle.
 */
@Module({
  controllers: [],
  exports: [EnumerationService, TileEnumerationService],
  imports: [CodeModule, SymmetryModule, TileModule],
  providers: [EnumerationService, TileEnumerationService],
})
export class EnumerationModule {}
