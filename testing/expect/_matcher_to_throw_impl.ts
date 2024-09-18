// Copyright the Deft+ authors. All rights reserved. Apache-2.0 license
// This module is browser compatible.

import type { MatcherImplOptions } from './_matcher_impl_options.ts';
import { _assertionThrow } from './_assertion_throw.ts';
import { AssertionError } from '@std/assert';

/**
 * Asserts that the actual value is a function that throws. Optionally asserts that the error
 * message matches the expected error message.
 *
 * @param options - The options for the matcher implementation.
 * @throws if the actual value is not a function that throws.
 */
export function toThrowImpl(options: MatcherImplOptions): void {
  const { context, actual, expected: expectedErrorMessage } = options;

  let thrown = false;
  let error: Error | undefined;

  if (typeof actual !== 'function') {
    throw new AssertionError('toThrow must be called with a function or a promise');
  }

  try {
    actual();
  } catch (e) {
    thrown = true;
    error = e;
  }

  _assertionThrow({
    context: context,
    pass: thrown,
    message: {
      default: 'Expected function to throw',
      negated: 'Expected function not to throw',
    },
  });

  if (expectedErrorMessage) {
    _assertionThrow({
      context: context,
      pass: error?.message === expectedErrorMessage,
      message: {
        default: `Expected error message not to be ${expectedErrorMessage}`,
        negated: `Expected error message to be ${expectedErrorMessage}, but got ${error?.message}`,
      },
    });
  }
}
