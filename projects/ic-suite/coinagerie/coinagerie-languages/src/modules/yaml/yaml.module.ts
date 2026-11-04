import { Module } from "@nestjs/common";

import { YamlService } from "./yaml.service";

/** Provides the YAML tokenizer. */
@Module({
  controllers: [],
  exports: [YamlService],
  imports: [],
  providers: [YamlService],
})
export class YamlModule {}
