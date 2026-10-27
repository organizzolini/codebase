import { Module } from "@nestjs/common";

import { FoldingService } from "./folding.service";

/** Provides the folding of word forms into headwords. */
@Module({
  controllers: [],
  exports: [FoldingService],
  imports: [],
  providers: [FoldingService],
})
export class FoldingModule {}
