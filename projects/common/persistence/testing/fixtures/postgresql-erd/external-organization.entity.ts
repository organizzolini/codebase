import { Entity, ManyToOne } from "typeorm";

import { PostgresqlIdentifiableEntity } from "../../../src/modules/postgresql/modules/base-entities/identifiable.entity";

import { ErdExternalRegion } from "./external-region.entity";

/** An out-of-scope entity that itself relates to a region. */
@Entity()
export class ErdExternalOrganization extends PostgresqlIdentifiableEntity {
  @ManyToOne(() => ErdExternalRegion)
  region!: ErdExternalRegion;
}
