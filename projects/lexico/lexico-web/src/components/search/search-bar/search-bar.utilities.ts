// 🔏 Private Functions

// 🌎 Public Functions

/**
 * Wraps a function so it runs once calls stop for the given delay, with a way to cancel the pending call.
 */
export function debounce<TArgument>(
  action: (argument: TArgument) => void,
  delayMilliseconds: number,
): { cancel: () => void } & ((argument: TArgument) => void) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const debounced = (argument: TArgument): void => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      action(argument);
    }, delayMilliseconds);
  };
  debounced.cancel = (): void => {
    clearTimeout(timer);
  };
  return debounced;
}
