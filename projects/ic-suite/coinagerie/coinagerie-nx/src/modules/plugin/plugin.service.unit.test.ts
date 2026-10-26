import { Test } from "@nestjs/testing";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { createFakeWorkspace } from "../../../testing/fake-workspace";
import { OptionsService } from "../options/options.service";

import { PluginService } from "./plugin.service";

import type { FakeWorkspace } from "../../../testing/fake-workspace";

describe(PluginService, () => {
  let service: PluginService;
  let workspace: FakeWorkspace | undefined;

  /** Builds the fake workspace the case under test runs against. */
  function build(files: Record<string, string>): FakeWorkspace {
    workspace = createFakeWorkspace(files);

    return workspace;
  }

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [PluginService, OptionsService],
    }).compile();

    service = await module.resolve(PluginService);
  });

  afterEach(() => {
    workspace?.remove();
    workspace = undefined;
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(service).toBeDefined();
  });

  describe("inferTargets", () => {
    it("gives a target to each project that holds a configuration, and to no other", () => {
      expect.hasAssertions();

      const { root } = build({
        "packages/alpha/coinagerie.config.ts": "",
        "packages/alpha/project.json": "{}",
        "packages/beta/coinagerie.config.ts": "",
        "packages/beta/package.json": "{}",
        "packages/gamma/project.json": "{}",
      });

      const targets = service.inferTargets({
        configurationFiles: [
          "packages/alpha/coinagerie.config.ts",
          "packages/beta/coinagerie.config.ts",
        ],
        options: {},
        workspaceRoot: root,
      });

      // `gamma` holds no configuration, so Nx never matched it.
      expect([...targets.keys()]).toStrictEqual([
        "packages/alpha",
        "packages/beta",
      ]);
    });

    it("gives the workspace root a target when the root holds a configuration", () => {
      expect.hasAssertions();

      const { root } = build({
        "coinagerie.config.ts": "",
        "package.json": "{}",
      });

      expect([
        ...service
          .inferTargets({
            configurationFiles: ["coinagerie.config.ts"],
            options: {},
            workspaceRoot: root,
          })
          .keys(),
      ]).toStrictEqual(["."]);
    });

    it("gives no target to a configuration in a folder that is no project", () => {
      expect.hasAssertions();

      const { root } = build({
        "fixtures/sample/coinagerie.config.ts": "",
      });

      expect(
        service.inferTargets({
          configurationFiles: ["fixtures/sample/coinagerie.config.ts"],
          options: {},
          workspaceRoot: root,
        }).size,
      ).toBe(0);
    });

    it("gives a project holding two configuration files one set of targets", () => {
      expect.hasAssertions();

      const { root } = build({
        "packages/alpha/coinagerie.config.mjs": "",
        "packages/alpha/coinagerie.config.ts": "",
        "packages/alpha/project.json": "{}",
      });

      expect(
        service.inferTargets({
          configurationFiles: [
            "packages/alpha/coinagerie.config.mjs",
            "packages/alpha/coinagerie.config.ts",
          ],
          options: {},
          workspaceRoot: root,
        }).size,
      ).toBe(1);
    });

    it("infers nothing when Nx matched no configuration", () => {
      expect.hasAssertions();

      expect(
        service.inferTargets({
          configurationFiles: [],
          options: {},
          workspaceRoot: build({}).root,
        }).size,
      ).toBe(0);
    });

    it("runs the command with --check from the project, cached", () => {
      expect.hasAssertions();

      const { root } = build({
        "packages/alpha/coinagerie.config.ts": "",
        "packages/alpha/project.json": "{}",
      });
      const targets = service
        .inferTargets({
          configurationFiles: ["packages/alpha/coinagerie.config.ts"],
          options: {},
          workspaceRoot: root,
        })
        .get("packages/alpha");

      expect(targets).toMatchObject({
        "coinagerie-check": {
          cache: true,
          executor: "nx:run-commands",
          options: { command: "coinagerie --check", cwd: "{projectRoot}" },
        },
      });
    });

    it("names the configuration and every file the project holds as cache inputs", () => {
      expect.hasAssertions();

      const { root } = build({
        "packages/alpha/coinagerie.config.ts": "",
        "packages/alpha/project.json": "{}",
      });
      const inputs = service
        .inferTargets({
          configurationFiles: ["packages/alpha/coinagerie.config.ts"],
          options: {},
          workspaceRoot: root,
        })
        .get("packages/alpha")?.["coinagerie-check"]?.inputs;

      expect(inputs).toContain("{projectRoot}/coinagerie.config.ts");
      expect(inputs).toContain("{projectRoot}/coinagerie.config.mjs");
      expect(inputs).toContain("{projectRoot}/**/*");
    });

    it("adds every declared input after the ones it always names", () => {
      expect.hasAssertions();

      const { root } = build({
        "packages/alpha/coinagerie.config.ts": "",
        "packages/alpha/project.json": "{}",
      });
      const inputs = service
        .inferTargets({
          configurationFiles: ["packages/alpha/coinagerie.config.ts"],
          options: {
            inputs: ["{workspaceRoot}/GLOSSARY.md", "{workspaceRoot}/a/b.json"],
          },
          workspaceRoot: root,
        })
        .get("packages/alpha")?.["coinagerie-check"]?.inputs;

      expect(inputs?.slice(-3)).toStrictEqual([
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
          configurationFiles: ["packages/alpha/coinagerie.config.ts"],
          options: {
            checkTargetName: "glossary",
            command: "pnpm exec coinagerie",
          },
          workspaceRoot: root,
        })
        .get("packages/alpha");

      expect(Object.keys(targets ?? {})).toStrictEqual(["glossary"]);
      expect(targets?.["glossary"]?.options).toStrictEqual({
        command: "pnpm exec coinagerie --check",
        cwd: "{projectRoot}",
      });
    });
  });
});
