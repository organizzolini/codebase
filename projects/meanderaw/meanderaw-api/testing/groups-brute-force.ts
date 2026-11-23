import { meanderRow } from "./fixtures";

/** A fixture meander, its shape and the characteristics it holds. */
export interface Fixture {
  readonly code: string;
  readonly columns: number;
  readonly isChain: boolean;
  readonly isHardcoded: boolean;
  readonly isLoop: boolean;
  readonly junctionCount: number;
  readonly lattice: string;
  readonly repeats: number;
  readonly rows: number;
  readonly strokeCount: number;
}

/** A filter group as the GraphQL input spells it, before wiring. */
export interface Group {
  readonly combinator: "and" | "or";
  readonly groups?: readonly Group[];
  readonly rules?: readonly Rule[];
}

/** One filter rule as the GraphQL input spells it, before wiring. */
export interface Rule {
  readonly field: string;
  readonly flag?: boolean;
  readonly numbers?: readonly number[];
  readonly operator: string;
  readonly text?: string;
}

/** One group of the tree a brute-force walk expects. */
export interface Tree {
  count: number;
  field: string;
  groups: Tree[];
  value: string;
}

/** A hundred and twenty meanders spread over every field, many values missing. */
export const FIXTURES: readonly Fixture[] = Array.from(
  { length: 120 },
  (_, index) => ({
    code: `01x${String(index).padStart(3, "0")}`,
    columns: (index % 2) + 1,
    isChain: index % 3 === 0,
    isHardcoded: index % 4 === 0,
    isLoop: index % 5 < 2,
    junctionCount: [0, 1, 3, 0, 2, 4, 1, 0][index % 8] ?? 0,
    lattice: index % 7 < 3 ? "0" : "1",
    repeats: (index % 3) + 1,
    rows: (index % 4) + 1,
    strokeCount: index % 7 < 3 ? 0 : (index % 7) - 2,
  }),
);

/** A meander the aggregate tables have never seen. */
export const LATE_MEANDER: Fixture = {
  code: "01x999",
  columns: 2,
  isChain: true,
  isHardcoded: false,
  isLoop: false,
  junctionCount: 3,
  lattice: "0",
  repeats: 1,
  rows: 2,
  strokeCount: 0,
};

const collator = new Intl.Collator("en", { numeric: true });

/** The tree a brute-force walk of the fixtures gives, keys in natural order. */
export function expectedTree(
  fixtures: readonly Fixture[],
  fields: readonly string[],
): Tree[] {
  const [field, ...rest] = fields;

  if (field === undefined) {
    return [];
  }

  const byKey = new Map<string, Fixture[]>();

  for (const fixture of fixtures) {
    const key = keyOf(fixture, field);

    byKey.set(key, [...(byKey.get(key) ?? []), fixture]);
  }

  return [...byKey.entries()]
    .toSorted(([left], [right]) => collator.compare(left, right))
    .map(([value, members]) => ({
      count: members.length,
      field,
      groups: expectedTree(members, rest),
      value,
    }));
}

/** A repeatable pseudo-random generator, so the trees are the same every run. */
export function generator(seed: number): () => number {
  let state = seed;

  return () => {
    state = (state * 1_664_525 + 1_013_904_223) % 4_294_967_296;

    return state / 4_294_967_296;
  };
}

/** Whether a rule holds for a fixture, written independently of the API. */
export function holds(fixture: Fixture, rule: Rule): boolean {
  const value = valueOf(fixture, rule.field);
  const [first = 0, second = 0] = rule.numbers ?? [];
  const compared = rule.text ?? first;

  switch (rule.operator) {
    case "between": {
      return Number(value) >= first && Number(value) <= second;
    }
    case "eq": {
      return value === compared;
    }
    case "gt": {
      return Number(value) > first;
    }
    case "gte": {
      return Number(value) >= first;
    }
    case "is": {
      return value === rule.flag;
    }
    case "is_not": {
      return value !== rule.flag;
    }
    case "lt": {
      return Number(value) < first;
    }
    case "lte": {
      return Number(value) <= first;
    }
    default: {
      return value !== compared;
    }
  }
}

/** The text a group key reads as, written independently of the API. */
export function keyOf(fixture: Fixture, field: string): string {
  switch (field) {
    case "isChain":
    case "isLoop": {
      return String(fixture[field]);
    }
    case "isHardcoded": {
      return String(fixture.isHardcoded);
    }
    case "lattice": {
      return fixture.lattice;
    }
    case "rowsColumns": {
      return `${fixture.rows}x${fixture.columns}`;
    }
    default: {
      return String(valueOf(fixture, field));
    }
  }
}

/** Whether a tree holds for a fixture. */
export function matches(fixture: Fixture, group: Group): boolean {
  const results = [
    ...(group.rules ?? []).map((rule) => holds(fixture, rule)),
    ...(group.groups ?? []).map((child) => matches(fixture, child)),
  ];

  return group.combinator === "and"
    ? results.every(Boolean)
    : results.some(Boolean);
}

/** A tree as GraphQL spells it: enum names in capitals. */
export function wire(group: Group): unknown {
  return {
    ...group,
    combinator: group.combinator.toUpperCase(),
    groups: group.groups?.map((child) => wire(child)),
    rules: group.rules?.map((rule) => ({
      ...rule,
      operator: rule.operator.toUpperCase(),
    })),
  };
}

/** A single-rule tree. */
export const only = (rule: Rule): Group => ({
  combinator: "and",
  rules: [rule],
});

/** A fixture as the row the draw run would write. */
export function toRow(fixture: Fixture): ReturnType<typeof meanderRow> {
  return meanderRow({
    characteristics: {
      ...(fixture.junctionCount > 0
        ? { junctionCount: fixture.junctionCount }
        : {}),
      ...(fixture.strokeCount > 0 ? { strokeCount: fixture.strokeCount } : {}),
      ...(fixture.isChain ? { isChain: true } : {}),
      ...(fixture.isLoop ? { isLoop: true } : {}),
    },
    code: fixture.code,
    columns: fixture.columns,
    isHardcoded: fixture.isHardcoded,
    lattice: fixture.lattice,
    repeats: fixture.repeats,
    rows: fixture.rows,
  });
}

/** What a fixture holds under a field name; undefined for a name it lacks. */
function valueOf(fixture: Fixture, field: string): unknown {
  return Object.entries(fixture).find(([name]) => name === field)?.[1];
}
