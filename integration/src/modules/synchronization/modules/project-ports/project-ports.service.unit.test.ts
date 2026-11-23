import { beforeAll, describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { ProjectPortsService } from "./project-ports.service";

describe(ProjectPortsService, () => {
  let service: ProjectPortsService;

  beforeAll(async () => {
    const built = await buildTestingModule(ProjectPortsService);

    service = built.instance;
  });

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(ProjectPortsService);

    expect(instance).toBeInstanceOf(ProjectPortsService);
  });

  describe("textToPort", () => {
    // The values `scripts/shell/text-to-port.sh` printed for these names.
    it.each([
      ["lexico-web", 7797],
      ["lexico-api", 5003],
      ["caelundas-web", 8967],
      ["meanderaw-web", 2161],
    ])("derives the port of %s", (name, port) => {
      expect(service.textToPort(name)).toBe(port);
    });

    it("stays within 1000-9999", () => {
      for (const text of ["", "a", "zzzzzzzzzzzzzzzz", "caf\u00E9"]) {
        expect(service.textToPort(text)).toBeGreaterThanOrEqual(1000);
        expect(service.textToPort(text)).toBeLessThanOrEqual(9999);
      }
    });

    it("depends on the order of the characters", () => {
      expect(service.textToPort("ab")).not.toBe(service.textToPort("ba"));
    });

    it("gives the same port for the same text", () => {
      expect(service.textToPort("lexico-web")).toBe(
        service.textToPort("lexico-web"),
      );
    });
  });

  describe("replacePort", () => {
    it("rewrites the whole number on a line about a port", () => {
      expect(
        service.replacePort(
          '    port: 3000,\n  origin: "localhost:3000"',
          3000,
          8967,
        ),
      ).toBe('    port: 8967,\n  origin: "localhost:8967"');
    });

    it("leaves a number on a line that is not about a port", () => {
      expect(service.replacePort("const timeout = 3000;", 3000, 8967)).toBe(
        "const timeout = 3000;",
      );
    });

    it("leaves a number that merely contains the port", () => {
      expect(
        service.replacePort(
          "port: 13000, port: 3000.5, port: 3000",
          3000,
          8967,
        ),
      ).toBe("port: 13000, port: 3000.5, port: 8967");
    });
  });
});
