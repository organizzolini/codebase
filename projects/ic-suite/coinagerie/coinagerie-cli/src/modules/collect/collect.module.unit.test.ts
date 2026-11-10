import { ConfigurationModule } from "@coinagerie/configuration";
import {
  ComparisonModule,
  DeliveryModule,
  JsonModule,
  MarkdownModule,
} from "@coinagerie/output";
import { VocabularyModule } from "@coinagerie/vocabulary";
import { describe, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleExports,
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { CollectCommand } from "./collect.command";
import { CollectModule } from "./collect.module";

describe(CollectModule, () => {
  it("exports and provides CollectCommand", () => {
    expectModuleExports(CollectModule, CollectCommand);
    expectModuleProvides(CollectModule, CollectCommand);
    expectModuleImports(
      CollectModule,
      ComparisonModule,
      ConfigurationModule,
      DeliveryModule,
      JsonModule,
      LoggerModule,
      MarkdownModule,
      VocabularyModule,
    );
  });
});
