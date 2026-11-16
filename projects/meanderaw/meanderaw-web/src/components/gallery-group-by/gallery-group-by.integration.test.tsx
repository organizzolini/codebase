import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderRoute } from "@codebase/testing/react";

import { serveMeandersApi } from "../../../testing/meanders-api";
import { getRouter } from "../../router";

describe("gallery group-by", () => {
  it("adds and removes levels, keeping them in the link", async () => {
    serveMeandersApi(3);
    const router = getRouter();

    await renderRoute(router, "/");
    await screen.findAllByTestId("meander-card");

    expect(screen.getByText("Not grouped")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Group cards" }));

    await waitFor(() => {
      expect({ ...router.state.location.search }).toStrictEqual({
        group: ["rowsColumns"],
        rows: { operator: "eq", value: 4 },
      });
    });

    fireEvent.click(screen.getByRole("button", { name: "Add sub-group" }));

    await waitFor(() => {
      expect({ ...router.state.location.search }).toStrictEqual({
        group: ["rowsColumns", "lattice"],
        rows: { operator: "eq", value: 4 },
      });
    });

    fireEvent.click(screen.getByRole("button", { name: "Remove group 1" }));

    await waitFor(() => {
      expect({ ...router.state.location.search }).toStrictEqual({
        group: ["lattice"],
        rows: { operator: "eq", value: 4 },
      });
    });

    fireEvent.click(screen.getByRole("button", { name: "Remove group 1" }));

    await waitFor(() => {
      expect({ ...router.state.location.search }).toStrictEqual({
        rows: { operator: "eq", value: 4 },
      });
    });
  });

  it("opens on the levels a shared link names, leaving out the unknown", async () => {
    serveMeandersApi(3);

    await renderRoute(
      getRouter(),
      '/?group=["isChain","nonsense","isChain","lattice"]',
    );

    await expect(screen.findByLabelText("Group 1 by")).resolves.toHaveProperty(
      "value",
      "isChain",
    );
    expect(screen.getByLabelText<HTMLSelectElement>("Group 2 by").value).toBe(
      "lattice",
    );
    expect(screen.queryByLabelText("Group 3 by")).toBeNull();
  });
});
