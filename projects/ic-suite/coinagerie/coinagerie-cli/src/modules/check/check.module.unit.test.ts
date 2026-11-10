import { ConfigurationModule } from "@coinagerie/configuration";
import { DeliveryModule } from "@coinagerie/output";
import { VocabularyModule } from "@coinagerie/vocabulary";
import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { CheckModule } from "./check.module";
import { CheckService } from "./check.service";

describe(CheckModule, () => {
  it("exports and provides CheckService", () => {
    expectModuleExports(CheckModule, CheckService);
    expectModuleProvides(CheckModule, CheckService);
    expectModuleImports(
      CheckModule,
      ConfigurationModule,
      DeliveryModule,
      VocabularyModule,
    );
  });
});
