import { iconNames } from "lucide-react/dynamic";

import type { IconName } from "lucide-react/dynamic";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * Whether lucide has an icon of this name.
 */
export function isIconName(name: string): name is IconName {
  return (iconNames as readonly string[]).includes(name);
}
