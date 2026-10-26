import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useNightSky } from "./use-night-sky";

describe(useNightSky, () => {
  it("returns its result", () => {
    const { result } = renderHook(() => useNightSky());

    expect(result.current).toStrictEqual({ sky: undefined });
  });
});
