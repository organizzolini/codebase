import { describe, expect, it } from "vitest";

import {
  BIGINT_NUMBER_TRANSFORMER,
  UnknownCharacteristicError,
} from "./meanderaw-database.constants";

describe("meanderaw database constants", () => {
  it("reads a bigint string as a number, and a null as null", () => {
    expect(BIGINT_NUMBER_TRANSFORMER.from("42")).toBe(42);
    expect(BIGINT_NUMBER_TRANSFORMER.from(null)).toBeNull();
  });

  it("writes a number or null unchanged", () => {
    expect(BIGINT_NUMBER_TRANSFORMER.to(42)).toBe(42);
    expect(BIGINT_NUMBER_TRANSFORMER.to(null)).toBeNull();
  });

  it("names the key that has no catalog row", () => {
    expect(new UnknownCharacteristicError("crossCount").message).toContain(
      '"crossCount"',
    );
  });
});
