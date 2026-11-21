import { Link } from "@tanstack/react-router";
import {
  useCallback,
  useEffect,
  useRef as useReference,
  useState,
} from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@codebase/presentation";

import { getWordCandidates } from "./word-card.constants";
import {
  chooseCandidate,
  describeStatus,
  highlightProperties,
  listReadings,
  summarizeLookup,
} from "./word-card.utilities";

import type {
  WordCandidate,
  WordCardLookup,
  WordCardToken,
} from "./word-card.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The properties WordCard accepts.
 */
export interface WordCardProperties {
  className?: string;
  isFocused?: boolean;
  isHighlighted?: boolean;
  onLookup?: (lookup: WordCardLookup) => void;
  token: WordCardToken;
}

// 🧩 Component

/**
 * A clicked word and the card beside it, which looks the word up the first
 * time the reader opens it: its lemma, form, every translation, and entry link,
 * with every candidate listed when the spelling is ambiguous. A focused word scrolls
 * into view, and a highlighted word is lit up.
 */
export function WordCard(properties: Readonly<WordCardProperties>): ReactNode {
  const { className, isFocused, isHighlighted, onLookup, token } = properties;

  // 🪝 Hooks
  const [candidates, setCandidates] = useState<null | WordCandidate[]>(null);
  const [hasFailed, setHasFailed] = useState(false);
  const [chosen, setChosen] = useState<null | number>(null);
  const root = useReference<HTMLDivElement>(null);

  // 🏗 Setup
  const status = describeStatus(candidates, hasFailed);
  const selected = chooseCandidate(candidates, chosen);

  // 💪 Handlers
  const handleOpenChange = useCallback(
    (isOpen: boolean): void => {
      if (!isOpen) {
        return;
      }

      if (candidates !== null) {
        onLookup?.(summarizeLookup(candidates, false, chosen));
        return;
      }

      setHasFailed(false);
      getWordCandidates({ data: { tokenId: token.id } }).then(
        (found) => {
          setCandidates(found);
          onLookup?.(summarizeLookup(found, false, null));
        },
        () => {
          setHasFailed(true);
          onLookup?.(summarizeLookup(null, true, null));
        },
      );
    },
    [candidates, chosen, onLookup, token.id],
  );

  // ♻️ Lifecycle
  useEffect(() => {
    if (isFocused === true) {
      root.current?.scrollIntoView({ block: "center" });
    }
  }, [isFocused, root]);

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      ref={root}
      className={className}
      data-testid="word-card"
    >
      <Popover onOpenChange={handleOpenChange}>
        <PopoverTrigger
          {...highlightProperties(isHighlighted === true)}
          data-testid="reader-token"
          render={<button type="button" />}
        >
          {token.data}
        </PopoverTrigger>
        <PopoverContent
          align="start"
          data-testid="word-card-content"
          side="bottom"
        >
          {status === null ? null : <p role="status">{status.text}</p>}
          {candidates !== null && candidates.length > 1 ? (
            <ul className="space-y-1">
              {listReadings(candidates).map(({ candidate, key, position }) => (
                <li key={key}>
                  <button
                    className="w-full rounded-md p-2 text-left hover:bg-accent"
                    onClick={() => {
                      setChosen(position);
                      onLookup?.(summarizeLookup(candidates, false, position));
                    }}
                    type="button"
                  >
                    {candidate.lemma}, {candidate.description}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {selected === undefined ? null : (
            <div className="space-y-1">
              <p className="font-medium">
                {selected.lemma}{" "}
                <span className="font-normal text-muted-foreground">
                  {selected.partOfSpeech}
                </span>
              </p>
              <p className="text-muted-foreground">{selected.description}</p>
              {selected.translations.length === 0 ? null : (
                <ol
                  aria-label="Translations"
                  className="max-h-48 list-decimal space-y-0.5 overflow-y-auto pl-5"
                >
                  {selected.translations.map((translation, position) => (
                    <li key={`${String(position)}-${translation}`}>
                      {translation}
                    </li>
                  ))}
                </ol>
              )}
              <Link
                className="underline"
                search={{ query: selected.lemma }}
                to="/search"
              >
                Full entry
              </Link>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
