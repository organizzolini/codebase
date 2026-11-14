import { Module } from "@nestjs/common";

import { TileService } from "./tile.service";

/**
 * Wires up the tile vocabulary every other service reads a tile through. It
 * imports nothing, so the vocabulary stays sayable wherever a tile is.
 */
@Module({
  controllers: [],
  exports: [TileService],
  imports: [],
  providers: [TileService],
})
export class TileModule {}
