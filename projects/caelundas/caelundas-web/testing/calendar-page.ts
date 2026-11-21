import { fireEvent, screen, waitFor, within } from "@testing-library/react";

// Building a rule takes a dozen renders of the vendored builder and a reload
// of the calendar, which a slow continuous integration runner needs time for.

/**
 * The time a test that drives the filter builder may take.
 */
export const BUILDER_TEST = { timeout: 30_000 };

/**
 * Time each step of a builder test may wait.
 */
export const BUILDER_WAIT = { timeout: 10_000 };

/**
 * Finds a leaf of the Display menu under a branch, opening the menu and the branch as needed.
 */
export async function findDisplayOption(
  branch: string,
  leaf: string,
): Promise<HTMLElement> {
  await openDisplayMenu();

  const leafName = new RegExp(`^${leaf}$`, "u");

  if (screen.queryByRole("option", { name: leafName }) === null) {
    const branchName = new RegExp(`^${branch},`, "u");
    const back = screen.queryByRole("button", { name: /^back$/iu });

    // Another branch is open in place of the list: step out of it first.
    if (back !== null) {
      fireEvent.click(back);
    }

    // A branch already opened is a button in the trail, not an option.
    fireEvent.click(
      await waitFor(() => {
        const found =
          screen.queryByRole("option", { name: branchName }) ??
          screen.queryByRole("button", { name: branchName });

        if (found === null) {
          throw new Error(`No branch named ${branch}`);
        }

        return found;
      }, BUILDER_WAIT),
    );
  }

  return screen.findByRole("option", { name: leafName }, BUILDER_WAIT);
}

/**
 * Finds the calendar's one toolbar row.
 */
export async function findToolbar(): Promise<HTMLElement> {
  return screen.findByTestId("calendar-toolbar", {}, BUILDER_WAIT);
}

/**
 * Picks a calendar view by its label from the Display menu's toggle group.
 */
export async function pickCalendarView(label: string): Promise<void> {
  await openDisplayMenu();

  const back = screen.queryByRole("button", { name: /^back$/iu });

  if (back !== null) {
    fireEvent.click(back);
  }

  fireEvent.click(
    await screen.findByRole("option", { name: /^Calendar,/u }, BUILDER_WAIT),
  );
  fireEvent.click(
    await screen.findByRole("button", { name: label }, BUILDER_WAIT),
  );
}

/**
 * What the toolbar's Display chip says is shown, such as "Week".
 */
export async function readCalendarView(): Promise<string> {
  const group = await within(await findToolbar()).findByRole("group", {
    name: "Display",
  });

  return group.textContent.replace(/^Display/u, "");
}

/**
 * Opens the toolbar's Display menu unless it is open already.
 */
async function openDisplayMenu(): Promise<void> {
  if (screen.queryByTestId("query-cascader") === null) {
    fireEvent.click(
      within(await findToolbar()).getByRole("button", { name: "Display" }),
    );
  }

  await screen.findByTestId("query-cascader", {}, BUILDER_WAIT);
}
