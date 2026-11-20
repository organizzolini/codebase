export const DAY_MILLISECONDS = 86_400_000;

// One formatter per zone: the agenda formats every event's day, and building
// a formatter costs far more than using one.
export const DATE_FORMATS = new Map<string, Intl.DateTimeFormat>();

// The month grid always draws six weeks, so it shows up to six days of the
// previous month and up to fourteen of the next; a whole week either side
// covers both.
export const MONTH_LEADING_DAYS = 7;

export const MONTH_TRAILING_DAYS = 14;

export const WEEK_DAYS = 7;

// A zone's midnight lies within a day of UTC's.
export const BUFFER_DAYS = 1;
