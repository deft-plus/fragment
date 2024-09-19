// Copyright the Deft+ authors. All rights reserved. Apache-2.0 license

import type { ExpectContext } from './_context.ts';

/**
 * Options passed to the matcher implementation functions.
 *
 * @template T The expected type of the value.
 * @internal
 */
export interface MatcherImplOptions<T = unknown> {
  /** The expected value. */
  expected: T;
  /** The actual value. */
  actual: unknown;
  /** The context passed to the matcher implementation functions. */
  context: ExpectContext;
}
