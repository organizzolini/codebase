import type { GroupField } from "../gallery-group-by/gallery-group-by.types";
import type {
  GalleryGroup,
  GalleryMeander,
} from "../meander-gallery/meanders-api.types";
import type {
  GroupedItem,
  GroupExtent,
  GroupStep,
} from "./grouped-gallery.types";

// 🔏 Private Functions

/**
 * Lays the meanders out as one flat list: rows of cards, and a header for
 * each level wherever a group's keys change.
 */
export function buildGroupedItems(
  meanders: readonly GalleryMeander[],
  context: Readonly<{
    extents: ReadonlyMap<string, GroupExtent>;
    fields: readonly GroupField[];
    grouping: readonly string[];
    /** How many meanders come before the first of these, over every page. */
    offset: number;
  }>,
): GroupedItem[] {
  const { fields, grouping } = context;
  const items: GroupedItem[] = [];
  // The levels of the meander before, and the cards since its header.
  const state = { previous: [] as GroupStep[], run: [] as GalleryMeander[] };

  for (const meander of meanders) {
    const steps = readSteps(meander, grouping, fields);
    const level = steps.findIndex(
      ({ id }, depth) => id !== state.previous[depth]?.id,
    );

    if (level !== -1) {
      items.push(
        ...toCards(state.run, items.length),
        ...toHeaders(steps, level, {
          extents: context.extents,
          isFirst: state.previous.length === 0,
          offset: context.offset,
        }),
      );
      state.run = [];
    }

    state.run.push(meander);
    state.previous = steps;
  }

  items.push(...toCards(state.run, items.length));

  return items;
}

/**
 * Notes each group's exact count, and how many meanders come before it, by
 * the id its header carries.
 */
export function indexGroups(
  groups: readonly GalleryGroup[],
): Map<string, GroupExtent> {
  const extents = new Map<string, GroupExtent>();
  let start = 0;
  // A stack rather than recursion keeps the frames flat however deep the
  // grouping goes.
  const stack = groups.map((group) => ({ group, parent: "" })).toReversed();

  for (let next = stack.pop(); next !== undefined; next = stack.pop()) {
    const { group, parent } = next;
    const id = `${parent}/${group.field}=${group.value}`;

    extents.set(id, { count: group.count, start });

    if (group.groups.length === 0) {
      start += group.count;
    } else {
      stack.push(
        ...group.groups
          .map((child) => ({ group: child, parent: id }))
          .toReversed(),
      );
    }
  }

  return extents;
}

/**
 * Words a key as a person reads it.
 */
function describeKey(field: GroupField | undefined, value: string): string {
  if (field?.type !== "boolean") {
    return value;
  }

  return value === "true" ? "Held" : "Not held";
}

/**
 * What a meander holds for a level: a characteristic it does not hold counts
 * as 0.
 */
function readHeld(meander: GalleryMeander, field: string): number {
  if (field === "rows") {
    return meander.rows;
  }

  if (field === "columns") {
    return meander.columns;
  }

  return meander.characteristics.find(({ key }) => key === field)?.value ?? 0;
}

/**
 * The levels a meander falls under, outermost first, each with the id the
 * group's header carries.
 */
function readSteps(
  meander: GalleryMeander,
  grouping: readonly string[],
  fields: readonly GroupField[],
): GroupStep[] {
  const steps: GroupStep[] = [];
  let id = "";

  for (const name of grouping) {
    const field = fields.find(({ key }) => key === name);
    const held = readHeld(meander, name);
    // As the API words the group: a boolean reads true or false.
    const key =
      field?.type === "boolean" ? String(Boolean(held)) : String(held);

    id = `${id}/${name}=${key}`;
    steps.push({ field, id, key, name });
  }

  return steps;
}

/**
 * The cards under one header as one item, none for no cards, keyed by place.
 */
function toCards(run: readonly GalleryMeander[], place: number): GroupedItem[] {
  return run.length === 0
    ? []
    : [{ key: `cards#${String(place)}`, kind: "cards", meanders: run }];
}

// 🌎 Public Functions

/**
 * The headers of the levels from the first that changed, a group continued
 * when it began before the pages showing.
 */
function toHeaders(
  steps: readonly GroupStep[],
  level: number,
  context: Readonly<{
    extents: ReadonlyMap<string, GroupExtent>;
    isFirst: boolean;
    offset: number;
  }>,
): GroupedItem[] {
  return steps.slice(level).map((step, index): GroupedItem => {
    const extent = context.extents.get(step.id);

    return {
      count: extent?.count ?? 0,
      depth: level + index,
      isContinued: context.isFirst && (extent?.start ?? 0) < context.offset,
      key: step.id,
      kind: "header",
      label: `${step.field?.label ?? step.name}: ${describeKey(step.field, step.key)}`,
    };
  });
}
