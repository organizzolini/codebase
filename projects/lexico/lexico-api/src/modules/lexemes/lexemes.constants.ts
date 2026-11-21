// ♟️ Constants

import { AdjectivalFormType } from "./modules/forms/adjectival-form.entities";
import { AdverbFormType } from "./modules/forms/adverb-form.entities";
import { FiniteVerbFormType } from "./modules/forms/finite-verb-form.entities";
import { GerundFormType } from "./modules/forms/gerund-form.entities";
import { InfinitiveFormType } from "./modules/forms/infinitive-form.entities";
import { NominalFormType } from "./modules/forms/nominal-form.entities";
import { ParticipleFormType } from "./modules/forms/participle-form.entities";
import { SupineFormType } from "./modules/forms/supine-form.entities";
import { AdjectiveInflectionType } from "./modules/inflections/adjective-inflection.entities";
import { AdverbInflectionType } from "./modules/inflections/adverb-inflection.entities";
import { NounInflectionType } from "./modules/inflections/noun-inflection.entities";
import { PrepositionInflectionType } from "./modules/inflections/preposition-inflection.entities";
import { UninflectedInflectionType } from "./modules/inflections/uninflected-inflection.entities";
import { VerbInflectionType } from "./modules/inflections/verb-inflection.entities";

/** Concrete types no resolver names, so `Form` interfaces resolve. */
export const ORPHANED_GRAPHQL_TYPES = [
  NominalFormType,
  FiniteVerbFormType,
  ParticipleFormType,
  AdverbFormType,
  InfinitiveFormType,
  GerundFormType,
  SupineFormType,
  AdjectivalFormType,
  NounInflectionType,
  VerbInflectionType,
  AdjectiveInflectionType,
  AdverbInflectionType,
  PrepositionInflectionType,
  UninflectedInflectionType,
] as const;
