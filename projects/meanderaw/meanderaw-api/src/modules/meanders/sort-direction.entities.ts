import { registerEnumType } from "@nestjs/graphql";

/** Which way a sort runs. */
export enum SortDirection {
  ASC = "ASC",
  DESC = "DESC",
}

registerEnumType(SortDirection, {
  description: "The direction a sort runs.",
  name: "SortDirection",
});
