import { createMock } from "@golevelup/ts-vitest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { expectLoggerContext } from "@codebase/observability/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { expectProcessExitOne } from "../../../testing/mocks";
import { ConformetryGeneratorsCommand } from "../conformetry-generators/conformetry-generators.command";
import { ConventionalConfigCommand } from "../conventional-config/conventional-config.command";
import { DevcontainerConfigurationCommand } from "../devcontainer-configuration/devcontainer-configuration.command";
import { InstalledSkillsCommand } from "../installed-skills/installed-skills.command";
import { PackageManifestsCommand } from "../package-manifests/package-manifests.command";
import { PullRequestLabelsCommand } from "../pull-request-labels/pull-request-labels.command";
import { PullRequestTemplateCommand } from "../pull-request-template/pull-request-template.command";
import { SkillExclusionsCommand } from "../skill-exclusions/skill-exclusions.command";
import { TypeormMigrationSqlCommand } from "../typeorm-migration-sql/typeorm-migration-sql.command";
import { VscodeExtensionsCommand } from "../vscode-extensions/vscode-extensions.command";

import { SynchronizationCommand } from "./synchronization.command";
import { SynchronizationService } from "./synchronization.service";

import type { SynchronizableCommand } from "./synchronization.types";
import type { BuiltTestingModule } from "@codebase/testing/nestjs";

const moduleOptions = {
  providers: [
    SynchronizationService,
    {
      provide: ConformetryGeneratorsCommand,
      useValue: createMock<ConformetryGeneratorsCommand>({
        synchronizationLabel: "conformetry-generators",
      }),
    },
    {
      provide: ConventionalConfigCommand,
      useValue: createMock<ConventionalConfigCommand>({
        synchronizationLabel: "conventional-config",
      }),
    },
    {
      provide: DevcontainerConfigurationCommand,
      useValue: createMock<DevcontainerConfigurationCommand>({
        synchronizationLabel: "devcontainer-configuration",
      }),
    },
    {
      provide: InstalledSkillsCommand,
      useValue: createMock<InstalledSkillsCommand>({
        synchronizationLabel: "installed-skills",
      }),
    },
    {
      provide: PackageManifestsCommand,
      useValue: createMock<PackageManifestsCommand>({
        synchronizationLabel: "package-manifests",
      }),
    },
    {
      provide: PullRequestLabelsCommand,
      useValue: createMock<PullRequestLabelsCommand>({
        synchronizationLabel: "pull-request-labels",
      }),
    },
    {
      provide: PullRequestTemplateCommand,
      useValue: createMock<PullRequestTemplateCommand>({
        synchronizationLabel: "pull-request-template",
      }),
    },
    {
      provide: SkillExclusionsCommand,
      useValue: createMock<SkillExclusionsCommand>({
        synchronizationLabel: "skill-exclusions",
      }),
    },
    {
      provide: TypeormMigrationSqlCommand,
      useValue: createMock<TypeormMigrationSqlCommand>({
        synchronizationLabel: "typeorm-migration-sql",
      }),
    },
    {
      provide: VscodeExtensionsCommand,
      useValue: createMock<VscodeExtensionsCommand>({
        synchronizationLabel: "vscode-extensions",
      }),
    },
  ],
};

