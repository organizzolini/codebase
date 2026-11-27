import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { createTemporaryDirectory, FakeProcessRunner } from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { TEMPORARY_ROOT } from "../../../testing/mocks";
import { HelmReleasesService } from "../helm-releases/helm-releases.service";
import { ProcessRunnerService } from "../process-runner/process-runner.service";

import { HelmLintService } from "./helm-lint.service";

/** Two charts: `alpha` with a variant and empty tag, `beta` plain. */
const charts = (): string => {
  const root = createTemporaryDirectory("charts", TEMPORARY_ROOT);
  const files = {
    "alpha/Chart.yaml": "name: alpha",
    "alpha/values/base.yaml": 'image:\n  tag: ""',
    "alpha/values/web.yaml": "a: 1",
    "beta/Chart.yaml": "name: beta",
    "beta/values/base.yaml": "a: 1",
  };

  for (const [name, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
    fs.writeFileSync(path.join(root, name), content);
  }

  return root;
};

/** The helm arguments the two charts' releases are given. */
const arguments_ = (root: string): string[] => {
  const base = (chart: string): string =>
    `${root}/${chart} --namespace default --values ${root}/${chart}/values/base.yaml`;
  const web = `--values ${root}/alpha/values/web.yaml`;
  const tag = "--set-string image.tag=0.0.0";

  return [
    `${base("alpha")} ${tag}`,
    `${base("alpha")} ${web} ${tag}`,
    base("beta"),
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
      [`helm lint --strict ${root}/alpha *`]: 1,
    });
    const subject = await build(runner);

    expect(subject.lint(root)).toBe(1);
    expect(runner.lines).toHaveLength(1);
  });
});
