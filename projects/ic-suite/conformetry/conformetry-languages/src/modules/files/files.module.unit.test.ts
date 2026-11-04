import { describe, it } from "vitest";

import {
  expectModuleExports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { FilesModule } from "./files.module";
import { FilesService } from "./files.service";

describe(FilesModule, () => {
  it("exports and provides FilesService", () => {
    expectModuleExports(FilesModule, FilesService);
    expectModuleProvides(FilesModule, FilesService);
  });
});
