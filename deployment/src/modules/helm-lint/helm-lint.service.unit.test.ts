import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { createTemporaryDirectory, FakeProcessRunner } from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { TEMPORARY_ROOT } from "../../../testing/mocks";
import { HelmReleasesService } from "../helm-releases/helm-releases.service";
import { ProcessRunnerService } from "../process-runner/process-runner.service";

import { HelmLintService } from "./helm-lint.service";

/** Two charts, one with project values. */
const charts = (): string => {
  const root = createTemporaryDirectory("charts", TEMPORARY_ROOT);
  const files = {
    "infrastructure/helm/alpha/Chart.yaml": "name: alpha",
    "infrastructure/helm/alpha/values/base.yaml": 'image:\n  tag: ""',
    "projects/common/store/infrastructure/helm/beta/Chart.yaml": "name: beta",
    "projects/common/store/infrastructure/helm/beta/values/base.yaml": "a: 1",
    "projects/group/web/infrastructure/helm-values.yaml": "chart: alpha",
  };

  for (const [name, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
    fs.writeFileSync(path.join(root, name), content);
  }

  return root;
};

/** The helm arguments the two charts' releases are given. */
const arguments_ = (root: string): string[] => {
  const directories: Record<string, string> = {
    alpha: "infrastructure/helm/alpha",
    beta: "projects/common/store/infrastructure/helm/beta",
  };
  const base = (chart: string): string =>
    `${root}/${directories[chart]} --namespace default --values ${root}/${directories[chart]}/values/base.yaml`;
  const web = `--values ${root}/projects/group/web/infrastructure/helm-values.yaml`;
  const tag = "--set-string image.tag=0.0.0";

  return [
    `${base("alpha")} ${tag}`,
    base("beta"),
    `${base("alpha")} ${web} ${tag}`,
  ];
};

/** Builds the service over a scripted runner. */
const build = async (runner: FakeProcessRunner): Promise<HelmLintService> => {
  const { module } = await buildTestingModule(HelmLintService, {
    providers: [
      HelmReleasesService,
      { provide: ProcessRunnerService, useValue: runner },
    ],
  });

  return module.resolve(HelmLintService);
};

describe(HelmLintService, () => {
  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(HelmLintService, {
      mocks: [HelmReleasesService, ProcessRunnerService],
    });

    expect(instance).toBeInstanceOf(HelmLintService);
  });

  it("lints every discovered release strictly, with its values", async () => {
    expect.hasAssertions();

    const root = charts();
    const runner = new FakeProcessRunner({});
    const subject = await build(runner);

    expect(subject.lint(root)).toBe(0);
    expect(runner.lines).toStrictEqual(
      arguments_(root).map((line) => `helm lint --strict ${line}`),
    );
  });

  it("stops linting at the first release that fails", async () => {
    expect.hasAssertions();

    const root = charts();
    const runner = new FakeProcessRunner({}, 0, {
      [`helm lint --strict ${root}/infrastructure/helm/alpha *`]: 1,
    });
    const subject = await build(runner);

    expect(subject.lint(root)).toBe(1);
    expect(runner.lines).toHaveLength(1);
  });
});
