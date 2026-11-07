import { ConfigurationModule } from "@coinagerie/configuration";
import { DeliveryModule } from "@coinagerie/output";
import { VocabularyModule } from "@coinagerie/vocabulary";
import { Module } from "@nestjs/common";

import { CheckService } from "./check.service";

/** Provides the in-process check and write behind the `check` executor. */
@Module({
  controllers: [],
  exports: [CheckService],
  imports: [ConfigurationModule, DeliveryModule, VocabularyModule],
  providers: [CheckService],
})
export class CheckModule {}
