import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderRoute } from "@codebase/testing/react";

import { getRouter } from "../router";

import { Route } from "./index";

describe("index", () => {
  it("renders its page", async () => {
    await renderRoute(getRouter(), "/");

    await expect(
      screen.findByRole("heading", { level: 1 }),
    ).resolves.toBeDefined();
    expect(Route.fullPath).toBe("/");
  });
});
