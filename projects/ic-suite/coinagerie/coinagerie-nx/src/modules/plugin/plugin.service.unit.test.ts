import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { createFakeWorkspace } from "../../../testing/fake-workspace";
import { OptionsService } from "../options/options.service";

import { PluginService } from "./plugin.service";

import type { FakeWorkspace } from "../../../testing/fake-workspace";
import type { TestingModuleOptions } from "@codebase/testing/nestjs";

/** What the PluginService is built with. */
const DEPENDENCIES = {
  providers: [OptionsService],
} satisfies TestingModuleOptions;

/** The registration every case runs with. */
const OPTIONS = { projectConfigurationPath: "coinagerie.config.ts" };

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
        "packages/alpha/coinagerie.config.ts": "",
        "packages/alpha/project.json": "{}",
        "packages/beta/coinagerie.config.ts": "",
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
        "packages/alpha/coinagerie.config.ts": "",
        "packages/alpha/project.json": "{}",
        "packages/beta/configuration/coinagerie.config.ts": "",
        "packages/beta/project.json": "{}",
      });

      const targets = service.inferTargets({
        options: {
          projectConfigurationPath: "configuration/coinagerie.config.ts",
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
        "coinagerie.config.ts": "",
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
        "fixtures/sample/coinagerie.config.ts": "",
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
          "packages/alpha/coinagerie.config.ts": "",
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
        "packages/alpha/coinagerie.config.ts": "",
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

    it("runs the command with the configuration path, cached", () => {
      expect.hasAssertions();

      const { root } = build({
        "packages/alpha/coinagerie.config.ts": "",
        "packages/alpha/project.json": "{}",
      });
      const targets = service
        .inferTargets({
          options: OPTIONS,
          projectFiles: ["packages/alpha/project.json"],
          workspaceRoot: root,
        })
        .get("packages/alpha");

      expect(targets).toMatchObject({
        "coinagerie-check": {
          cache: true,
          executor: "@coinagerie/nx:check",
          options: {
            command: "coinagerie",
            projectConfigurationPath: "coinagerie.config.ts",
          },
        },
      });
    });

    it("names the configured configuration and every file the project holds as cache inputs", () => {
      expect.hasAssertions();

      const { root } = build({
        "packages/alpha/configuration/coinagerie.config.ts": "",
        "packages/alpha/project.json": "{}",
      });
      const inputs = service
        .inferTargets({
          options: {
            projectConfigurationPath: "configuration/coinagerie.config.ts",
          },
          projectFiles: ["packages/alpha/project.json"],
          workspaceRoot: root,
        })
        .get("packages/alpha")?.["coinagerie-check"]?.inputs;

      expect(inputs).toStrictEqual([
        "{projectRoot}/configuration/coinagerie.config.ts",
        "{projectRoot}/**/*",
      ]);
    });

    it("adds every declared input after the ones it always names", () => {
      expect.hasAssertions();

      const { root } = build({
        "packages/alpha/coinagerie.config.ts": "",
        "packages/alpha/project.json": "{}",
      });
      const inputs = service
        .inferTargets({
          options: {
            ...OPTIONS,
            inputs: ["{workspaceRoot}/GLOSSARY.md", "{workspaceRoot}/a/b.json"],
          },
          projectFiles: ["packages/alpha/project.json"],
          workspaceRoot: root,
        })
        .get("packages/alpha")?.["coinagerie-check"]?.inputs;

      expect(inputs).toStrictEqual([
        "{projectRoot}/coinagerie.config.ts",
        "{projectRoot}/**/*",
        "{workspaceRoot}/GLOSSARY.md",
        "{workspaceRoot}/a/b.json",
      ]);
    });

    it("honors a registered target name and command", () => {
      expect.hasAssertions();

      const { root } = build({
        "packages/alpha/coinagerie.config.ts": "",
        "packages/alpha/project.json": "{}",
      });
      const targets = service
        .inferTargets({
          options: {
            ...OPTIONS,
            checkTargetName: "glossary",
            command: "pnpm exec coinagerie",
          },
          projectFiles: ["packages/alpha/project.json"],
          workspaceRoot: root,
        })
        .get("packages/alpha");

      expect(Object.keys(targets ?? {})).toStrictEqual(["glossary"]);
      expect(targets?.["glossary"]?.options).toStrictEqual({
        command: "pnpm exec coinagerie",
        projectConfigurationPath: "coinagerie.config.ts",
      });
    });
  });
});
