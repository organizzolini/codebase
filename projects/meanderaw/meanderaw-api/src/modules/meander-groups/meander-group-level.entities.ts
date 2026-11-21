import { Field, InputType } from "@nestjs/graphql";

// 🧬 Entities

/** One level to group by. */
@InputType({ description: "One level to group meanders by." })
export class MeanderGroupLevelInput {
  @Field(() => String, {
    description:
      "rows, columns, rowsColumns, lattice, isHardcoded or a characteristic key.",
  })
  field!: string;
}
