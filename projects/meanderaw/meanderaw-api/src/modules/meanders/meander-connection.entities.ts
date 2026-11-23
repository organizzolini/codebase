import { ObjectType } from "@nestjs/graphql";

import { MeanderEntity } from "./meanders.entities";
import { Paginated } from "./modules/pagination/meanderaw-api.utilities";

/** A page of meanders, with page info and an exact total. */
@ObjectType({ description: "A page of meanders." })
export class MeanderConnection extends Paginated(MeanderEntity) {}
