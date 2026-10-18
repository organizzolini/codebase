import { createFileRoute, redirect } from "@tanstack/react-router";

import type { ReactNode } from "react";

// 🧭 Route

/**
 * The landing page.
 */
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    // Redirect home to search page
    // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router expects redirect to be thrown
    throw redirect({ to: "/search" });
  },
  component: IndexPage,
});

// 🧩 Component

/**
 * Renders the landing page's heading.
 */
function IndexPage(): ReactNode {
  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <section>
      <h1>LexicoWeb</h1>
    </section>
  );
}
