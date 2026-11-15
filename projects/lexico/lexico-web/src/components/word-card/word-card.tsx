import { Link } from "@tanstack/react-router";
import {
  useCallback,
  useEffect,
  useRef as useReference,
  useState,
} from "react";

import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@codebase/presentation";

import { getWordCandidates } from "./word-card.constants";
import {
  chooseCandidate,
  describeStatus,
  highlightProperties,
  reportReading,
} from "./word-card.utilities";

import type { WordCandidate, WordCardToken } from "./word-card.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The properties WordCard accepts.
 */
export interface WordCardProperties {
  className?: string;
  isFocused?: boolean;
  isHighlighted?: boolean;
  onReading?: (reading: WordCandidate) => void;
  token: WordCardToken;
}

// 🧩 Component

/**
 * A clicked word and the card beside it, which looks the word up the first
 * time the reader opens it: its form, definition, and entry link, with every
 * candidate listed when the spelling is ambiguous. A focused word scrolls
 * into view, and a highlighted word is lit up.
 */
export function WordCard(properties: Readonly<WordCardProperties>): ReactNode {
  const { className, isFocused, isHighlighted, onReading, token } = properties;

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
        reportReading(candidates, chosen, onReading);
        return;
      }

      getWordCandidates({ data: { tokenId: token.id } })
        .then((found) => {
          setCandidates(found);
          reportReading(found, null, onReading);
        })
        .catch(() => {
          setHasFailed(true);
        });
    },
    [candidates, chosen, onReading, token.id],
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
          className="w-72 max-w-[calc(100vw-2rem)] space-y-2 text-sm"
          data-testid="word-card-content"
          side="bottom"
        >
          {status === null ? null : <p role="status">{status.text}</p>}
          {candidates !== null && candidates.length > 1 ? (
            <ul className="space-y-1">
              {candidates.map((candidate) => (
                <li key={`${candidate.lexemeId}-${candidate.description}`}>
                  <Button
                    className="h-auto w-full justify-start whitespace-normal py-1 text-left"
                    onClick={() => {
                      const index = candidates.indexOf(candidate);

                      setChosen(index);
                      reportReading(candidates, index, onReading);
                    }}
                    variant="ghost"
                  >
                    {candidate.lemma}, {candidate.description}
                  </Button>
                </li>
              ))}
            </ul>
          ) : null}
          {selected === undefined ? null : (
            <div className="space-y-1">
              <p className="font-medium">{selected.description}</p>
              {selected.definition === null ? null : (
                <p>{selected.definition}</p>
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
