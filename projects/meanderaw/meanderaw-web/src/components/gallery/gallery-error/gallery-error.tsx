import type { ReactNode } from "react";

// 🔖 Type

/**
 * The error that stopped a load, and how to retry.
 */
export interface GalleryErrorProperties {
  className?: string;
  error: unknown;
  onRetry: () => void;
}

// 🧩 Component

/**
 * Renders why the meanders did not load, with a button to try again.
 */
export function GalleryError(
  properties: Readonly<GalleryErrorProperties>,
): ReactNode {
  const { className, error, onRetry } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const message = error instanceof Error ? error.message : String(error);

  // 💪 Handlers
  const handleRetry = (): void => {
    onRetry();
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="gallery-error"
      role="alert"
    >
      <p className="text-(--danger)">The meanders did not load: {message}</p>
      <button
        className="mt-2 rounded-md border border-(--line) px-3 py-1 text-sm"
        onClick={handleRetry}
        type="button"
      >
        Try again
      </button>
    </div>
  );
}
