// 📤 Exports

export { ComparisonModule } from "./modules/comparison/comparison.module";

export { ComparisonService } from "./modules/comparison/comparison.service";
export type { Comparison } from "./modules/comparison/comparison.types";

export { DeliveryModule } from "./modules/delivery/delivery.module";

export { DeliveryService } from "./modules/delivery/delivery.service";
export type {
  DeliverArguments,
  DeliveryResult,
  GlossaryFormatHandler,
  WriteGlossaryArguments,
} from "./modules/delivery/delivery.types";

export { JsonModule } from "./modules/json/json.module";

export { JsonService } from "./modules/json/json.service";

export { MarkdownModule } from "./modules/markdown/markdown.module";

export { MarkdownService } from "./modules/markdown/markdown.service";
export type { RenderMarkdownArguments } from "./modules/markdown/markdown.types";
