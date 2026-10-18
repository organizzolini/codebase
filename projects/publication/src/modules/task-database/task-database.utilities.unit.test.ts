import { describe, expect, it } from "vitest";

import { schemaOf } from "./task-database.utilities";

describe(schemaOf, () => {
  it("takes what follows the last -v of the name", () => {
    expect.hasAssertions();
    expect(schemaOf("/data/runner-vm-v3.db")).toBe("3.db");
  });

  it("ignores a -v in the directory", () => {
    expect.hasAssertions();
    expect(schemaOf("/data-v9/unversioned")).toBe("unversioned");
  });
});
