import { ArgsType as ArgumentsType, Field, ID } from "@nestjs/graphql";

import { LibraryArguments } from "./library-arguments.entities";

/** Arguments for one page of an author's top-level works. */
@ArgumentsType()
export class LibraryWorksArguments extends LibraryArguments {
  @Field(() => ID)
  public authorId!: string;
}
