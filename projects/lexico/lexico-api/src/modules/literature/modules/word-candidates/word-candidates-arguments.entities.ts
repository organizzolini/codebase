import { ArgsType as ArgumentsType, Field, ID } from "@nestjs/graphql";

/** Arguments for listing the word candidates of a token. */
@ArgumentsType()
export class WordCandidatesArguments {
  @Field(() => ID, {
    description: "Identifier of the token to look up candidates for.",
  })
  public tokenId!: string;
}
