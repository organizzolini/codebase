import { describe, expect, it } from "vitest";

import { INHERITED_ENVIRONMENT_KEYS } from "./command.constants";
import { createCommand, sanitizeEnvironment } from "./command.utilities";

// 🧪 Tests

describe("command", () => {
  describe(sanitizeEnvironment, () => {
    it("keeps only the inherited keys and drops everything else", () => {
      const environment = sanitizeEnvironment({
        npm_config_registry: "https://example.test",
        NX_DAEMON: "true",
        PATH: "/bin",
        SECRET_TOKEN: "hunter2",
      });

      expect(environment).toStrictEqual({ PATH: "/bin" });
      expect(INHERITED_ENVIRONMENT_KEYS).toContain("PATH");
    });

    it("skips an inherited key that is unset and lets overrides win", () => {
      const environment = sanitizeEnvironment(
        { HOME: "/home/real", PATH: undefined },
        { CUSTOM: "1", HOME: "/sandbox" },
      );

      expect(environment).toStrictEqual({ CUSTOM: "1", HOME: "/sandbox" });
    });
  });

  describe(createCommand, () => {
    const directory = process.cwd();

    it("captures output and the exit code", async () => {
      const result = await createCommand("node", [
        "-e",
        "process.stdout.write('out');process.stderr.write('err');process.exit(3)",
      ])
        .inDirectory(directory)
        .run();

      expect(result).toMatchObject({
        exitCode: 3,
        stderr: "err",
        stdout: "out",
        timedOut: false,
      });
    });

    it("hands the child only the sanitized environment plus its own variables", async () => {
      const result = await createCommand("node", [
        "-e",
        "process.stdout.write(JSON.stringify([process.env.CUSTOM, process.env.VITEST === undefined]))",
      ])
        .inDirectory(directory)
        .withEnvironment({ CUSTOM: "yes" })
        .run();

      expect(result.stdout).toBe('["yes",true]');
    });

    it("stops a command that outlives its timeout and says so", async () => {
      const result = await createCommand("node", [
        "-e",
        "setInterval(()=>{},1e3)",
      ])
        .inDirectory(directory)
        .withTimeout(200)
        .run();

      expect(result.timedOut).toBe(true);
      expect(result.exitCode).not.toBe(0);
    });

    it("reports a command that cannot start as a failure rather than throwing", async () => {
      const result = await createCommand("definitely-not-a-command-xyz", [])
        .inDirectory(directory)
        .run();

      expect(result.exitCode).not.toBe(0);
    });
  });
});
