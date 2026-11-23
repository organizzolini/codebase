import fs from "node:fs";
import path from "node:path";

import { ConfigService } from "@nestjs/config";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createTemporaryDirectory,
  failed,
  FakeProcessRunner,
  succeeded,
  writeFileTree,
} from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { TEMPORARY_ROOT } from "../../../testing/mocks";
import { ProcessRunnerService } from "../process-runner/process-runner.service";

import { CollectCodometerBaselineService } from "./collect-codometer-baseline.service";

import type { CapturedProcess } from "../process-runner/process-runner.types";

const FIND =
  'gh api repos/owner/repository/actions/artifacts?name=codometer-reports-main&per_page=30 --jq=[.artifacts[] | select(.expired == false and .workflow_run.head_branch == "main")][0].workflow_run.id';

describe(CollectCodometerBaselineService, () => {
  const moduleOptions = { mocks: [ConfigService, ProcessRunnerService] };

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  /** Builds the service over a scripted runner, as it runs on `main`. */
  const build = async (
    script: Record<string, CapturedProcess> = {},
    repository: string | undefined = "owner/repository",
  ): Promise<CollectCodometerBaselineService> => {
    vi.stubEnv("GITHUB_REPOSITORY", repository);

    const { module } = await buildTestingModule(
      CollectCodometerBaselineService,
      {
        providers: [
          { provide: ConfigService, useValue: new ConfigService() },
          {
            provide: ProcessRunnerService,
            useValue: new FakeProcessRunner(script, 0),
          },
        ],
      },
    );

    return await module.resolve(CollectCodometerBaselineService);
  };

  /** A workspace of project folders, each holding its report. */
  const workspace = (reports: Record<string, string>): string => {
    const root = createTemporaryDirectory("workspace", TEMPORARY_ROOT);

    for (const [directory, content] of Object.entries(reports)) {
      writeFileTree(root, {
        [`${directory}/codometer-report.json`]: content,
        [`${directory}/project.json`]: "{}",
      });
    }

    return root;
  };

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      CollectCodometerBaselineService,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(CollectCodometerBaselineService);
  });

  it("copies each project's report to the path it was found at", async () => {
    expect.hasAssertions();

    const service = await build({ [FIND]: succeeded("") });
    const root = workspace({
      "projects/a": "a",
      "projects/ic-suite/b/c": "c",
    });

    writeFileTree(root, { "projects/a/other.json": "not a report" });

    const report = service.collect(root);

    expect(report.lines).toStrictEqual([
      "ℹ️ No earlier codometer baseline was found; starting from this run's reports.",
      "📦 Gathered 2 codometer reports into codometer-baseline",
    ]);
    expect(
      fs.readFileSync(
        path.join(root, "codometer-baseline/projects/a/codometer-report.json"),
        "utf8",
      ),
    ).toBe("a");
    expect(
      fs.existsSync(
        path.join(root, "codometer-baseline/projects/a/other.json"),
      ),
    ).toBe(false);
  });

  it("keeps the workspace's own report and the examples' project report, but not a fixture's nested one", async () => {
    expect.hasAssertions();

    const service = await build({ [FIND]: succeeded("") });
    const root = workspace({
      "projects/ic-suite/codometer/codometer-examples": "examples",
    });

    writeFileTree(root, { "codometer-report.json": "workspace" });
    writeFileTree(root, {
      "projects/ic-suite/codometer/codometer-examples/x/codometer-report.json":
        "fixture",
    });

    service.collect(root);

    expect(
      fs
        .readdirSync(path.join(root, "codometer-baseline"), { recursive: true })
        .map(String)
        .filter((entry) => entry.endsWith("codometer-report.json"))
        .toSorted(),
    ).toStrictEqual([
      "codometer-report.json",
      "projects/ic-suite/codometer/codometer-examples/codometer-report.json",
    ]);
  });

  it("skips dependencies, caches and the baseline itself", async () => {
    expect.hasAssertions();

    const service = await build({ [FIND]: succeeded("") });
    const root = workspace({ "projects/a": "a" });

    writeFileTree(root, {
      "node_modules/p/codometer-report.json": "dependency",
      "node_modules/p/project.json": "{}",
    });
    writeFileTree(root, { ".nx/cache/codometer-report.json": "cache" });

    expect(service.collect(root).lines.at(-1)).toBe(
      "📦 Gathered 1 codometer report into codometer-baseline",
    );
  });

  it("carries the earlier baseline forward and lets this run's reports win", async () => {
    expect.hasAssertions();

    vi.stubEnv("GITHUB_REPOSITORY", "owner/repository");

    const root = workspace({ "projects/a": "fresh", "projects/b": "kept" });

    // What the download leaves behind: an older `a`, and a `b` this run did not build.
    writeFileTree(root, {
      "codometer-baseline/projects/a/codometer-report.json": "stale",
      "codometer-baseline/projects/b/codometer-report.json": "carried",
    });
    fs.rmSync(path.join(root, "projects/b/codometer-report.json"));

    const download = `gh run download 4242 --name=codometer-reports-main --dir=${path.join(root, "codometer-baseline")}`;
    const runner = new FakeProcessRunner(
      { [download]: succeeded(""), [FIND]: succeeded("4242\n") },
      0,
    );
    const { module } = await buildTestingModule(
      CollectCodometerBaselineService,
      {
        providers: [
          { provide: ConfigService, useValue: new ConfigService() },
          { provide: ProcessRunnerService, useValue: runner },
        ],
      },
    );
    const subject = await module.resolve(CollectCodometerBaselineService);

    expect(subject.collect(root).lines).toStrictEqual([
      "♻️ Carried 2 reports forward from the earlier baseline",
      "📦 Gathered 1 codometer report into codometer-baseline",
    ]);
    expect(
      fs.readFileSync(
        path.join(root, "codometer-baseline/projects/a/codometer-report.json"),
        "utf8",
      ),
    ).toBe("fresh");
    expect(
      fs.readFileSync(
        path.join(root, "codometer-baseline/projects/b/codometer-report.json"),
        "utf8",
      ),
    ).toBe("carried");
  });

  it("counts one carried report in the singular, and several dropped ones in the plural", async () => {
    expect.hasAssertions();

    const root = workspace({ "projects/a": "a" });
    const download = `gh run download 5 --name=codometer-reports-main --dir=${path.join(root, "codometer-baseline")}`;

    vi.stubEnv("GITHUB_REPOSITORY", "owner/repository");
    writeFileTree(root, {
      "codometer-baseline/projects/gone/codometer-report.json": "1",
      "codometer-baseline/projects/lost/codometer-report.json": "2",
    });

    const { module } = await buildTestingModule(
      CollectCodometerBaselineService,
      {
        providers: [
          { provide: ConfigService, useValue: new ConfigService() },
          {
            provide: ProcessRunnerService,
            useValue: new FakeProcessRunner(
              { [download]: succeeded(""), [FIND]: succeeded("5") },
              0,
            ),
          },
        ],
      },
    );
    const subject = await module.resolve(CollectCodometerBaselineService);
    const { lines } = subject.collect(root);

    expect(lines).toContain(
      "🧹 Dropped 2 reports of projects that no longer exist",
    );
  });

  it("drops a carried report whose project no longer exists", async () => {
    expect.hasAssertions();

    const root = workspace({ "projects/a": "a" });
    const download = `gh run download 7 --name=codometer-reports-main --dir=${path.join(root, "codometer-baseline")}`;
    const runner = new FakeProcessRunner(
      { [download]: succeeded(""), [FIND]: succeeded("7") },
      0,
    );

    vi.stubEnv("GITHUB_REPOSITORY", "owner/repository");
    writeFileTree(root, {
      "codometer-baseline/projects/gone/codometer-report.json": "old",
    });

    const { module } = await buildTestingModule(
      CollectCodometerBaselineService,
      {
        providers: [
          { provide: ConfigService, useValue: new ConfigService() },
          { provide: ProcessRunnerService, useValue: runner },
        ],
      },
    );
    const subject = await module.resolve(CollectCodometerBaselineService);

    expect(subject.collect(root).lines).toContain(
      "🧹 Dropped 1 report of projects that no longer exist",
    );
    expect(
      fs.existsSync(
        path.join(
          root,
          "codometer-baseline/projects/gone/codometer-report.json",
        ),
      ),
    ).toBe(false);
  });

  it.each([["finding it fails", { [FIND]: failed("api down") }, "api down"]])(
    "reports, and still gathers this run's reports, when %s",
    async (_name, script, reason) => {
      expect.hasAssertions();

      const service = await build(script);
      const root = workspace({ "projects/a": "a" });

      expect(service.collect(root).lines).toStrictEqual([
        `::warning::Gathering without the earlier codometer baseline: ${reason}`,
        "📦 Gathered 1 codometer report into codometer-baseline",
      ]);
    },
  );

  it.each([[""], ["null"]])(
    "starts from this run's reports when the artifact search answers %j",
    async (answer) => {
      expect.hasAssertions();

      const service = await build({ [FIND]: succeeded(answer) });

      expect(service.collect(workspace({})).lines[0]).toContain(
        "No earlier codometer baseline was found",
      );
    },
  );

  it("starts from this run's reports when the repository is unknown", async () => {
    expect.hasAssertions();

    const service = await build({}, "");

    expect(service.collect(workspace({})).lines[0]).toContain(
      "No earlier codometer baseline was found",
    );
  });

  it("reports a download that fails, and still gathers this run's reports", async () => {
    expect.hasAssertions();

    const root = workspace({ "projects/a": "a" });
    const download = `gh run download 9 --name=codometer-reports-main --dir=${path.join(root, "codometer-baseline")}`;

    vi.stubEnv("GITHUB_REPOSITORY", "owner/repository");

    const { module } = await buildTestingModule(
      CollectCodometerBaselineService,
      {
        providers: [
          { provide: ConfigService, useValue: new ConfigService() },
          {
            provide: ProcessRunnerService,
            useValue: new FakeProcessRunner(
              { [download]: failed("expired"), [FIND]: succeeded("9") },
              0,
            ),
          },
        ],
      },
    );
    const subject = await module.resolve(CollectCodometerBaselineService);

    expect(subject.collect(root).lines[0]).toBe(
      "::warning::Gathering without the earlier codometer baseline: expired",
    );
  });

  it("says so, and still makes the directory, when there are no reports", async () => {
    expect.hasAssertions();

    const service = await build({ [FIND]: succeeded("") });
    const root = createTemporaryDirectory("workspace", TEMPORARY_ROOT);

    expect(service.collect(root).lines.at(-1)).toBe(
      "ℹ️ No codometer reports were found for this run.",
    );
    expect(fs.existsSync(path.join(root, "codometer-baseline"))).toBe(true);
  });
});
