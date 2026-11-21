import { Field, ObjectType } from "@nestjs/graphql";

import {
  AuthorConnectionType,
  LineConnectionType,
  TextConnectionType,
} from "../connections/literature-connection.entities";

import type { AuthorType } from "../authors/author.entities";
import type { LineType } from "../lines/line.entities";
import type { TextType } from "../texts/text.entities";
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
