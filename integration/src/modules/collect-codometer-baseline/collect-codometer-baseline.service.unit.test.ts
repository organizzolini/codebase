import fs from "node:fs";
import path from "node:path";

import { beforeAll, describe, expect, it } from "vitest";

import { createTemporaryDirectory, writeFileTree } from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { TEMPORARY_ROOT } from "../../../testing/mocks";

import { CollectCodometerBaselineService } from "./collect-codometer-baseline.service";

describe(CollectCodometerBaselineService, () => {
  let service: CollectCodometerBaselineService;

  beforeAll(async () => {
    const { module } = await buildTestingModule(
      CollectCodometerBaselineService,
    );

    service = await module.resolve(CollectCodometerBaselineService);
  });

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      CollectCodometerBaselineService,
    );

    expect(instance).toBeInstanceOf(CollectCodometerBaselineService);
  });

  it("copies each report to the path it was found at", () => {
    expect.hasAssertions();

    const root = createTemporaryDirectory("workspace", TEMPORARY_ROOT);

    writeFileTree(root, { "projects/a/codometer-report.json": "a" });
    writeFileTree(root, { "projects/ic-suite/b/c/codometer-report.json": "c" });
    writeFileTree(root, { "projects/a/codometer-weigh-report.json": "w" });
    writeFileTree(root, { "projects/a/other.json": "not a report" });

    const report = service.collect(root);

    expect(report.lines).toStrictEqual([
      "📦 Gathered 3 codometer reports into codometer-baseline",
    ]);
    expect(
      fs.readFileSync(
        path.join(root, "codometer-baseline/projects/a/codometer-report.json"),
        "utf8",
      ),
    ).toBe("a");
    expect(
      fs.existsSync(
        path.join(
          root,
          "codometer-baseline/projects/ic-suite/b/c/codometer-report.json",
        ),
      ),
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(root, "codometer-baseline/projects/a/other.json"),
      ),
    ).toBe(false);
  });

  it("skips the examples, dependencies, and the baseline itself", () => {
    expect.hasAssertions();

    const root = createTemporaryDirectory("workspace", TEMPORARY_ROOT);

    writeFileTree(root, { "projects/a/codometer-report.json": "a" });
    writeFileTree(root, {
      "projects/ic-suite/codometer/codometer-examples/x/codometer-report.json":
        "example",
    });
    writeFileTree(root, {
      "node_modules/p/codometer-report.json": "dependency",
    });
    writeFileTree(root, { ".nx/cache/codometer-report.json": "cache" });

    expect(service.collect(root).lines).toStrictEqual([
      "📦 Gathered 1 codometer report into codometer-baseline",
    ]);
    expect(
      fs.readdirSync(path.join(root, "codometer-baseline/projects")),
    ).toStrictEqual(["a"]);
  });

  it("says so, and still makes the directory, when there are no reports", () => {
    expect.hasAssertions();

    const root = createTemporaryDirectory("workspace", TEMPORARY_ROOT);

    expect(service.collect(root).lines).toStrictEqual([
      "ℹ️ No codometer reports were found for this run.",
    ]);
    expect(fs.existsSync(path.join(root, "codometer-baseline"))).toBe(true);
  });
});
