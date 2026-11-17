// ♟️ Constants

// The custom property the backdrop's mount sets on the document: how opaque
// the calendar's surfaces are drawn over the sky.
export const SURFACE_OPACITY_PROPERTY = "--surface-opacity";

// The backdrop is fixed to the viewport and behind the content, out of reach
// of the pointer, and its SVG fills it.
export const BACKDROP_CLASS_NAME =
  "pointer-events-none fixed inset-0 -z-10 overflow-hidden [&_svg]:size-full";
