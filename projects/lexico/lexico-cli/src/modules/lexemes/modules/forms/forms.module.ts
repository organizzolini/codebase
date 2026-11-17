import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Form } from "@codebase/lexico-db";

import { WordsModule } from "../words/words.module";

import { FormsService } from "./forms.service";
import { FormsBuilderGuardsService } from "./modules/forms-builder/forms-builder-guards.service";
import { FormsBuilderVerbService } from "./modules/forms-builder/forms-builder-verb.service";
import { FormsBuilderService } from "./modules/forms-builder/forms-builder.service";
import { FormsTransientWordsService } from "./modules/forms-builder/forms-transient-words.service";

/**
 * Forms ingestion and entity management module.
 *
 * Coordinates parsing of morphological form data, building Form entities,
 * and persisting forms along with their associated transient words.
 */
@Module({
  controllers: [],
  exports: [FormsBuilderService, FormsService],
  imports: [TypeOrmModule.forFeature([Form]), WordsModule],
  providers: [
    FormsService,
    FormsTransientWordsService,
    FormsBuilderGuardsService,
    FormsBuilderService,
    FormsBuilderVerbService,
  ],
})
export class FormsModule {}
