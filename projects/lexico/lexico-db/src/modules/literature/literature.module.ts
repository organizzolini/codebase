import { Module } from "@nestjs/common";

import { LiteratureService } from "./literature.service";

/**
 * TODO: Document the literature module.
 */
@Module({
  controllers: [],
  exports: [LiteratureService],
  imports: [],
  providers: [LiteratureService],
})
export class LiteratureModule {}
