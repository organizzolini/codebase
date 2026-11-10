import { describe, expect, it } from "vitest";

import * as surface from "./index.js";
import {
  ALL_TEMPLATES_SELECTION,
  ConfigurationModule,
  ConfigurationPathRequiredError,
  ConfigurationService,
  InputError,
  missingDirectoryError,
  missingInputError,
  MissingSubstitutionError,
  UnknownConfigurationFileTypeError,
} from "./index.js";

describe("conformetry-configuration index", () => {
  it("exports the configuration surface", () => {
    expect(ConfigurationModule).toBeDefined();
    expect(ConfigurationService).toBeDefined();
    expect(ConfigurationPathRequiredError).toBeDefined();
    expect(UnknownConfigurationFileTypeError).toBeDefined();
    expect(MissingSubstitutionError).toBeDefined();
    expect(InputError).toBeDefined();
    expect(missingDirectoryError).toBeDefined();
    expect(missingInputError).toBeDefined();
    expect(ALL_TEMPLATES_SELECTION).toBeDefined();
  });

  it("publishes one service and one module, and no other collaborator", () => {
    // Only the service and the module are public; the other collaborators are reached through the facade.
    expect(
      Object.entries(surface)
        .filter(([name]) => name.endsWith("Service") || name.endsWith("Module"))
        .map(([name]) => name),
    ).toStrictEqual(["ConfigurationModule", "ConfigurationService"]);
  });
});
