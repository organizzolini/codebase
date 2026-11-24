import { Entity } from "typeorm";

import { PostgresqlIdentifiableEntity } from "../../../src/modules/postgresql/modules/base-entities/identifiable.entity";

/** A second-hop entity that the ERD reader must not follow. */
@Entity()
export class ErdExternalRegion extends PostgresqlIdentifiableEntity {}
