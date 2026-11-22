import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { createFakeWorkspace } from "../../../testing/fake-workspace";
import { OptionsService } from "../options/options.service";

import { PluginService } from "./plugin.service";

import type { FakeWorkspace } from "../../../testing/fake-workspace";
import type { InferredTargets } from "./plugin.types";
import type { TestingModuleOptions } from "@codebase/testing/nestjs";

/** What the PluginService is built with. */
const DEPENDENCIES = {
  providers: [OptionsService],
} satisfies TestingModuleOptions;

/** The registration every case runs with. */
const OPTIONS = { projectConfigurationPath: "codometer.config.ts" };

describe(PluginService, () => {
  let service: PluginService;
  let workspace: FakeWorkspace | undefined;

  /** Builds the fake workspace the case under test runs against. */
  function build(files: Record<string, string>): FakeWorkspace {
    workspace = createFakeWorkspace(files);

    return workspace;
  }

  beforeAll(async () => {
    ({ instance: service } = await buildTestingModule(
      PluginService,
      DEPENDENCIES,
    ));
  });

  afterEach(() => {
    workspace?.remove();
    workspace = undefined;
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(PluginService, DEPENDENCIES);

    expect(instance).toBeInstanceOf(PluginService);
  });

  describe("inferTargets", () => {
    it("gives a target to each project that holds the configuration, and to no other", () => {
      expect.hasAssertions();

      const { root } = build({
        "packages/alpha/codometer.config.ts": "",
        "packages/alpha/project.json": "{}",
        "packages/beta/codometer.config.ts": "",
        "packages/beta/package.json": '{"name":"beta"}',
        "packages/gamma/project.json": "{}",
      });

      const targets = service.inferTargets({
        options: OPTIONS,
        projectFiles: [
          "packages/alpha/project.json",
          "packages/beta/package.json",
          "packages/gamma/project.json",
        ],
        workspaceRoot: root,
      });

      // `gamma` is a project but holds no configuration.
      expect([...targets.keys()]).toStrictEqual([
        "packages/alpha",
        "packages/beta",
      ]);
    });

    it("looks for the configuration only at the configured path", () => {
      expect.hasAssertions();

      const { root } = build({
        "packages/alpha/codometer.config.ts": "",
        "packages/alpha/project.json": "{}",
        "packages/beta/configuration/codometer.config.ts": "",
        "packages/beta/project.json": "{}",
      });

      const targets = service.inferTargets({
        options: {
          projectConfigurationPath: "configuration/codometer.config.ts",
        },
        projectFiles: [
          "packages/alpha/project.json",
          "packages/beta/project.json",
        ],
        workspaceRoot: root,
      });

      expect([...targets.keys()]).toStrictEqual(["packages/beta"]);
    });

    it("gives the workspace root a target when the root holds the configuration", () => {
      expect.hasAssertions();

      const { root } = build({
        "codometer.config.ts": "",
        "package.json": '{"name":"root"}',
      });

      expect([
        ...service
          .inferTargets({
            options: OPTIONS,
            projectFiles: ["package.json"],
            workspaceRoot: root,
          })
          .keys(),
      ]).toStrictEqual(["."]);
    });

    it("gives no target to a configuration in a folder that is no project", () => {
      expect.hasAssertions();

      const { root } = build({
        "fixtures/sample/codometer.config.ts": "",
        "fixtures/sample/package.json": "{}",
      });

      expect(
        service.inferTargets({
          options: OPTIONS,
          projectFiles: ["fixtures/sample/package.json"],
          workspaceRoot: root,
        }).size,
      ).toBe(0);
    });

    it.each([
      ["a package.json without a name", "{}"],
      ["a package.json that is not JSON", "not json"],
      ["a package.json holding a non-object", "7"],
      ["a package.json with a blank name", '{"name":""}'],
    ])(
      "gives no target to a folder holding only %s",
      (_description, manifest) => {
        expect.hasAssertions();

        const { root } = build({
          "packages/alpha/codometer.config.ts": "",
          "packages/alpha/package.json": manifest,
        });

        expect(
          service.inferTargets({
            options: OPTIONS,
            projectFiles: ["packages/alpha/package.json"],
            workspaceRoot: root,
          }).size,
        ).toBe(0);
      },
    );

    it("gives a project holding two manifests one set of targets", () => {
      expect.hasAssertions();

      const { root } = build({
        "packages/alpha/codometer.config.ts": "",
        "packages/alpha/package.json": '{"name":"alpha"}',
        "packages/alpha/project.json": "{}",
      });

      expect(
        service.inferTargets({
          options: OPTIONS,
          projectFiles: [
            "packages/alpha/package.json",
            "packages/alpha/project.json",
          ],
          workspaceRoot: root,
        }).size,
      ).toBe(1);
    });

    it("infers nothing when Nx matched no project", () => {
      expect.hasAssertions();

      expect(
        service.inferTargets({
          options: OPTIONS,
          projectFiles: [],
          workspaceRoot: build({}).root,
        }).size,
      ).toBe(0);
    });

    it("refuses a registration that names no configuration path", () => {
      expect.hasAssertions();

      expect(() =>
        service.inferTargets({
          options: {},
          projectFiles: [],
          workspaceRoot: build({}).root,
        }),
      ).toThrow("projectConfigurationPath is required");
    });

    /** Infers the targets of one project holding the configuration. */
    function inferAlpha(
      options: Record<string, unknown> = OPTIONS,
    ): InferredTargets | undefined {
      const { root } = build({
        "packages/alpha/codometer.config.ts": "",
        "packages/alpha/configuration/codometer.config.ts": "",
        "packages/alpha/project.json": "{}",
      });

      return service
        .inferTargets({
          options,
          projectFiles: ["packages/alpha/project.json"],
          workspaceRoot: root,
        })
        .get("packages/alpha");
    }

    it("infers a source-only limit target that gates the main configuration, needs no build and writes nothing", () => {
      expect.hasAssertions();

      const target = inferAlpha()?.["codometer-limit"];

      expect(target).toMatchObject({
        cache: true,
        executor: "@codometer/nx:measure",
        options: {
          check: true,
          command: "codometer",
          config: "codometer.config.ts",
        },
        outputs: [],
      });
      expect(target?.dependsOn).toBeUndefined();
    });

    it("points the limit target at the project's limit configuration when it holds one", () => {
      expect.hasAssertions();

      const targets = inferAlpha({
        ...OPTIONS,
        limitConfigurationPath: "configuration/codometer.config.ts",
      });

      expect(targets?.["codometer-limit"]?.options["config"]).toBe(
        "configuration/codometer.config.ts",
      );
      expect(targets?.["codometer-weigh"]?.options["config"]).toBe(
        "codometer.config.ts",
      );
    });

    it("falls back to the main configuration when the project holds no limit configuration", () => {
      expect.hasAssertions();

      const targets = inferAlpha({
        ...OPTIONS,
        limitConfigurationPath: "configuration/absent.config.ts",
      });

      expect(targets?.["codometer-limit"]?.options["config"]).toBe(
        "codometer.config.ts",
      );
    });

    it("infers a packaged-size weigh target that waits for the build and keeps the report", () => {
      expect.hasAssertions();

      expect(inferAlpha()?.["codometer-weigh"]).toStrictEqual({
        cache: true,
        configurations: {
          check: { check: true },
          write: { outputMarkdown: true },
        },
        defaultConfiguration: "check",
        dependsOn: ["build"],
        executor: "@codometer/nx:measure",
        inputs: [
          "production",
          "^production",
          "!{projectRoot}/codometer-report.json",
        ],
        options: {
          command: "codometer",
          config: "codometer.config.ts",
          outputJson: true,
        },
        outputs: [
          "{projectRoot}/codometer-report.json",
          "{projectRoot}/documentation/codometer.md",
        ],
      });
    });

    it("judges every project file for the limit target", () => {
      expect.hasAssertions();

      expect(inferAlpha()?.["codometer-limit"]?.inputs).toStrictEqual([
        "default",
      ]);
    });

    it("adds every declared input after the ones it always names, to both targets", () => {
      expect.hasAssertions();

      const targets = inferAlpha({
        ...OPTIONS,
        inputs: ["{workspaceRoot}/a.json", "{workspaceRoot}/a/b.json"],
      });

      for (const name of ["codometer-limit", "codometer-weigh"]) {
        expect(targets?.[name]?.inputs.slice(-2)).toStrictEqual([
          "{workspaceRoot}/a.json",
          "{workspaceRoot}/a/b.json",
        ]);
      }
    });

    it("honors registered target names, command and configuration path", () => {
      expect.hasAssertions();

      const targets = inferAlpha({
        command: "pnpm exec codometer",
        limitTargetName: "fast",
        projectConfigurationPath: "configuration/codometer.config.ts",
        weighTargetName: "heavy",
      });

      expect(Object.keys(targets ?? {})).toStrictEqual(["fast", "heavy"]);
      expect(targets?.["fast"]?.options).toMatchObject({
        command: "pnpm exec codometer",
        config: "configuration/codometer.config.ts",
      });
    });
  });
});
