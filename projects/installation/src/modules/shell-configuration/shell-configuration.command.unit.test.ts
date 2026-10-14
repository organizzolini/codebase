import fs from "node:fs";
import path from "node:path";

import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { LoggerService } from "@codebase/logging";

import { enterWorkspace } from "../../../testing/environment";
import { createFakeProcessRunner } from "../../../testing/fake-process-runner";
import { captureReport } from "../../../testing/report";
import { createTemporaryWorkspace } from "../../../testing/temporary-workspace";
import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import { ShellConfigurationCommand } from "./shell-configuration.command";
import { ShellConfigurationService } from "./shell-configuration.service";

import type { TemporaryWorkspace } from "../../../testing/temporary-workspace";

const NVM_PREFIX = "/opt/homebrew/opt/nvm";

describe(ShellConfigurationCommand, () => {
  let command: ShellConfigurationCommand;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ShellConfigurationCommand,
        {
          provide: ShellConfigurationService,
          useValue: createMock<ShellConfigurationService>(),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    command = await module.resolve(ShellConfigurationCommand);
  });

  let workspace: TemporaryWorkspace;
  let report: string[];

  /** Builds the command over the real service and a machine with these tools. */
  const createCommand = async (
    installed: string[],
  ): Promise<ShellConfigurationCommand> => {
    const { runner } = createFakeProcessRunner({
      installed,
      responses: { "brew --prefix nvm": { stdout: `${NVM_PREFIX}\n` } },
    });
    const module = await Test.createTestingModule({
      providers: [
        ShellConfigurationCommand,
        ShellConfigurationService,
        ReporterService,
        { provide: ProcessRunnerService, useValue: runner },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    return module.resolve(ShellConfigurationCommand);
  };

  /** Reads a startup file from the temporary home directory. */
  const readHomeFile = (name: string): string =>
    fs.readFileSync(path.join(workspace.home, name), "utf8");

  beforeEach(() => {
    workspace = createTemporaryWorkspace();
    report = captureReport();
  });

  afterEach(() => {
    workspace.remove();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(command).toBeDefined();
  });

  it("sets logger context", async () => {
    expect.hasAssertions();

    const module = await Test.createTestingModule({
      providers: [
        ShellConfigurationCommand,
        {
          provide: ShellConfigurationService,
          useValue: createMock<ShellConfigurationService>(),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();
    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("ShellConfigurationCommand");
  });

  it("writes every block to .zshrc, with completions only for installed tools", async () => {
    expect.hasAssertions();

    enterWorkspace(workspace, "/bin/zsh");
    const subject = await createCommand(["pnpm", "gh", "terraform"]);

    await subject.run();

    const zshrc = readHomeFile(".zshrc");

    expect(zshrc).toContain(
      `# codebase: nvm configuration\nexport NVM_DIR="$HOME/.nvm"\n[ -s "${NVM_PREFIX}/nvm.sh" ] && . "${NVM_PREFIX}/nvm.sh"\n[ -s "${NVM_PREFIX}/etc/bash_completion.d/nvm" ] && . "${NVM_PREFIX}/etc/bash_completion.d/nvm"\n`,
    );
    expect(zshrc).toContain(
      "# codebase: GPG TTY for commit signing\nexport GPG_TTY=$(tty)\n",
    );
    expect(zshrc).toContain(
      '# codebase: Node.js memory limit\nexport NODE_OPTIONS="--max-old-space-size=2048"\n',
    );
    expect(zshrc).toContain(
      '# codebase: shell completions\neval "$(pnpm completion zsh)"\neval "$(gh completion -s zsh)"\n',
    );
    expect(zshrc).not.toContain("kubectl completion");
    expect(zshrc).toContain(
      "complete -o nospace -C /usr/local/bin/terraform terraform",
    );
    expect(zshrc).toContain(`. "${workspace.root}/scripts/shell/processes.sh"`);
    expect(report).toStrictEqual([
      "🐚 Configuring shell...",
      `🐚 Configuring shell in ${path.join(workspace.home, ".zshrc")}...`,
      `✅ Shell configuration updated in ${path.join(workspace.home, ".zshrc")}`,
    ]);
  });

  it("adds nothing the second time it runs", async () => {
    expect.hasAssertions();

    enterWorkspace(workspace, "/bin/zsh");
    const subject = await createCommand(["pnpm", "terraform"]);

    await subject.run();
    const first = readHomeFile(".zshrc");
    await subject.run();

    expect(readHomeFile(".zshrc")).toBe(first);
  });

  it("keeps what a startup file already holds", async () => {
    expect.hasAssertions();

    enterWorkspace(workspace, "/bin/zsh");
    fs.writeFileSync(path.join(workspace.home, ".zshrc"), "alias ll='ls -l'\n");
    const subject = await createCommand([]);

    await subject.run();

    expect(readHomeFile(".zshrc")).toMatch(
      /^alias ll='ls -l'\n\n# codebase: nvm/u,
    );
  });

  it("configures .bashrc and, when it exists, .bash_profile with bash completions", async () => {
    expect.hasAssertions();

    enterWorkspace(workspace, "/bin/bash");
    fs.writeFileSync(path.join(workspace.home, ".bash_profile"), "");
    const subject = await createCommand(["pnpm"]);

    await subject.run();

    expect(readHomeFile(".bashrc")).toContain('eval "$(pnpm completion bash)"');
    expect(readHomeFile(".bash_profile")).toContain(
      "# codebase: nvm configuration",
    );
  });

  it("wires completions for every installed tool, and for bash when the file is .bashrc", async () => {
    expect.hasAssertions();

    enterWorkspace(workspace, "/bin/bash");
    const subject = await createCommand(["pnpm", "kubectl", "helm", "gh"]);

    await subject.run();

    expect(readHomeFile(".bashrc")).toContain(
      [
        "# codebase: shell completions",
        'eval "$(pnpm completion bash)"',
        'eval "$(kubectl completion bash)"',
        'eval "$(helm completion bash)"',
        'eval "$(gh completion -s bash)"',
        "",
      ].join("\n"),
    );
    expect(fs.existsSync(path.join(workspace.home, ".bash_profile"))).toBe(
      false,
    );
  });

  it("writes the pnpm and Terraform blocks as the shell will read them", async () => {
    expect.hasAssertions();

    enterWorkspace(workspace, "/bin/zsh");
    const subject = await createCommand(["terraform"]);

    await subject.run();

    const zshrc = readHomeFile(".zshrc");

    expect(zshrc).toContain(
      [
        "# codebase: pnpm global bin",
        'export PNPM_HOME="$HOME/.local/share/pnpm"',
        'case ":$PATH:" in *":$PNPM_HOME/bin:"*) ;; *) export PATH="$PNPM_HOME/bin:$PNPM_HOME:$PATH" ;; esac',
        "",
      ].join("\n"),
    );
    expect(zshrc).toContain(
      [
        "# codebase: terraform completion",
        "autoload -U +X bashcompinit && bashcompinit 2>/dev/null",
        "complete -o nospace -C /usr/local/bin/terraform terraform",
        "",
      ].join("\n"),
    );
  });

  it("stops, writing nothing, when Homebrew cannot say where nvm is", async () => {
    expect.hasAssertions();

    enterWorkspace(workspace, "/bin/zsh");
    const { runner } = createFakeProcessRunner({
      responses: { "brew --prefix nvm": { status: 1 } },
    });
    const module = await Test.createTestingModule({
      providers: [
        ShellConfigurationCommand,
        ShellConfigurationService,
        ReporterService,
        { provide: ProcessRunnerService, useValue: runner },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();
    const subject = await module.resolve(ShellConfigurationCommand);

    await expect(subject.run()).rejects.toThrow("`brew --prefix nvm` failed");

    expect(fs.existsSync(path.join(workspace.home, ".zshrc"))).toBe(false);
  });

  it("tells the user what to add by hand when the shell is unknown", async () => {
    expect.hasAssertions();

    enterWorkspace(workspace);
    vi.stubEnv("SHELL", undefined);
    const subject = await createCommand([]);

    await subject.run();

    expect(report[1]).toBe(
      "⚠️  Unsupported shell: . Please add the following to your shell config manually:",
    );
  });

  it("tells the user what to add by hand for any other shell", async () => {
    expect.hasAssertions();

    enterWorkspace(workspace, "/usr/bin/fish");
    const subject = await createCommand([]);

    await subject.run();

    expect(report).toStrictEqual([
      "🐚 Configuring shell...",
      "⚠️  Unsupported shell: fish. Please add the following to your shell config manually:",
      '   export NVM_DIR="$HOME/.nvm"',
      `   [ -s "${NVM_PREFIX}/nvm.sh" ] && . "${NVM_PREFIX}/nvm.sh"`,
      '   export PNPM_HOME="$HOME/.local/share/pnpm"',
      "   export GPG_TTY=$(tty)",
      '   export NODE_OPTIONS="--max-old-space-size=2048"',
    ]);
    expect(fs.readdirSync(workspace.home)).toStrictEqual([]);
  });
});
