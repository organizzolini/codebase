import { Module } from "@nestjs/common";

import { TreeService } from "./tree.service";

/**
 * NestJS module that provides the directory breadth and depth measurements.
 */
@Module({
  controllers: [],
  exports: [TreeService],
  imports: [],
  providers: [TreeService],
})
export class TreeModule {}
