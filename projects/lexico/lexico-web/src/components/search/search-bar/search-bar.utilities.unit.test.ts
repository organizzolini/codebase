import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { debounce } from "./search-bar.utilities";

describe(debounce, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("runs once with the last argument after calls stop", () => {
    const action = vi.fn();
    const debounced = debounce(action, 100);

    debounced("a");
    vi.advanceTimersByTime(50);
    debounced("b");
    vi.advanceTimersByTime(99);

    expect(action).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);

    expect(action).toHaveBeenCalledExactlyOnceWith("b");
  });

  it("does not run a cancelled call", () => {
    const action = vi.fn();
    const debounced = debounce(action, 100);

    debounced("a");
    debounced.cancel();
    vi.advanceTimersByTime(200);

    expect(action).not.toHaveBeenCalled();
  });
});
