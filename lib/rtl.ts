/**
 * Shared RTL layout tokens for p2p-v0.
 * Prefer logical Tailwind classes (start/end, ms/me, ps/pe, text-start) in components;
 * use these constants where a single class string is reused.
 */

/** Mirror LTR back / chevron-left icons so they point the correct way in RTL. */
export const RTL_MIRROR_ICON = "rtl:rotate-180"

/** Reverse visual tab order in RTL while keeping Radix `value` semantics unchanged. */
export const RTL_TABS_LIST = "rtl:flex-row-reverse"

/** Profile follow/blocked/counterparties: align search + sub-tabs to inline-start (right in RTL). */
export const PROFILE_TOOLBAR_ROW = "flex w-full items-center justify-start gap-4 mb-4"

/** Wrapper for segmented sub-tabs (Following / Followers) in profile. */
export const PROFILE_SUB_TABS_ROW = "flex w-full justify-start mb-2"

/** Payment method card row (pair with `dir="rtl"` on ancestor for mirrored layout). */
export const PAYMENT_METHOD_ROW = "flex justify-between items-center gap-2"

/** Icon + label cluster inside a payment method card. */
export const PAYMENT_METHOD_INFO = "flex items-start gap-2 flex-1 min-w-0"

export const PAYMENT_METHOD_TEXT = "flex-1 min-w-0 text-sm text-start"

export const PAYMENT_METHOD_SECTION_TITLE = "text-base font-bold mb-4 text-start"

/** Inline alert with icon + text in flex (markets order sidebar, etc.). */
export const ALERT_INLINE_FLEX =
  "flex items-start gap-2 text-start [&>svg]:!static [&>svg]:relative [&>svg]:!top-auto [&>svg]:shrink-0 [&>svg~*]:!ps-0 [&>svg~*]:!pr-0 [&>svg~*]:min-w-0 [&>svg~*]:flex-1 [&>svg+div]:!translate-y-0"

/** Modal/sheet header: title at inline-start, close at inline-end (flips in RTL). */
export const MODAL_HEADER_ROW = "flex items-center justify-between gap-4"
