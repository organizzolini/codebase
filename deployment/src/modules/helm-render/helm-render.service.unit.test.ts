import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { createTemporaryDirectory, FakeProcessRunner } from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { TEMPORARY_ROOT } from "../../../testing/mocks";
import { HelmReleasesService } from "../helm-releases/helm-releases.service";
import { ProcessRunnerService } from "../process-runner/process-runner.service";

import { HelmRenderService } from "./helm-render.service";

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
const build = async (runner: FakeProcessRunner): Promise<HelmRenderService> => {
  const { module } = await buildTestingModule(HelmRenderService, {
    providers: [
      HelmReleasesService,
      { provide: ProcessRunnerService, useValue: runner },
    ],
  });

  return module.resolve(HelmRenderService);
};

describe(HelmRenderService, () => {
  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(HelmRenderService, {
      mocks: [HelmReleasesService, ProcessRunnerService],
    });

    expect(instance).toBeInstanceOf(HelmRenderService);
  });

  it("renders every release into its own file in the directory", async () => {
    expect.hasAssertions();

    const root = charts();
    const directory = path.join(
      createTemporaryDirectory("helm", TEMPORARY_ROOT),
      "nested",
    );
    const runner = new FakeProcessRunner({
      "helm template *": { status: 0, stderr: "", stdout: "" },
    });
    const subject = await build(runner);

    subject.render(directory, root);

    expect(fs.existsSync(directory)).toBe(true);
    expect(runner.lines).toStrictEqual(
      ["alpha", "alpha-web", "beta"].map(
        (release, index) =>
          `helm template ${release} ${arguments_(root)[index] ?? ""}`,
      ),
    );
  });

  it("fails a render that helm fails, naming the command", async () => {
    expect.hasAssertions();

    const directory = createTemporaryDirectory("helm", TEMPORARY_ROOT);
    const runner = new FakeProcessRunner({
      "helm template *": { status: 1, stderr: "bad chart", stdout: "" },
    });
    const subject = await build(runner);

    expect(() => {
      subject.render(directory, charts());
    }).toThrow("bad chart");
  });
});
