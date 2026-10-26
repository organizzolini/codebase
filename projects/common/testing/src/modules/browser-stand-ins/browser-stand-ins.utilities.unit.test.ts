import { describe, expect, it } from "vitest";

import {
  createServerFunctionStandIn,
  matchMediaStandIn,
} from "./browser-stand-ins.utilities";

// 🧪 Tests

describe("browser stand-ins", () => {
  describe(createServerFunctionStandIn, () => {
    it("builds the createServerFn chain, handing back the handler to call directly", () => {
      const getGreeting = createServerFunctionStandIn({ method: "GET" })
        .validator({ parse: () => undefined })
        .handler(
          ({ data }: { data: { name: string } }) => `salve, ${data.name}`,
        );

      expect(getGreeting({ data: { name: "Ovid" } })).toBe("salve, Ovid");
    });

    it("hands back a handler declared without a validator", () => {
      const ping = createServerFunctionStandIn().handler(() => "pong");

      expect(ping()).toBe("pong");
    });
  });

  describe(matchMediaStandIn, () => {
    it("answers every media query as not matching", () => {
      const query = matchMediaStandIn("(prefers-color-scheme: dark)");

      expect(query.matches).toBe(false);
      expect(query.media).toBe("(prefers-color-scheme: dark)");
      expect(query.onchange).toBeNull();
      expect(query.dispatchEvent(new Event("change"))).toBe(false);
    });

    it("accepts listeners without ever calling them", () => {
      const query = matchMediaStandIn("(width > 1px)");
      const listener = (): void => {
        throw new Error("never called");
      };

      expect(() => {
        query.addEventListener("change", listener);
        query.removeEventListener("change", listener);
      }).not.toThrow();
    });
  });
});
