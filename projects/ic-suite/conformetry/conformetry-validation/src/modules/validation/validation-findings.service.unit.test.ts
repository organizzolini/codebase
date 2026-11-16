import { beforeAll, describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { ValidationFindingsService } from "./validation-findings.service";

import type {
  TemplateDefinition,
  UnmatchedInstance,
} from "@conformetry/configuration";

const TEMPLATES: TemplateDefinition[] = [
  {
    directoryPath: "/w/configuration/templates/widget",
    filePaths: [],
    name: "widget",
  },
];

/** Builds an unmatched instance for `packages/widgets/src/modules/gears`. */
function buildUnmatched(args: {
  reason: "ambiguous" | "no-match";
  tiedTemplateNames: string[];
}): UnmatchedInstance {
  return {
    instance: {
      name: "gears",
      path: "/w/packages/widgets/src/modules",
    },
    reason: args.reason,
    tiedTemplateNames: args.tiedTemplateNames,
  };
}

describe(ValidationFindingsService, () => {
  let service: ValidationFindingsService;

  beforeAll(async () => {
    const built = await buildTestingModule(ValidationFindingsService);

    service = built.instance;
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(ValidationFindingsService);

    expect(instance).toBeInstanceOf(ValidationFindingsService);
  });

  describe("buildUnmatchedResults", () => {
    it("names the instance rather than the directory it sits in", () => {
      const [result] = service.buildUnmatchedResults({
        templates: TEMPLATES,
        unmatched: [
          buildUnmatched({ reason: "no-match", tiedTemplateNames: [] }),
        ],
      });

      expect(result?.filename).toBe("gears");
      expect(result?.instanceFilePath).toBe(
        "/w/packages/widgets/src/modules/gears",
      );
    });

    it("reports an unexplained path as an instance error", () => {
      const [result] = service.buildUnmatchedResults({
        templates: TEMPLATES,
        unmatched: [
          buildUnmatched({ reason: "no-match", tiedTemplateNames: [] }),
        ],
      });

      expect(result?.differences[0]?.differenceType).toBe("instance");
      expect(result?.differences[0]?.message).toContain("no template explains");
    });

    it("names the templates that tied when the match is ambiguous", () => {
      const [result] = service.buildUnmatchedResults({
        templates: TEMPLATES,
        unmatched: [
          buildUnmatched({
            reason: "ambiguous",
            tiedTemplateNames: ["alpha", "beta"],
          }),
        ],
      });

      expect(result?.differences[0]?.message).toContain("alpha, beta");
      expect(result?.differences[0]?.fix).toContain("distinguishing files");
    });

    it("points at the directory the templates share", () => {
      const [result] = service.buildUnmatchedResults({
        templates: TEMPLATES,
        unmatched: [
          buildUnmatched({ reason: "no-match", tiedTemplateNames: [] }),
        ],
      });

      expect(result?.templateFilePath).toBe("/w/configuration/templates");
    });

    it("names no directory when there are no templates to share one", () => {
      const [result] = service.buildUnmatchedResults({
        templates: [],
        unmatched: [
          buildUnmatched({ reason: "no-match", tiedTemplateNames: [] }),
        ],
      });

      expect(result?.templateFilePath).toBe("");
    });

    it("returns nothing when every instance matched", () => {
      expect(
        service.buildUnmatchedResults({ templates: TEMPLATES, unmatched: [] }),
      ).toStrictEqual([]);
    });
  });
});
