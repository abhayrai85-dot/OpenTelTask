/**
 * Universal type-mismatch values for per-field negative testing, per the
 * api-testing skill's three-tier rule. Import these; never redefine inline.
 */
export const INVALID_STRING_VALUES = [123, true, null, undefined] as const;
export const INVALID_NUMBER_VALUES = ['string', '123', true, null, undefined] as const;
