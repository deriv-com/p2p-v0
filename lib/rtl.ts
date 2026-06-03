/**
 * Shared RTL layout tokens for p2p-v0.
 * Prefer logical Tailwind classes (start/end, ms/me, ps/pe, text-start) in components;
 * use these constants where a single class string is reused.
 */

/** Mirror LTR back / chevron-left icons so they point the correct way in RTL. */
export const RTL_MIRROR_ICON = "rtl:rotate-180"

/** Reverse visual tab order in RTL while keeping Radix `value` semantics unchanged. */
export const RTL_TABS_LIST = "rtl:flex-row-reverse"
