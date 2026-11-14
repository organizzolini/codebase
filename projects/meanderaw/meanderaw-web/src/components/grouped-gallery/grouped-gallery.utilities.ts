import { toRows } from "../meander-gallery/meander-gallery.utilities";

import type {
  MeanderFilterGroupInput,
  MeanderFilterRuleInput,
} from "../../graphql/generated/operations";
import type { GroupField } from "../gallery-group-by/gallery-group-by.types";
import type { GalleryGroup } from "../meander-gallery/meanders-api.types";
import type {
  GroupCards,
  GroupedItem,
  GroupLeaf,
} from "./grouped-gallery.types";

// 🔏 Private Functions

/**
 * Lays the groups out as one flat list, depth first: each header, then a
 * last-level group's cards and a stand-in for the unread.
 */
export function buildGroupedItems(
  groups: readonly GalleryGroup[],
  context: Readonly<{
    cards: Readonly<Record<string, GroupCards>>;
    columns: number;
    fields: readonly GroupField[];
    filter: MeanderFilterGroupInput | undefined;
  }>,
): GroupedItem[] {
  const items: GroupedItem[] = [];
  // A stack rather than recursion keeps the frames flat however deep the
  // grouping goes.
  const stack = groups
    .map((group) => ({
      depth: 0,
      group,
      id: "",
      rules: [] as MeanderFilterRuleInput[],
    }))
    .toReversed();

  for (let next = stack.pop(); next !== undefined; next = stack.pop()) {
    const { depth, group } = next;
    const field = context.fields.find(({ key }) => key === group.field);
    const id = `${next.id}/${group.field}=${group.value}`;
    const rules = [
      ...next.rules,
      ...toKeyRules(group.field, field?.type, group.value),
    ];

    items.push({
      count: group.count,
      depth,
      key: id,
      kind: "header",
      label: `${field?.label ?? group.field}: ${describeKey(field, group.value)}`,
    });

    const children = group.groups;

    if (children.length > 0) {
      stack.push(
        ...children
          .map((child) => ({ depth: depth + 1, group: child, id, rules }))
          .toReversed(),
      );
      continue;
    }

    const leaf: GroupLeaf = {
      filter: toLeafFilter(context.filter, rules),
      id,
    };

    items.push(...toLeafItems(leaf, context.cards[id], context.columns));
  }

  return items;
}

/**
 * Words a key as a person reads it.
 */
function describeKey(field: GroupField | undefined, value: string): string {
  if (field?.key === "rowsColumns") {
    return value.replace("x", " × ");
  }

  if (field?.type === "boolean") {
    const isHeld = value === "true";

    if (field.key === "isHardcoded") {
      return isHeld ? "Yes" : "No";
    }

    return isHeld ? "Held" : "Not held";
  }

  return value;
}

/**
 * The rules that select one key of a level, a missing value reading 0 or
 * false as the API does.
 */
function toKeyRules(
  field: string,
  type: GroupField["type"] | undefined,
  value: string,
): MeanderFilterRuleInput[] {
  if (field === "rowsColumns") {
    const [rows = "0", columns = "0"] = value.split("x");

    return [
      { field: "rows", numbers: [Number(rows)], operator: "EQ" },
      { field: "columns", numbers: [Number(columns)], operator: "EQ" },
    ];
  }

  if (type === "boolean") {
    return [{ field, flag: value === "true", operator: "IS" }];
  }

  return [
    type === "text"
      ? { field, operator: "EQ", text: value }
      : { field, numbers: [Number(value)], operator: "EQ" },
  ];
}

// 🌎 Public Functions

/**
 * The filter for a last-level group's cards: its key rules and the page's
 * filter, an AND one spliced in and any other nested.
 */
function toLeafFilter(
  filter: MeanderFilterGroupInput | undefined,
  rules: readonly MeanderFilterRuleInput[],
): MeanderFilterGroupInput {
  if (filter === undefined) {
    return { combinator: "AND", groups: [], rules: [...rules] };
  }

  return filter.combinator === "AND"
    ? {
        combinator: "AND",
        groups: [...(filter.groups ?? [])],
        rules: [...rules, ...(filter.rules ?? [])],
      }
    : { combinator: "AND", groups: [filter], rules: [...rules] };
}

/**
 * The rows under a last-level header: its cards read so far, then a failure
 * or a stand-in for the rest.
 */
function toLeafItems(
  leaf: GroupLeaf,
  cards: GroupCards | undefined,
  columns: number,
): GroupedItem[] {
  const rows = toRows(cards?.meanders ?? [], columns).map(
    (meanders, index): GroupedItem => ({
      key: `${leaf.id}#${String(index)}`,
      kind: "cards",
      meanders,
    }),
  );

  if (cards?.error !== undefined) {
    return [
      ...rows,
      { error: cards.error, key: `${leaf.id}#error`, kind: "error", leaf },
    ];
  }

  return cards === undefined || cards.hasMore
    ? [...rows, { key: `${leaf.id}#pending`, kind: "pending", leaf }]
    : rows;
}
