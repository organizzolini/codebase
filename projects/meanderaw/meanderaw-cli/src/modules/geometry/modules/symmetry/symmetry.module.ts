import { Module } from "@nestjs/common";

import { TileModule } from "../tile/tile.module";

import { SymmetryService } from "./symmetry.service";

/**
 * Wires up the symmetry group two tiles are the same drawing under. It imports
 * {@link TileModule}, since the group acts on a tile's edges; nothing flows back.
 */
@Module({
  controllers: [],
  exports: [SymmetryService],
  imports: [TileModule],
  providers: [SymmetryService],
})
export class SymmetryModule {}
