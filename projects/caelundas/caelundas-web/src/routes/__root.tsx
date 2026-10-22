import {
  createRootRoute,
  HeadContent,
  type Register,
  Scripts,
} from "@tanstack/react-router";

import applicationCss from "../styles/application.css?url";

import type { RouterContext } from "../router.types";
import type { ReactNode } from "react";

// 🧭 Route

/**
 * The document shell every other route renders inside.
 */
// The router context's type is named explicitly so every loader below reads
// the events database from it typed.
export const Route = createRootRoute<Register, undefined, RouterContext>({
  head: () => ({
    links: [{ href: applicationCss, rel: "stylesheet" }],
    meta: [
      { charSet: "utf8" },
      { content: "width=device-width, initial-scale=1", name: "viewport" },
      { title: "CaelundasWeb" },
    ],
  }),
  shellComponent: RootDocument,
});

// 🧩 Component

/**
 * Renders the HTML document around the matched route.
 */
function RootDocument(
  properties: Readonly<{ children: ReactNode }>,
): ReactNode {
  const { children } = properties;

  return (
    <html
      className="dark"
      lang="en"
    >
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
