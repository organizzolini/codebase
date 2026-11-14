import "reflect-metadata";

import { createDataSource } from "@codebase/persistence";

import { Characteristic } from "./entities/characteristic.entity";
import { MeanderCharacteristic } from "./entities/meander-characteristic.entity";
import { Meander } from "./entities/meander.entity";
import { MEANDERAW_PROJECT } from "./meanderaw-database.constants";
import { Migration1791160950069 } from "./migrations/1791160950069-migration";
import { Migration1791414023001 } from "./migrations/1791414023001-migration";
import { Migration1794630084904 } from "./migrations/1794630084904-migration";

/** Tables shared by every meanderaw-schema app. */
export const MEANDERAW_DATABASE_ENTITIES = [
  Characteristic,
  Meander,
  MeanderCharacteristic,
] as const;

/** All migrations in order, for tests; the runtime runs none. */
export const MEANDERAW_DATABASE_MIGRATIONS = [
  Migration1791160950069,
  Migration1791414023001,
  Migration1794630084904,
] as const;

/** TypeORM CLI data source; reads only `MEANDERAW_POSTGRES_*`, never syncs. */
export const meanderawDataSource = createDataSource({
  entities: [...MEANDERAW_DATABASE_ENTITIES],
  migrations: ["src/modules/meanderaw-database/migrations/*.ts"],
  project: MEANDERAW_PROJECT,
});
