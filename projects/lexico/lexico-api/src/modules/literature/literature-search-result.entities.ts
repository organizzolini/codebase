import { Field, ObjectType } from "@nestjs/graphql";

import {
  AuthorConnectionType,
  LineConnectionType,
  TextConnectionType,
} from "./literature-connection.entities";

import type { AuthorType } from "./author.entities";
import type { LineType } from "./line.entities";
import type { TextType } from "./text.entities";
import type { Connection } from "@codebase/interface";

/** Aggregated result set for a literature search across authors, texts, and lines. */
@ObjectType()
export class LiteratureSearchResult {
  @Field(() => AuthorConnectionType)
  public authors!: Connection<AuthorType>;

  @Field(() => LineConnectionType)
  public lines!: Connection<LineType>;

  @Field(() => TextConnectionType)
  public texts!: Connection<TextType>;
}
