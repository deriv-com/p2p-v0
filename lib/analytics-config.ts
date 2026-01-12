/**
 * Analytics configuration for @deriv-com/analytics
 * Contains Rudderstack and Growthbook keys
 */

export const analyticsConfig = {
  rudderstackKey: process.env.NEXT_PUBLIC_RUDDERSTACK_KEY || "",
  growthbookKey: process.env.NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY,
  growthbookDecryptionKey: process.env.NEXT_PUBLIC_GROWTHBOOK_DECRYPTION_KEY,
  isProduction: process.env.NEXT_PUBLIC_NODE_ENV === "production",
}
