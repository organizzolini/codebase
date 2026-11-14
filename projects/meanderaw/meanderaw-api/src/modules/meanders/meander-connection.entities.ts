import { ObjectType } from "@nestjs/graphql";

import { Paginated } from "../../meanderaw-api.utilities";

import { MeanderEntity } from "./meanders.entities";

/** A page of meanders, with page info and an exact total. */
@ObjectType({ description: "A page of meanders." })
export class MeanderConnection extends Paginated(MeanderEntity) {}
