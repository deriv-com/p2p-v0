/**
 * Manual feature flags. Flip a value to false to hide the feature across the app.
 *
 * For now these are hard-coded. Migrate to remote config (Datadog / Firebase /
 * env vars) once a flagging system is set up.
 */
export const FEATURE_FLAGS = {
  /** Closed group (private ads + closed group list). Hidden temporarily. */
  closedGroup: false,
} as const
