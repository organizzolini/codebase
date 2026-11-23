import { Field, ObjectType } from "@nestjs/graphql";

import { LibraryFacetValueType } from "./library-facet-value.entities";

/** The values present in the data for each data-driven library filter. */
@ObjectType("LibraryFacets")
export class LibraryFacetsType {
  @Field(() => [LibraryFacetValueType], {
    description: "Distinct inscription types, sorted by value.",
  })
  public inscriptionTypes!: LibraryFacetValueType[];

  @Field(() => [LibraryFacetValueType], {
    description: "Distinct inscription materials, sorted by value.",
  })
  public materials!: LibraryFacetValueType[];

  @Field(() => [LibraryFacetValueType], {
    description: "Distinct inscription provinces, sorted by value.",
  })
  public provinces!: LibraryFacetValueType[];
}
