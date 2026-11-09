import { InventoryService } from "../examples/injected-dependency/inventory.js";
import { OrdersService } from "../examples/injected-dependency/orders.js";

/** The `module-bootstrap` entry-point kind: a `bootstrap` or `main` in a `*.main.ts` file is a root regardless of callers. Never executed. */
export const bootstrap = (): number =>
  new OrdersService(new InventoryService()).place(3);
