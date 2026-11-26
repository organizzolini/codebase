import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { createTemporaryDirectory, FakeProcessRunner } from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { TEMPORARY_ROOT } from "../../../testing/mocks";
import { ProcessRunnerService } from "../process-runner/process-runner.service";

import { HELM_RELEASES, HELM_ROOT } from "./helm-releases.constants";
import { HelmReleasesService } from "./helm-releases.service";

const root = path.resolve(HELM_ROOT);

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

  it("lints every release strictly, layered with its values files", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner({});
    const subject = await build(runner);

    expect(subject.lint()).toBe(0);
    expect(runner.lines).toStrictEqual(
      HELM_RELEASES.map(
        ({ chart, namespace, strings = [], values }) =>
          `helm lint --strict ${root}/${chart} --namespace ${namespace} ${[
            ...values.map((file) => `--values ${root}/${chart}/${file}`),
            ...strings.map((entry) => `--set-string ${entry}`),
          ].join(" ")}`,
      ),
    );
  });

  it("stops linting at the first release that fails", async () => {
    expect.hasAssertions();

    const runner = new FakeProcessRunner({}, 0, {
      [`helm lint --strict ${root}/postgres *`]: 1,
    });
    const subject = await build(runner);

    expect(subject.lint()).toBe(1);
    expect(runner.lines).toHaveLength(2);
  });

  it("renders every release into its own file in the directory", async () => {
    expect.hasAssertions();

    const directory = path.join(
      createTemporaryDirectory("helm", TEMPORARY_ROOT),
      "nested",
    );
    const runner = new FakeProcessRunner({
      "helm template *": { status: 0, stderr: "", stdout: "" },
    });
    const subject = await build(runner);

    subject.render(directory);

    expect(fs.existsSync(directory)).toBe(true);
    expect(runner.lines).toStrictEqual(
      HELM_RELEASES.map(
        ({ chart, namespace, release, strings = [], values }) =>
          `helm template ${release} ${root}/${chart} --namespace ${namespace} ${[
            ...values.map((file) => `--values ${root}/${chart}/${file}`),
            ...strings.map((entry) => `--set-string ${entry}`),
          ].join(" ")}`,
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
      subject.render(directory);
    }).toThrow("bad chart");
  });
});
