import { Module } from "@nestjs/common";

import { TreeModule } from "../tree/tree.module";

import { CustomizationService } from "./customization.service";

/**
 * NestJS module that provides the configured file-name counters.
 */
@Module({
  controllers: [],
  exports: [CustomizationService],
  imports: [TreeModule],
  providers: [CustomizationService],
})
export class CustomizationModule {}
