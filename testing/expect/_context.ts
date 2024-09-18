// Copyright the Deft+ authors. All rights reserved. Apache-2.0 license
// This module is browser compatible.

/** Context passed to the matcher implementation functions. */
export interface ExpectContext {
  /** Whether the matcher is negated. */
  negated: boolean;
  /** Context from the deno test runner. */
  t: Deno.TestContext | null;
}
