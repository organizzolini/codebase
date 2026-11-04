import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { {{nameCamelCase}} } from "./{{nameKebabCase}}";

describe({{nameCamelCase}}, () => {
  it("returns its result", () => {
    const { result } = renderHook(() => {{nameCamelCase}}());

    expect(result.current).toStrictEqual({});
  });
});
