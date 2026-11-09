import { Module } from "@nestjs/common";

import { CodeModule } from "../code/code.module";
import { SymmetryModule } from "../symmetry/symmetry.module";
import { TileModule } from "../tile/tile.module";

import { EnumerationService } from "./enumeration.service";
import { TileEnumerationService } from "./tile-enumeration.service";

/**
 * Wires up the walk over the lattice's unit space. {@link TileEnumerationService}
 * folds every subset of a shape's edges by symmetry class, and
 * {@link EnumerationService} spells each tile into a Code.
 *
 * Nothing here knows what a tile is called, so {@link CodeModule} can depend on
 * the symmetry group without this module depending back on the spelling.
 */
@Module({
  controllers: [],
  exports: [EnumerationService, TileEnumerationService],
  imports: [CodeModule, SymmetryModule, TileModule],
  providers: [EnumerationService, TileEnumerationService],
})
export class EnumerationModule {}
