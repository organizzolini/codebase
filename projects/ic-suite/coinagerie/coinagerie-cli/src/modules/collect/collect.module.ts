import { ConfigurationModule } from "@coinagerie/configuration";
import {
  ComparisonModule,
  DeliveryModule,
  MarkdownModule,
} from "@coinagerie/output";
import { VocabularyModule } from "@coinagerie/vocabulary";
import { Module } from "@nestjs/common";

import { LoggerModule } from "@codebase/observability";

import { CollectCommand } from "./collect.command";

/**
 * Wires the `collect` command to the layers it composes: configuration reads
 * the file, vocabulary collects the words, and output compares, renders, and
 * writes the glossaries. The command calls them in order and sets the exit
 * code.
 */
@Module({
  controllers: [],
  exports: [CollectCommand],
  imports: [
    ComparisonModule,
    ConfigurationModule,
    DeliveryModule,
    LoggerModule,
    MarkdownModule,
    VocabularyModule,
  ],
  providers: [CollectCommand],
})
export class CollectModule {}
