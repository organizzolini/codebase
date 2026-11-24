import "reflect-metadata";

import { createDataSource } from "@codebase/persistence";

import { Migration1795470728582 } from "../../../migrations/1795470728582-migration";

import { DATABASE_PROJECT } from "./database.constants";
import { AggregateMarker } from "./modules/aggregate/aggregate-marker.entity";
import { CharacteristicPairCount } from "./modules/aggregate/characteristic-pair-count.entity";
import { CharacteristicShapeCount } from "./modules/aggregate/characteristic-shape-count.entity";
import { CharacteristicValueCount } from "./modules/aggregate/characteristic-value-count.entity";
import { ShapeCount } from "./modules/aggregate/shape-count.entity";
import { Characteristic } from "./modules/characteristic/characteristic.entity";
import { MeanderCharacteristic } from "./modules/characteristic/meander-characteristic.entity";
import { Meander } from "./modules/meander/meander.entity";

/** Tables shared by every meanderaw-schema app. */
export const DATABASE_ENTITIES = [
  AggregateMarker,
  Characteristic,
  CharacteristicPairCount,
  CharacteristicShapeCount,
  CharacteristicValueCount,
  Meander,
  MeanderCharacteristic,
  ShapeCount,
] as const;

/** All migrations in order, for tests; the runtime runs none. */
export const MEANDERAW_DATABASE_MIGRATIONS = [Migration1795470728582] as const;

/** TypeORM CLI data source; reads only `MEANDERAW_POSTGRES_*`, never syncs. */
export const databaseDataSource = createDataSource({
  entities: [...DATABASE_ENTITIES],
  migrations: ["migrations/*.ts"],
  project: DATABASE_PROJECT,
});
