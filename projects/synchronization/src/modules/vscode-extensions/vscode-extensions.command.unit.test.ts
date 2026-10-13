import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { LoggerService } from "@codebase/logging";

import { expectProcessExitOne } from "../../../testing/mocks";
import { SynchronizationService } from "../synchronization/synchronization.service";

import { VscodeExtensionsCommand } from "./vscode-extensions.command";
import {
  VSCODE_EXTENSIONS_DEVCONTAINER_FILES,
  VSCODE_EXTENSIONS_FILE,
} from "./vscode-extensions.constants";

const fileContents = new Map<string, string>();

vi.mock("node:fs", () => {
  return {
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

describe(VscodeExtensionsCommand, () => {
  let command: VscodeExtensionsCommand;
  let logger: LoggerService;

  const workspaceRoot = process.cwd();
  const extensionsFile = path.join(workspaceRoot, VSCODE_EXTENSIONS_FILE);
  const devcontainerFiles = VSCODE_EXTENSIONS_DEVCONTAINER_FILES.map((file) =>
    path.join(workspaceRoot, file),
  );

  /** A devcontainer configuration carrying exactly these lists. */
  const devcontainerWith = (
    extensions: string[],
    unwantedRecommendations: string[],
  ): string =>
    JSON.stringify({
      customizations: {
        vscode: {
          extensions,
          recommendations: extensions,
          unwantedRecommendations,
        },
      },
      name: "devcontainer",
    });

  /** Declares the source list and puts both devcontainers in the given state. */
  const setFiles = (
    source: string[],
    devcontainerExtensions: string[],
    devcontainerUnwanted: string[] = ["bad.extension"],
  ): void => {
    fileContents.set(
      extensionsFile,
      JSON.stringify({
        recommendations: source,
        unwantedRecommendations: ["bad.extension"],
      }),
    );
    for (const file of devcontainerFiles) {
      fileContents.set(
        file,
        devcontainerWith(devcontainerExtensions, devcontainerUnwanted),
      );
    }
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        VscodeExtensionsCommand,
        SynchronizationService,
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    command = await module.resolve(VscodeExtensionsCommand);
    logger = await module.resolve(LoggerService);
  });

  beforeEach(() => {
    fileContents.clear();
    vi.clearAllMocks();
  });

  it("is defined", () => {
    expect(command).toBeDefined();
  });

  it("sets logger context", async () => {
    const module = await Test.createTestingModule({
      providers: [
        VscodeExtensionsCommand,
        SynchronizationService,
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();
    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("VscodeExtensionsCommand");
  });

  it("passes in check mode when both devcontainers match, in any order", async () => {
    setFiles(["a.ext", "b.ext"], ["b.ext", "a.ext"]);

    await expect(command.synchronize("check")).resolves.toBe(true);
    expect(writeFileSync).not.toHaveBeenCalled();
  });

  it("fails in check mode and names what differs", async () => {
    setFiles(["a.ext", "b.ext"], ["a.ext", "stale.ext"]);

    await expect(command.synchronize("check")).resolves.toBe(false);
    expect(writeFileSync).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(
      "🔀 Differing extension list",
      undefined,
      expect.objectContaining({
        extra: ["stale.ext"],
        list: "extensions",
        missing: ["b.ext"],
      }),
    );
  });

  it("fails in check mode when only the unwanted list drifted", async () => {
    setFiles(["a.ext"], ["a.ext"], []);

    await expect(command.synchronize("check")).resolves.toBe(false);
  });

  it("copies the source lists into both devcontainers in write mode", async () => {
    setFiles(["a.ext", "b.ext"], ["stale.ext"]);

    await expect(command.synchronize("write")).resolves.toBe(true);

    for (const file of devcontainerFiles) {
      const written = JSON.parse(fileContents.get(file) ?? "{}") as {
        customizations: { vscode: Record<string, string[]> };
        name: string;
      };

      expect(written.name).toBe("devcontainer");
      expect(written.customizations.vscode).toStrictEqual({
        extensions: ["a.ext", "b.ext"],
        recommendations: ["a.ext", "b.ext"],
        unwantedRecommendations: ["bad.extension"],
      });
    }
  });

  it("leaves a devcontainer that already matches untouched in write mode", async () => {
    setFiles(["a.ext"], ["a.ext"]);

    await expect(command.synchronize("write")).resolves.toBe(true);
    expect(writeFileSync).not.toHaveBeenCalled();
  });

  it("reports failure instead of throwing when a file cannot be read", async () => {
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

  it("exits with code 1 from run when a devcontainer drifted", async () => {
    setFiles(["a.ext"], ["stale.ext"]);

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
