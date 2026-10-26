import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

import { matchMediaStandIn } from "./modules/browser-stand-ins/browser-stand-ins.utilities";

/**
 * The Vitest setup every React project's jsdom tests share: a `matchMedia`
 * that components can read on render, and the rendered tree unmounted after
 * each test. A project lists it in `setupFiles` after its own setup.
 */

vi.stubGlobal("matchMedia", matchMediaStandIn);

afterEach(() => {
  cleanup();
});
