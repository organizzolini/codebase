import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { PullRequestModule } from "../pull-request/pull-request.module";

import { OrganizationProjectCommand } from "./organization-project.command";
import { OrganizationProjectModule } from "./organization-project.module";

describe(OrganizationProjectModule, () => {
  it("imports the pull request module", () => {
    expectModuleImports(OrganizationProjectModule, PullRequestModule);
  });

  it("provides its command", () => {
    expectModuleProvides(OrganizationProjectModule, OrganizationProjectCommand);
  });

  it("exports its command", () => {
    expectModuleExports(OrganizationProjectModule, OrganizationProjectCommand);
  });
});
