// Rows drawn beyond each edge of the viewport, so a fast fling does not
// show blank space before the next render catches up.
export const OVERSCAN = 6;

// The height assumed until the viewport is measured, and wherever it never
// is, as under jsdom: about a phone screen of rows.
export const UNMEASURED_HEIGHT = 720;

export const UNMEASURED_WIDTH = 640;
