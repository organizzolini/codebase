import { Injectable } from "@nestjs/common";
import { Command, CommandRunner } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import { SshSigningService } from "./ssh-signing.service";

/**
 * CLI command that makes SSH commit signatures verifiable: it installs
 * `ssh-keygen` and lists the signer's key in the allowed signers file.
 *
 * Does nothing when git does not sign with SSH. Safe to run again.
 */
@Command({
  description:
    "Install ssh-keygen and list the SSH signer's key so commit signatures can be verified",
  name: "ssh-signing",
})
@Injectable()
export class SshSigningCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly sshSigningService: SshSigningService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(SshSigningCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /** Makes SSH commit signatures verifiable. */
  public async run(): Promise<void> {
    await Promise.resolve();

    this.sshSigningService.configureSshSigning();
  }
}
