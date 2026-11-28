import { Module } from "@nestjs/common";

import { BoundarySearchService } from "./boundary-search.service";

/**
 * NestJS module that finds where a state of the sky starts or stops holding.
 * Exports {@link BoundarySearchService}, which sign, decan and half stays,
 * retrograde periods and aspect orbs use to find the true edge of a span a
 * sweep window cuts off.
 */
@Module({
  controllers: [],
  exports: [BoundarySearchService],
  imports: [],
  providers: [BoundarySearchService],
})
export class BoundarySearchModule {}
