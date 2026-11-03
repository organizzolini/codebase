import { Module } from "@nestjs/common";

import { JsonService } from "./json.service";

/**
 * Provides the JSON glossary format: rendering and strictly parsing a flat
 * object of words and definitions.
 */
@Module({
  controllers: [],
  exports: [JsonService],
  imports: [],
  providers: [JsonService],
})
export class JsonModule {}
