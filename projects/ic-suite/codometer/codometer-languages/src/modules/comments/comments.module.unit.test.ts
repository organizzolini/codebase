import { describe, it } from "vitest";

import { expectModuleProvides } from "@codebase/testing/nestjs";

import { CommentsModule } from "./comments.module";
import { CommentsService } from "./comments.service";
import { CssCommentsService } from "./css-comments.service";
import { HashCommentsService } from "./hash-comments.service";
import { HclCommentsService } from "./hcl-comments.service";
import { LanguageCommentsService } from "./language-comments.service";
import { SqlCommentsService } from "./sql-comments.service";
import { TypescriptCommentsService } from "./typescript-comments.service";
import { YamlCommentsService } from "./yaml-comments.service";

describe(CommentsModule, () => {
  it("provides every comment reader and the service that measures them", () => {
    expectModuleProvides(
      CommentsModule,
      CommentsService,
      CssCommentsService,
      HashCommentsService,
      HclCommentsService,
      LanguageCommentsService,
      SqlCommentsService,
      TypescriptCommentsService,
      YamlCommentsService,
    );
  });
});
