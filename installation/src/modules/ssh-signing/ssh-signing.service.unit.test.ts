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

import { LoggerService } from "@codebase/observability";

import { enterWorkspace } from "../../../testing/environment";
import { createFakeProcessRunner } from "../../../testing/fake-process-runner";
import { captureReport } from "../../../testing/report";
import { createSignedCommit } from "../../../testing/ssh-signature";
import { createTemporaryWorkspace } from "../../../testing/temporary-workspace";
import { ProcessRunnerService } from "../process-runner/process-runner.service";
import { ReporterService } from "../reporter/reporter.service";

import { SshSigningService } from "./ssh-signing.service";

import type {
  FakeMachine,
  FakeProcessRunner,
} from "../../../testing/fake-process-runner";
import type { TemporaryWorkspace } from "../../../testing/temporary-workspace";

const PROBE =
  "git commit-tree 4b825dc642cb6eb9a060e54bf8d69288fbee4904 -m allowed-signers-probe -S";

describe(SshSigningService, () => {
  let service: SshSigningService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SshSigningService,
        {
          provide: ProcessRunnerService,
          useValue: createMock<ProcessRunnerService>(),
        },
        { provide: ReporterService, useValue: createMock<ReporterService>() },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    service = await module.resolve(SshSigningService);
  });

  let workspace: TemporaryWorkspace;
  let report: string[];
  const signed = createSignedCommit();

  /** Builds the service over a machine where git signs with SSH by default. */
  const createService = async (
    machine: FakeMachine = {},
    format = "ssh\n",
  ): Promise<{ fake: FakeProcessRunner; subject: SshSigningService }> => {
    const fake = createFakeProcessRunner({
      ...machine,
      responses: {
        "git cat-file commit abc123": { stdout: signed.commit },
        "git config --get gpg.format": { stdout: format },
        "git config --get user.email": { stdout: "noreply@anthropic.com\n" },
        [PROBE]: { stdout: "abc123\n" },
        ...machine.responses,
      },
    });
    const module = await Test.createTestingModule({
      providers: [
        SshSigningService,
        ReporterService,
        { provide: ProcessRunnerService, useValue: fake.runner },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    return { fake, subject: await module.resolve(SshSigningService) };
  };

  const allowedSignersPath = (): string =>
    path.join(workspace.home, ".ssh", "allowed_signers");

  beforeEach(() => {
    workspace = createTemporaryWorkspace();
    report = captureReport();
    enterWorkspace(workspace);
    vi.spyOn(process, "getuid").mockReturnValue(0);
  });

  afterEach(() => {
    workspace.remove();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(service).toBeDefined();
  });

  it("does nothing when git does not sign with SSH", async () => {
    expect.hasAssertions();

    const { fake, subject } = await createService({}, "openpgp\n");

    subject.configureSshSigning();

    expect(fs.existsSync(allowedSignersPath())).toBe(false);
    expect(fake.commands).not.toContain(PROBE);
    expect(report).toStrictEqual([
      "👍 Git does not sign with SSH, so there are no SSH signatures to verify.",
    ]);
  });

  it("lists the signer's key and points git at the file", async () => {
    expect.hasAssertions();

    const { fake, subject } = await createService({
      installed: ["ssh-keygen"],
    });

    subject.configureSshSigning();

    expect(fs.readFileSync(allowedSignersPath(), "utf8")).toBe(
      `noreply@anthropic.com namespaces="git" ${signed.publicKey}\n`,
    );
    expect(fake.commands).toContain(
      `git config --global gpg.ssh.allowedSignersFile ${allowedSignersPath()}`,
    );
    expect(report).toStrictEqual([
      `🔏 SSH signatures are verified against ${allowedSignersPath()}.`,
    ]);
  });

  it("lists the key once however often it runs", async () => {
    expect.hasAssertions();

    const { subject } = await createService({ installed: ["ssh-keygen"] });

    subject.configureSshSigning();
    subject.configureSshSigning();

    expect(
      fs.readFileSync(allowedSignersPath(), "utf8").trim().split("\n"),
    ).toHaveLength(1);
  });

  it("keeps the keys already listed, on a line of their own", async () => {
    expect.hasAssertions();

    fs.mkdirSync(path.dirname(allowedSignersPath()));
    fs.writeFileSync(allowedSignersPath(), "other@example.com ssh-rsa AAAA");

    const { subject } = await createService({ installed: ["ssh-keygen"] });

    subject.configureSshSigning();

    expect(
      fs.readFileSync(allowedSignersPath(), "utf8").trim().split("\n"),
    ).toStrictEqual([
      "other@example.com ssh-rsa AAAA",
      `noreply@anthropic.com namespaces="git" ${signed.publicKey}`,
    ]);
  });

  it("installs ssh-keygen through apt as root when it is missing", async () => {
    expect.hasAssertions();

    const { fake, subject } = await createService({ installed: ["apt-get"] });

    subject.configureSshSigning();

    expect(fake.commands).toStrictEqual(
      expect.arrayContaining([
        "apt-get update -qq",
        "apt-get install -y -qq --no-install-recommends openssh-client",
      ]),
    );
    expect(report[0]).toBe("📦 Installing openssh-client...");
  });

  it("warns, and still lists the key, when apt fails", async () => {
    expect.hasAssertions();

    const { subject } = await createService({
      installed: ["apt-get"],
      responses: { "apt-get update -qq": { status: 100 } },
    });

    subject.configureSshSigning();

    expect(report).toContain(
      "⚠️  Could not install openssh-client, so SSH signatures cannot be verified.",
    );
    expect(fs.existsSync(allowedSignersPath())).toBe(true);
  });

  it("warns instead of installing when it is not root", async () => {
    expect.hasAssertions();

    vi.spyOn(process, "getuid").mockReturnValue(1000);

    const { fake, subject } = await createService({ installed: ["apt-get"] });

    subject.configureSshSigning();

    expect(fake.commands).not.toContain("apt-get update -qq");
    expect(report[0]).toBe(
      "⚠️  ssh-keygen is missing and cannot be installed here, so SSH signatures cannot be verified.",
    );
  });

  it("warns and writes nothing when the signer cannot sign", async () => {
    expect.hasAssertions();

    const { fake, subject } = await createService({
      installed: ["ssh-keygen"],
      responses: { [PROBE]: { status: 1 } },
    });

    subject.configureSshSigning();

    expect(fs.existsSync(allowedSignersPath())).toBe(false);
    expect(fake.commands.join("\n")).not.toContain("--global");
    expect(report).toStrictEqual([
      "⚠️  Could not read the SSH signing key and committer email, so signatures cannot be verified.",
    ]);
  });

  it("warns and writes nothing when the signature carries no SSH key", async () => {
    expect.hasAssertions();

    const { subject } = await createService({
      installed: ["ssh-keygen"],
      responses: { "git cat-file commit abc123": { stdout: "tree x\n" } },
    });

    subject.configureSshSigning();

    expect(fs.existsSync(allowedSignersPath())).toBe(false);
  });

  it("warns and writes nothing when no committer email is set", async () => {
    expect.hasAssertions();

    const { subject } = await createService({
      installed: ["ssh-keygen"],
      responses: { "git config --get user.email": { status: 1 } },
    });

    subject.configureSshSigning();

    expect(fs.existsSync(allowedSignersPath())).toBe(false);
    expect(report).toHaveLength(1);
  });
});
