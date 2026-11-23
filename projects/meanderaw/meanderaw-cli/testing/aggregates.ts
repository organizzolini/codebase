import type { DataSource } from "typeorm";

/** Every aggregate table as sorted `|`-joined lines, keyed by characteristic `key` rather than id. */
export interface AggregateLines {
  pairs: string[];
  shapes: string[];
  totals: string[];
  values: string[];
}

/** One bridge row with its meander's shape, as read for the brute-force count. */
interface HeldRow extends Shape {
  isBoolean: boolean;
  key: string;
  meanderId: string;
  value: number;
}

/** The two fields that make a shape. */
interface Shape {
  columns: number;
  rows: number;
}

/**
 * Counts every aggregate table by walking the meanders and the bridge in
 * memory, as the rebuild should have: no SQL grouping to trust. `absent` is
 * the brute-force 0 or false bucket, `value|key|count` for each characteristic
 * and `shape|key|count` for each shape and characteristic.
 */
export async function bruteForceAggregates(
  dataSource: DataSource,
): Promise<AggregateLines & { absent: string[] }> {
  const held: HeldRow[] = await dataSource.query(
    `SELECT meander.id AS "meanderId", meander.rows::int AS rows, meander.columns::int AS columns,
            catalog.key, bridge.value, catalog.value_type = 'boolean' AS "isBoolean"
     FROM meanderaw.meander_characteristics bridge
     JOIN meanderaw.characteristics catalog ON catalog.id = bridge.characteristic_id
     JOIN meanderaw.meanders meander ON meander.id = bridge.meander_id`,
  );
  const meanders: Shape[] = await dataSource.query(
    `SELECT rows::int AS rows, columns::int AS columns FROM meanderaw.meanders`,
  );
  const catalog: { key: string }[] = await dataSource.query(
    `SELECT key FROM meanderaw.characteristics`,
  );
  const tally = new Map<string, number>();
  const count = (line: string): void => {
    tally.set(line, (tally.get(line) ?? 0) + 1);
  };
  const lines = (prefix: string): string[] =>
    [...tally]
      .filter(([line]) => line.startsWith(prefix))
      .map(([line, total]) => `${line.slice(prefix.length)}|${total}`)
      .toSorted();
  const byMeander = new Map<string, HeldRow[]>();
  const shapeOf = ({ columns, rows }: Shape): string => `${rows}|${columns}`;

  for (const row of held) {
    byMeander.set(row.meanderId, [
      ...(byMeander.get(row.meanderId) ?? []),
      row,
    ]);
    count(`values:${row.key}|${row.value}`);
    count(`shapes:${shapeOf(row)}|${row.key}|${row.value}`);
  }

  for (const heldByOne of byMeander.values()) {
    for (const first of heldByOne.filter(({ isBoolean }) => isBoolean)) {
      for (const other of heldByOne) {
        count(`pairs:${first.key}|${first.value}|${other.key}|${other.value}`);
      }
    }
  }

  for (const { columns, rows } of meanders) {
    count(`totals:${rows}|${columns}`);
  }

  const absent: string[] = [];
  const shapeTotals = new Map<string, number>();
  const holdersByKey = new Map<string, number>();
  const holdersByKeyShape = new Map<string, number>();

  for (const meander of meanders) {
    const shape = shapeOf(meander);

    shapeTotals.set(shape, (shapeTotals.get(shape) ?? 0) + 1);
  }

  for (const row of held) {
    const keyed = `${row.key}|${shapeOf(row)}`;

    holdersByKey.set(row.key, (holdersByKey.get(row.key) ?? 0) + 1);
    holdersByKeyShape.set(keyed, (holdersByKeyShape.get(keyed) ?? 0) + 1);
  }

  for (const { key } of catalog) {
    absent.push(
      `value|${key}|${meanders.length - (holdersByKey.get(key) ?? 0)}`,
    );

    for (const [shape, total] of shapeTotals) {
      const have = holdersByKeyShape.get(`${key}|${shape}`) ?? 0;

      absent.push(`shape|${shape}|${key}|${total - have}`);
    }
  }

  return {
    absent: absent.toSorted(),
    pairs: lines("pairs:"),
    shapes: lines("shapes:"),
    totals: lines("totals:"),
    values: lines("values:"),
  };
}

/**
 * The 0 or false bucket a reader derives from the stored tables alone: the
 * total minus the stored rows, in `bruteForceAggregates`' `absent` shape.
 */
export async function derivedAbsent(dataSource: DataSource): Promise<string[]> {
  const values: { absent: string; key: string }[] = await dataSource.query(
    `SELECT catalog.key,
            (SELECT COALESCE(SUM(meander_count), 0) FROM meanderaw.shape_counts)
            - COALESCE(SUM(counts.meander_count), 0) AS absent
     FROM meanderaw.characteristics catalog
     LEFT JOIN meanderaw.characteristic_value_counts counts ON counts.characteristic_id = catalog.id
     GROUP BY catalog.id, catalog.key`,
  );
  const shapes: { absent: string; key: string; shape: string }[] =
    await dataSource.query(
      `SELECT totals.rows || '|' || totals.columns AS shape, catalog.key,
              totals.meander_count - COALESCE(SUM(counts.meander_count), 0) AS absent
       FROM meanderaw.shape_counts totals
       CROSS JOIN meanderaw.characteristics catalog
       LEFT JOIN meanderaw.characteristic_shape_counts counts
         ON counts.characteristic_id = catalog.id AND counts.rows = totals.rows
        AND counts.columns = totals.columns
       GROUP BY totals.rows, totals.columns, totals.meander_count, catalog.id, catalog.key`,
    );

  return [
    ...values.map(({ absent, key }) => `value|${key}|${absent}`),
    ...shapes.map(
      ({ absent, key, shape }) => `shape|${shape}|${key}|${absent}`,
    ),
  ].toSorted();
}

/** Reads the aggregate tables as they stand. */
export async function storedAggregates(
  dataSource: DataSource,
): Promise<AggregateLines> {
  const read = async (sql: string): Promise<string[]> => {
    const rows: { line: string }[] = await dataSource.query(sql);

    return rows.map(({ line }) => line).toSorted();
  };

  return {
    pairs: await read(
      `SELECT first.key || '|' || counts.value || '|' || other.key || '|' || counts.other_value || '|' || counts.meander_count AS line
       FROM meanderaw.characteristic_pair_counts counts
       JOIN meanderaw.characteristics first ON first.id = counts.characteristic_id
       JOIN meanderaw.characteristics other ON other.id = counts.other_characteristic_id`,
    ),
    shapes: await read(
      `SELECT counts.rows || '|' || counts.columns || '|' || catalog.key || '|' || counts.value || '|' || counts.meander_count AS line
       FROM meanderaw.characteristic_shape_counts counts
       JOIN meanderaw.characteristics catalog ON catalog.id = counts.characteristic_id`,
    ),
    totals: await read(
      `SELECT rows || '|' || columns || '|' || meander_count AS line FROM meanderaw.shape_counts`,
    ),
    values: await read(
      `SELECT catalog.key || '|' || counts.value || '|' || counts.meander_count AS line
       FROM meanderaw.characteristic_value_counts counts
       JOIN meanderaw.characteristics catalog ON catalog.id = counts.characteristic_id`,
    ),
  };
}
