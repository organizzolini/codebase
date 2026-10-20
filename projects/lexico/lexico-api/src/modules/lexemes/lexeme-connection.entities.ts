import { Paginated } from "@codebase/interface";

import { FormType } from "./forms/form.entities";
import { PrincipalPartType } from "./principal-part.entities";
import { PronunciationType } from "./pronunciation.entities";
import { TranslationType } from "./translation.entities";

/** Relay connection for forms linked to one lexeme. */
export const FormConnectionType = Paginated(FormType, "Form");

/** Relay connection for principal parts linked to one lexeme. */
export const PrincipalPartConnectionType = Paginated(
  PrincipalPartType,
  "PrincipalPart",
);

/** Relay connection for pronunciations linked to one lexeme. */
export const PronunciationConnectionType = Paginated(
  PronunciationType,
  "Pronunciation",
);

/** Relay connection for translations linked to one lexeme. */
export const TranslationConnectionType = Paginated(
  TranslationType,
  "Translation",
);
