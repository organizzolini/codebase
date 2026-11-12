import { InventoryService } from "../examples/injected-dependency/inventory.js";
import { OrdersService } from "../examples/injected-dependency/orders.js";

/** `module-bootstrap` entry kind: `bootstrap` or `main` is a root. */
export const bootstrap = (): number =>
  new OrdersService(new InventoryService()).place(3);
