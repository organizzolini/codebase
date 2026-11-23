import "reflect-metadata";

import { createDataSource } from "@codebase/persistence";

import { Migration1791160950069 } from "../../../migrations/1791160950069-migration";
import { Migration1791414023001 } from "../../../migrations/1791414023001-migration";
import { Migration1794630084904 } from "../../../migrations/1794630084904-migration";
import { Migration1794700000000 } from "../../../migrations/1794700000000-migration";
import { Migration1794800000000 } from "../../../migrations/1794800000000-migration";
import { Migration1794900000000 } from "../../../migrations/1794900000000-migration";
import { Migration1795000000000 } from "../../../migrations/1795000000000-migration";

import { MEANDERAW_PROJECT } from "./meanderaw-database.constants";
import { AggregateMarker } from "./modules/aggregate/aggregate-marker.entity";
import { CharacteristicPairCount } from "./modules/aggregate/characteristic-pair-count.entity";
import { CharacteristicShapeCount } from "./modules/aggregate/characteristic-shape-count.entity";
import { CharacteristicValueCount } from "./modules/aggregate/characteristic-value-count.entity";
import { ShapeCount } from "./modules/aggregate/shape-count.entity";
import { Characteristic } from "./modules/characteristic/characteristic.entity";
import { MeanderCharacteristic } from "./modules/characteristic/meander-characteristic.entity";
import { Meander } from "./modules/meander/meander.entity";

/** Tables shared by every meanderaw-schema app. */
export const MEANDERAW_DATABASE_ENTITIES = [
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
export const MEANDERAW_DATABASE_MIGRATIONS = [
  Migration1791160950069,
  Migration1791414023001,
  Migration1794630084904,
  Migration1794700000000,
  Migration1794800000000,
  Migration1794900000000,
  Migration1795000000000,
] as const;

/** TypeORM CLI data source; reads only `MEANDERAW_POSTGRES_*`, never syncs. */
export const meanderawDataSource = createDataSource({
  entities: [...MEANDERAW_DATABASE_ENTITIES],
  migrations: ["migrations/*.ts"],
  project: MEANDERAW_PROJECT,
});
