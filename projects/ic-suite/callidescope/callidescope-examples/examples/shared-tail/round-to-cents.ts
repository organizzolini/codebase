/**
 * The tail two deep stacks share, so their mermaid diagrams converge.
 */
export function roundToCents(amount: number): number {
  return Math.round(amount * 100) / 100;
}
