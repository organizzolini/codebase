import { Entity, ManyToOne } from "typeorm";

import { PostgresqlIdentifiableEntity } from "../../../src/modules/postgresql/modules/base-entities/identifiable.entity";

import { ErdExternalOrganization } from "./external-organization.entity";

/** An entity whose organization target is outside the selected glob. */
@Entity()
export class ErdExternalOwner extends PostgresqlIdentifiableEntity {
  @ManyToOne("ErdExternalOrganization")
  organization!: ErdExternalOrganization;

  @ManyToOne("ErdExternalOrganization")
  secondaryOrganization!: ErdExternalOrganization;
}
