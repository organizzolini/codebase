export {
  DATABASE_ENTITIES,
  DATABASE_ENTITIES as MEANDERAW_DATABASE_ENTITIES,
  MEANDERAW_DATABASE_MIGRATIONS,
} from "./modules/database/data-source.constants";
// 📤 Exports
export { DATABASE_PROJECT as MEANDERAW_PROJECT } from "./modules/database/database.constants";
export {
  BIGINT_NUMBER_TRANSFORMER,
  UnknownCharacteristicError,
} from "./modules/database/database.constants";
export { DatabaseModule as MeanderawDatabaseModule } from "./modules/database/database.module";
export { DatabaseService as MeanderawDatabaseService } from "./modules/database/database.service";
export type {
  CharacteristicRecord,
  MeanderHolding,
  MeanderPatternShapeCount,
  MeanderRecord,
  MeanderShape,
  StoredCharacteristicValues,
} from "./modules/database/database.types";
export { AggregateMarker } from "./modules/database/modules/aggregate/aggregate-marker.entity";
export { CharacteristicPairCount } from "./modules/database/modules/aggregate/characteristic-pair-count.entity";
export { CharacteristicShapeCount } from "./modules/database/modules/aggregate/characteristic-shape-count.entity";
export { CharacteristicValueCount } from "./modules/database/modules/aggregate/characteristic-value-count.entity";
export { MeanderawDatabaseAggregatesService } from "./modules/database/modules/aggregate/meanderaw-database-aggregates.service";
export { ShapeCount } from "./modules/database/modules/aggregate/shape-count.entity";
export { Characteristic } from "./modules/database/modules/characteristic/characteristic.entity";
export { MeanderCharacteristic } from "./modules/database/modules/characteristic/meander-characteristic.entity";
export { Meander } from "./modules/database/modules/meander/meander.entity";
