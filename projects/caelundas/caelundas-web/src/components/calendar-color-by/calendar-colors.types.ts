// 🏷️ Types

/**
 * One kind of event and the color it is drawn in: a tag's path from its
 * root, which also colors every tag beneath it.
 */
export interface EventColorRule {
  color: string;
  label: string;
  path: string;
}
