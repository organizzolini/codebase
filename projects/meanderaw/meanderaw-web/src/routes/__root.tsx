import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import applicationCss from "../styles/application.css?url";

import type { ReactNode } from "react";

// 🧭 Route

/**
 * The document shell every other route renders inside.
 */
export const Route = createRootRoute({
  head: () => ({
    links: [{ href: applicationCss, rel: "stylesheet" }],
    meta: [
      { charSet: "utf8" },
      { content: "width=device-width, initial-scale=1", name: "viewport" },
      { title: "MeanderawWeb" },
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
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
