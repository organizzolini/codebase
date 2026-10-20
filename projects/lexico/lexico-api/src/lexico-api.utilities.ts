import type { DeletableType } from "./deletable.entities";
import type { GraphQLFields } from "@codebase/interface";
import type { DeletableEntity } from "@codebase/persistence";

/**
 * Copies the shared base columns every soft-deletable entity exposes.
 */
export function toDeletableFields(
  entity: DeletableEntity,
): GraphQLFields<DeletableType> {
  return {
    createdAt: entity.createdAt,
    createdBy: entity.createdBy,
    deletedAt: entity.deletedAt,
    deletedBy: entity.deletedBy,
    id: entity.id,
    updatedAt: entity.updatedAt,
    updatedBy: entity.updatedBy,
  };
}
