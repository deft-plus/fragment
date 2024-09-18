// Copyright the Deft+ authors. All rights reserved. Apache-2.0 license
// This module is browser compatible.

import { AssertionError } from '@std/assert';
import type { ExpectContext } from './_context.ts';

/**
 * Options for the {@link _assertionThrow} function.
 * @internal
 */
export interface AssertionThrowOptions {
  /** The context to use. */
  context: ExpectContext;
  /** Whether the assertion passes or not. */
  pass: boolean;
  /** The message to use. */
  message: {
    /** The default message. */
    default: string;
    /** The negated message. */
    negated: string;
  };
}

/**
 * Utility function to throw an assertion error.
 *
 * @param options - The options to use.
 * @throws AssertionError if the assertion fails.
 * @internal
 */
export function _assertionThrow(options: AssertionThrowOptions): void {
  if (options.context.negated && options.pass) {
    throw new AssertionError(options.message.negated);
  } else if (!options.context.negated && !options.pass) {
    throw new AssertionError(options.message.default);
  }
}
