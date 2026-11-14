import type { StoredCharacteristicValues } from "@codebase/meanderaw-db";
import type { DataSource } from "typeorm";

/** Every bridge row as `code|key|value`, sorted, so two draw runs compare by what they wrote. */
export async function bridgeRows(dataSource: DataSource): Promise<string[]> {
  const rows: { code: string; key: string; value: number }[] =
    await dataSource.query(
      `SELECT meander.code, catalog.key, bridge.value
       FROM meanderaw.meander_characteristics bridge
       JOIN meanderaw.characteristics catalog ON catalog.id = bridge.characteristic_id
       JOIN meanderaw.meanders meander ON meander.id = bridge.meander_id`,
    );

  return rows
    .map(({ code, key, value }) => `${code}|${key}|${value}`)
    .toSorted();
}

/**
 * One meander's characteristics read back from the bridge as the map a record
 * holds: a boolean as `true`, a number as itself.
 */
export async function storedCharacteristics(
  dataSource: DataSource,
  code: string,
): Promise<StoredCharacteristicValues> {
  const rows: { key: string; value: number; valueType: string }[] =
    await dataSource.query(
      `SELECT catalog.key, catalog.value_type AS "valueType", bridge.value
       FROM meanderaw.meander_characteristics bridge
       JOIN meanderaw.characteristics catalog ON catalog.id = bridge.characteristic_id
       JOIN meanderaw.meanders meander ON meander.id = bridge.meander_id
       WHERE meander.code = $1`,
      [code],
    );

  return Object.fromEntries(
    rows.map(({ key, value, valueType }) => [
      key,
      valueType === "boolean" ? true : value,
    ]),
  );
}
