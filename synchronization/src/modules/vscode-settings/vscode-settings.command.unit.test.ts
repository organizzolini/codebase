import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildTestingModule,
  expectLoggerContext,
} from "@codebase/testing/nestjs";

import { expectProcessExitOne } from "../../../testing/mocks";
import { SynchronizationService } from "../synchronization/synchronization.service";

import { VscodeSettingsCommand } from "./vscode-settings.command";
import {
  VSCODE_MACHINE_SETTINGS_DIRECTORY,
  VSCODE_MACHINE_SETTINGS_FILE,
  VSCODE_WORKSPACE_SETTINGS_FILE,
} from "./vscode-settings.constants";

import type { LoggerService } from "@codebase/observability";

const fileContents = new Map<string, string>();

vi.mock("node:fs", () => {
  return {
    existsSync: vi.fn<(filePath: string) => boolean>((filePath: string) =>
      fileContents.has(filePath),
    ),
    mkdirSync: vi.fn<(directory: string) => void>(),
    readFileSync: vi.fn<(filePath: string) => string>((filePath: string) => {
      const value = fileContents.get(filePath);
      if (value === undefined) {
        throw new Error(`File not found: ${filePath}`);
      }
      return value;
    }),
    writeFileSync: vi.fn<(filePath: string, content: string) => void>(
      (filePath: string, content: string) => {
        fileContents.set(filePath, content);
      },
    ),
  };
});

const moduleOptions = { providers: [SynchronizationService] };

describe(VscodeSettingsCommand, () => {
  let command: VscodeSettingsCommand;
  let logger: LoggerService;

  const workspaceFile = path.join(
    process.cwd(),
    VSCODE_WORKSPACE_SETTINGS_FILE,
  );

  beforeAll(async () => {
    const built = await buildTestingModule(
      VscodeSettingsCommand,
      moduleOptions,
    );

    command = built.instance;
    logger = built.logger;
  });

  beforeEach(() => {
    fileContents.clear();
    vi.clearAllMocks();
  });

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      VscodeSettingsCommand,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(VscodeSettingsCommand);
  });

  it("sets logger context", async () => {
    expect.hasAssertions();

    await expectLoggerContext(VscodeSettingsCommand, moduleOptions);
  });

  it("passes in check mode when the Machine settings hold every workspace key", async () => {
    fileContents.set(workspaceFile, '{ "editor.tabSize": 2 }');
    fileContents.set(
      VSCODE_MACHINE_SETTINGS_FILE,
      '{ "editor.tabSize": 2, "python.defaultInterpreterPath": "/venv" }',
    );

    await expect(command.synchronize("check")).resolves.toBe(true);
    expect(writeFileSync).not.toHaveBeenCalled();
  });

  it("fails in check mode and names missing and mismatched keys", async () => {
    fileContents.set(
      workspaceFile,
      String.raw`{ "editor.tabSize": 2, "files.eol": "\n" }`,
    );
    fileContents.set(VSCODE_MACHINE_SETTINGS_FILE, '{ "editor.tabSize": 4 }');

    await expect(command.synchronize("check")).resolves.toBe(false);
    expect(writeFileSync).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(
      "📦 Detected out-of-sync Machine settings",
      undefined,
      expect.objectContaining({
        mismatchedKeys: ["editor.tabSize"],
        missingKeys: ["files.eol"],
      }),
    );
  });

  it("treats absent Machine settings as empty", async () => {
    fileContents.set(workspaceFile, '{ "editor.tabSize": 2 }');

    await expect(command.synchronize("check")).resolves.toBe(false);
    expect(existsSync).toHaveBeenCalledWith(VSCODE_MACHINE_SETTINGS_FILE);
  });

  it("merges workspace settings over the Machine settings in write mode", async () => {
    fileContents.set(workspaceFile, '{ "editor.tabSize": 2 }');
    fileContents.set(
      VSCODE_MACHINE_SETTINGS_FILE,
      '{ "editor.tabSize": 4, "python.defaultInterpreterPath": "/venv" }',
    );

    await expect(command.synchronize("write")).resolves.toBe(true);

    expect(mkdirSync).toHaveBeenCalledWith(VSCODE_MACHINE_SETTINGS_DIRECTORY, {
      recursive: true,
    });
    expect(
      JSON.parse(fileContents.get(VSCODE_MACHINE_SETTINGS_FILE) ?? "{}"),
    ).toStrictEqual({
      "editor.tabSize": 2,
      "python.defaultInterpreterPath": "/venv",
    });
  });

  it("writes nothing in write mode when already in sync", async () => {
    fileContents.set(workspaceFile, '{ "editor.tabSize": 2 }');
    fileContents.set(VSCODE_MACHINE_SETTINGS_FILE, '{ "editor.tabSize": 2 }');

    await expect(command.synchronize("write")).resolves.toBe(true);
    expect(writeFileSync).not.toHaveBeenCalled();
  });

  it("reports failure instead of throwing when the workspace settings are unreadable", async () => {
    await expect(command.synchronize("check")).resolves.toBe(false);
    expect(logger.error).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
    );
  });

  it("reports a thrown value that is not an Error", async () => {
    const thrown: unknown = "boom";

    vi.mocked(readFileSync).mockImplementationOnce(() => {
      throw thrown;
    });

    await expect(command.synchronize("check")).resolves.toBe(false);
    expect(logger.error).toHaveBeenCalledWith(expect.any(String), "boom");
  });

  it("exits with code 1 from run when drift is found", async () => {
    fileContents.set(workspaceFile, '{ "editor.tabSize": 2 }');

    await expectProcessExitOne(async () => command.run(["check"]));

    expect(logger.info).toHaveBeenCalledWith(
      expect.any(String),
      undefined,
      expect.any(Object),
    );
  });

  it("exits with code 1 from run for an unknown mode", async () => {
    await expectProcessExitOne(async () => command.run(["bogus"]));

    expect(logger.error).toHaveBeenCalledWith(
      "🚦 Rejected an unusable mode",
      undefined,
      expect.objectContaining({ mode: "bogus" }),
    );
  });
});
