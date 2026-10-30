// A rule's value comes from the builder or from a link someone may have
// edited by hand, so each reader keeps only what its field can use and
// answers "nothing" for the rest, which leaves the rule out of the query.

export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/u;
