// Copyright the Deft+ authors. All rights reserved. Apache-2.0 license

import { AssertionError } from '@std/assert';
import type { MatcherImplOptions } from './_matcher_impl_options.ts';

/**
 * Asserts that the actual value is a promise that rejects. Optionally asserts that the error
 * message matches the expected error message.
 *
 * @param options - The options for the matcher implementation.
 * @throws if the actual value is not a promise that rejects.
 * @internal
 */
export async function toRejectImpl(options: MatcherImplOptions): Promise<void> {
  const { context, actual, expected: expectedErrorMessage } = options;

  let thrown = false;
  let error: Error | undefined;

  if (!(actual instanceof Promise) && typeof actual !== 'function') {
    throw new AssertionError('toReject must be called with a function or a promise');
  }

  try {
    const promise = typeof actual === 'function' ? actual() : actual;

    if (!(promise instanceof Promise)) {
      throw new AssertionError('toReject must be called with a function that returns a promise');
    }

    await promise;
  } catch (e) {
    thrown = true;
    error = e;
  }

  context.throw({
    pass: thrown,
    message: {
      default: 'Expected promise to reject',
      negated: 'Expected promise not to reject',
    },
  });

  if (expectedErrorMessage) {
    context.throw({
      pass: error?.message === expectedErrorMessage,
      message: {
        default: `Expected error message not to be ${expectedErrorMessage}`,
        negated: `Expected error message to be ${expectedErrorMessage}, but got ${error?.message}`,
      },
    });
  }
}
