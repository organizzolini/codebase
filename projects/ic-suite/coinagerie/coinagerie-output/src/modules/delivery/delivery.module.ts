import { Module } from "@nestjs/common";

import { ComparisonModule } from "../comparison/comparison.module";
import { MarkdownModule } from "../markdown/markdown.module";

import { DeliveryService } from "./delivery.service";

/**
 * Provides checking and writing every glossary destination, wired to every
 * format a destination can be written in.
 */
@Module({
  controllers: [],
  exports: [DeliveryService],
  imports: [ComparisonModule, MarkdownModule],
  providers: [DeliveryService],
})
export class DeliveryModule {}
