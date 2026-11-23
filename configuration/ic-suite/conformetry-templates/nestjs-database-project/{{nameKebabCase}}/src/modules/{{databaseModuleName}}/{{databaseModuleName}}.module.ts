import { Module } from "@nestjs/common";

import { {{persistenceModuleImport}} } from "@codebase/persistence";

import { {{databaseEntitiesConstant}} } from "./data-source.constants";
import { {{serviceClassName}} } from "./{{databaseModuleName}}.service";

@Module({
  controllers: [],
  exports: [{{serviceClassName}}],
  imports: [
    {{persistenceModuleName}}.forRoot({
      entities: [...{{databaseEntitiesConstant}}],
      project: {{databaseProjectExpression}},
    }),
  ],
  providers: [{{serviceClassName}}],
})
export class {{moduleClassName}} {}
