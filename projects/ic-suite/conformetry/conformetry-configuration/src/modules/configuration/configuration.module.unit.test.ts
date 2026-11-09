import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { InputModule } from "../input/input.module";
import { InstanceDiscoveryModule } from "../instance-discovery/instance-discovery.module";
import { InstanceGroupModule } from "../instance-group/instance-group.module";
import { RenderingModule } from "../rendering/rendering.module";
import { TemplateDiscoveryModule } from "../template-discovery/template-discovery.module";

import { ConfigurationModule } from "./configuration.module.js";
import { ConfigurationService } from "./configuration.service";

describe(ConfigurationModule, () => {
  it("provides and exports ConfigurationService", () => {
    expectModuleProvides(ConfigurationModule, ConfigurationService);
    expectModuleExports(ConfigurationModule, ConfigurationService);
  });

  it("imports the modules ConfigurationService is assembled from", () => {
    expectModuleImports(
      ConfigurationModule,
      InputModule,
      InstanceDiscoveryModule,
      InstanceGroupModule,
      RenderingModule,
      TemplateDiscoveryModule,
    );
  });
});
