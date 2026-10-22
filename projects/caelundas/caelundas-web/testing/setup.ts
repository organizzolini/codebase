import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach } from "vitest";

import { installViewport } from "./viewport";

beforeEach(() => {
  installViewport();
});

afterEach(() => {
  cleanup();
});
