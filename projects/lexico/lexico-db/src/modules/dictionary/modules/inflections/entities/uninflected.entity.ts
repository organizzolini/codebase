import { ChildEntity } from "typeorm";

import { Inflection } from "./inflection.entity";

/**
 * Inflection marker for lexemes that do not vary by inflection.
 */
@ChildEntity("uninflected")
export class UninflectedInflection extends Inflection {}
