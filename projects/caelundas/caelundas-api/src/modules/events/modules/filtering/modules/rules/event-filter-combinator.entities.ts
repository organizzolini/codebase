import { registerEnumType } from "@nestjs/graphql";

// 🧬 Entities

/**
 * How a group joins the conditions in it.
 */
export enum EventFilterCombinator {
  AND = "and",
  OR = "or",
}

registerEnumType(EventFilterCombinator, {
  description: "How a filter group joins the conditions and groups in it.",
  name: "EventFilterCombinator",
});
