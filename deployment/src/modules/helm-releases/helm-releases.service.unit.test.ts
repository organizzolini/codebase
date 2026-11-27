import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { createTemporaryDirectory, FakeProcessRunner } from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { TEMPORARY_ROOT } from "../../../testing/mocks";
import { ProcessRunnerService } from "../process-runner/process-runner.service";

import { HelmReleasesService } from "./helm-releases.service";

/** Charts `alpha` and `beta`, and a project that owns values for `alpha`. */
const workspaceFiles = (): string => {
  const root = createTemporaryDirectory("workspace", TEMPORARY_ROOT);
  const files = {
    "infrastructure/helm/alpha/Chart.yaml": "name: alpha",
    "infrastructure/helm/alpha/values/base.yaml": 'image:\n  tag: ""',
    "infrastructure/helm/beta/Chart.yaml": "name: beta",
    "infrastructure/helm/beta/values/base.yaml": "a: 1",
    "projects/group/web/infrastructure/helm-values.yaml": "chart: alpha\na: 1",
  };

  for (const [name, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
    fs.writeFileSync(path.join(root, name), content);
  }

  return root;
};

/** The helm arguments the two charts' and the project's releases are given. */
const arguments_ = (workspace: string): string[] => {
  const root = `${workspace}/infrastructure/helm`;
  const base = (chart: string): string =>
    `${root}/${chart} --namespace default --values ${root}/${chart}/values/base.yaml`;
  const web = `--values ${workspace}/projects/group/web/infrastructure/helm-values.yaml`;
  const tag = "--set-string image.tag=0.0.0";

  return [
    `${base("alpha")} ${tag}`,
    base("beta"),
    `${base("alpha")} ${web} ${tag}`,
  ];
};

/** Builds the service over a scripted runner. */
const build = async (
  runner: FakeProcessRunner,
): Promise<HelmReleasesService> => {
  const { module } = await buildTestingModule(HelmReleasesService, {
    providers: [{ provide: ProcessRunnerService, useValue: runner }],
  });

  return module.resolve(HelmReleasesService);
};

describe(HelmReleasesService, () => {
  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(HelmReleasesService, {
      mocks: [ProcessRunnerService],
    });

    expect(instance).toBeInstanceOf(HelmReleasesService);
  });

  it("lints every discovered release strictly, with its values", async () => {
    expect.hasAssertions();

    const workspace = workspaceFiles();
    const root = `${workspace}/infrastructure/helm`;
    const runner = new FakeProcessRunner({});
    const subject = await build(runner);

    expect(subject.lint(root, workspace)).toBe(0);
    expect(runner.lines).toStrictEqual(
      arguments_(workspace).map((line) => `helm lint --strict ${line}`),
    );
  });

  it("stops linting at the first release that fails", async () => {
    expect.hasAssertions();

    const workspace = workspaceFiles();
    const root = `${workspace}/infrastructure/helm`;
    const runner = new FakeProcessRunner({}, 0, {
      [`helm lint --strict ${root}/alpha *`]: 1,
    });
    const subject = await build(runner);

    expect(subject.lint(root, workspace)).toBe(1);
    expect(runner.lines).toHaveLength(1);
  });

  it("renders every release into its own file in the directory", async () => {
    expect.hasAssertions();

    const workspace = workspaceFiles();
    const root = `${workspace}/infrastructure/helm`;
    const directory = path.join(
      createTemporaryDirectory("helm", TEMPORARY_ROOT),
      "nested",
    );
    const runner = new FakeProcessRunner({
      "helm template *": { status: 0, stderr: "", stdout: "" },
    });
    const subject = await build(runner);

    subject.render(directory, root, workspace);

    expect(fs.existsSync(directory)).toBe(true);
    expect(runner.lines).toStrictEqual(
      ["alpha", "beta", "alpha-web"].map(
        (release, index) =>
          `helm template ${release} ${arguments_(workspace)[index] ?? ""}`,
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
      const workspace = workspaceFiles();

      subject.render(directory, `${workspace}/infrastructure/helm`, workspace);
    }).toThrow("bad chart");
  });
});
