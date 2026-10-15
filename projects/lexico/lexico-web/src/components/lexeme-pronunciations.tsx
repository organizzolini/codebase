import type { ReactNode } from "react";

// 🔖 Type

/**
 * One way a lexeme is pronounced.
 */
export interface LexemePronunciation {
  phonetic: string;
  variant: string;
}

/**
 * The properties LexemePronunciations accepts.
 */
export interface LexemePronunciationsProperties {
  className?: string;
  pronunciations: LexemePronunciation[];
}

// 🧩 Component

/**
 * How a lexeme is pronounced in each variant of Latin that has a
 * transcription, such as classical and ecclesiastical.
 */
export function LexemePronunciations(
  properties: Readonly<LexemePronunciationsProperties>,
): ReactNode {
  const { className, pronunciations } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (pronunciations.length === 0) {
    return undefined;
  }

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="lexeme-pronunciations"
    >
      <dl className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {pronunciations.map(({ phonetic, variant }) => (
          <div
            key={variant}
            className="flex items-baseline gap-1.5"
          >
            <dt className="text-xs text-muted-foreground capitalize">
              {variant}
            </dt>
            <dd>{phonetic}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
