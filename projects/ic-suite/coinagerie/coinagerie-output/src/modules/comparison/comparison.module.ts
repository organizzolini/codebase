import { Module } from "@nestjs/common";

import { ComparisonService } from "./comparison.service";

/**
 * Provides the comparison of a glossary with the codebase's vocabulary.
 */
@Module({
  controllers: [],
  exports: [ComparisonService],
  imports: [],
  providers: [ComparisonService],
})
export class ComparisonModule {}
