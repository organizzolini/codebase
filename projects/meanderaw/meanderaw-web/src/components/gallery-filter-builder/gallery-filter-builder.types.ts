// 🏷️ Types

/**
 * How a group joins the rules and groups in it.
 */
export type FilterCombinator = "and" | "or";

/**
 * Changes the tree from its root, which the builder then writes back.
 */
export type FilterEdit = (root: FilterGroup) => FilterGroup;

/**
 * A field a rule may name: a shape field or a characteristic.
 */
export interface FilterField {
  /** Where it is measured, or shape for the shape fields. */
  category: string;
  description: string;
  /** Whether a number field takes whole numbers only. */
  isInteger: boolean;
  /** Whether it names a kind of meander. */
  isPattern: boolean;
  /** What a rule, a chip and a sort name it by. */
  key: string;
  label: string;
  type: FilterFieldType;
  /** How many meanders hold each stored value, where counts exist. */
  valueCounts: readonly { meanderCount: number; value: number }[];
}

/**
 * What a field holds, which decides the operators it takes.
 */
export type FilterFieldType = "boolean" | "number" | "text";

/**
 * Rules and nested groups under one combinator.
 */
export interface FilterGroup {
  combinator: FilterCombinator;
  rules: FilterNode[];
}

/**
 * A rule or a nested group of them.
 */
export type FilterNode = FilterGroup | FilterRule;

/**
 * How a rule compares its field with its value.
 */
export type FilterOperator =
  | "between"
  | "eq"
  | "gt"
  | "gte"
  | "is"
  | "is_not"
  | "lt"
  | "lte"
  | "ne";

/**
 * One condition: a field, an operator and the value it compares.
 */
export interface FilterRule {
  field: string;
  operator: FilterOperator;
  value: FilterValue;
}

/**
 * A rule and its place in the tree.
 */
export interface FilterRuleEntry {
  /** The index of each node from the root down to the rule. */
  path: readonly number[];
  rule: FilterRule;
}

/**
 * What a rule compares with: a number, range, flag or text.
 */
export type FilterValue = [number, number] | boolean | number | string;