describe(SynchronizationCommand, () => {
  let command: SynchronizationCommand;
  let conformetryGenerators: ConformetryGeneratorsCommand;
  let conventionalConfig: ConventionalConfigCommand;
  let devcontainerConfiguration: DevcontainerConfigurationCommand;
  let installedSkills: InstalledSkillsCommand;
  let logger: BuiltTestingModule<unknown>["logger"];
  let packageManifests: PackageManifestsCommand;
  let pullRequestLabels: PullRequestLabelsCommand;
  let pullRequestTemplate: PullRequestTemplateCommand;
  let skillExclusions: SkillExclusionsCommand;
  let typeormMigrationSql: TypeormMigrationSqlCommand;
  let vscodeExtensions: VscodeExtensionsCommand;

  /** The delegates in the order the aggregate reports them. */
  function getDelegates(): SynchronizableCommand[] {
    return [
      conformetryGenerators,
      conventionalConfig,
      devcontainerConfiguration,
      installedSkills,
      packageManifests,
      pullRequestLabels,
      pullRequestTemplate,
      skillExclusions,
      typeormMigrationSql,
      vscodeExtensions,
    ];
  }

  /** Makes every delegate report the same outcome. */
  function stubAllDelegates(succeeded: boolean): void {
    for (const delegate of getDelegates()) {
      vi.mocked(delegate.synchronize).mockResolvedValue(succeeded);
    }
  }

  beforeAll(async () => {
    const built = await buildTestingModule(
      SynchronizationCommand,
      moduleOptions,
    );

    command = built.instance;
    conformetryGenerators = await built.module.resolve(
      ConformetryGeneratorsCommand,
    );
    conventionalConfig = await built.module.resolve(ConventionalConfigCommand);
    devcontainerConfiguration = await built.module.resolve(
      DevcontainerConfigurationCommand,
    );
    installedSkills = await built.module.resolve(InstalledSkillsCommand);
    logger = built.logger;
    packageManifests = await built.module.resolve(PackageManifestsCommand);
    pullRequestLabels = await built.module.resolve(PullRequestLabelsCommand);
    pullRequestTemplate = await built.module.resolve(
      PullRequestTemplateCommand,
    );
    skillExclusions = await built.module.resolve(SkillExclusionsCommand);
    typeormMigrationSql = await built.module.resolve(
      TypeormMigrationSqlCommand,
    );
    vscodeExtensions = await built.module.resolve(VscodeExtensionsCommand);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      SynchronizationCommand,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(SynchronizationCommand);
  });

  it("sets logger context", async () => {
    expect.hasAssertions();

    await expectLoggerContext(SynchronizationCommand, moduleOptions);
  });

  it("runs every command in check mode and reports success", async () => {
    stubAllDelegates(true);

    await expect(command.synchronize("check")).resolves.toBe(true);

    for (const delegate of getDelegates()) {
      expect(delegate.synchronize).toHaveBeenCalledWith("check");
    }

    expect(logger.info).toHaveBeenCalledWith(
      "🔗 Verified every synchronization",
      undefined,
      expect.any(Object),
    );
  });

  it("logs the label of each command it synchronizes", async () => {
    stubAllDelegates(true);

    await command.synchronize("check");

    expect(logger.info).toHaveBeenCalledWith(
      "🔄 Synchronizing a command",
      undefined,
      {
        label: "conformetry-generators",
      },
    );
  });

  it("forwards write mode to every command", async () => {
    stubAllDelegates(true);

    await expect(command.synchronize("write")).resolves.toBe(true);

    for (const delegate of getDelegates()) {
      expect(delegate.synchronize).toHaveBeenCalledWith("write");
    }
  });

  // The whole point of the aggregate: one run surfaces all drift, so a failing
  // command must not stop the ones after it.
  it("runs the remaining commands after one fails", async () => {
    stubAllDelegates(true);
    vi.mocked(conformetryGenerators.synchronize).mockResolvedValue(false);

    await expect(command.synchronize("check")).resolves.toBe(false);

    for (const delegate of getDelegates()) {
      expect(delegate.synchronize).toHaveBeenCalledTimes(1);
    }

    expect(logger.info).toHaveBeenCalledWith(
      "📋 Summarized the synchronization run",
      undefined,
      expect.any(Object),
    );
    expect(logger.info).toHaveBeenCalledWith(
      "🔗 Detected out-of-sync synchronizations",
      undefined,
      expect.any(Object),
    );
  });

  it("defaults to check mode when no mode is passed", async () => {
    stubAllDelegates(true);

    await command.run([]);

    expect(conformetryGenerators.synchronize).toHaveBeenCalledWith("check");
  });

  // A command registered in the module but left out of the aggregate's own list
  // would never run, and nothing else would notice.
  it("drives every registered command, including skill-exclusions", async () => {
    stubAllDelegates(true);

    await command.run(["check"]);

    expect(installedSkills.synchronize).toHaveBeenCalledWith("check");
    expect(skillExclusions.synchronize).toHaveBeenCalledWith("check");
    expect(typeormMigrationSql.synchronize).toHaveBeenCalledWith("check");
    expect(vscodeExtensions.synchronize).toHaveBeenCalledWith("check");
  });

  it("exits with code 1 when any command reports drift", async () => {
    stubAllDelegates(true);
    vi.mocked(pullRequestTemplate.synchronize).mockResolvedValue(false);

    await expectProcessExitOne(async () => {
      await command.run(["check"]);
    });

    expect(logger.info).toHaveBeenCalledWith(
      "🔗 Detected out-of-sync synchronizations",
      undefined,
      expect.any(Object),
    );
  });

  it("exits with code 1 on an unknown mode", async () => {
    stubAllDelegates(true);

    await expectProcessExitOne(async () => {
      await command.run(["sideways"]);
    });

    expect(conformetryGenerators.synchronize).not.toHaveBeenCalled();
  });
});
