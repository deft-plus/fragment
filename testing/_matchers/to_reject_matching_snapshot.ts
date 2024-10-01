// Copyright the Deft+ authors. All rights reserved. Apache-2.0 license

import { AssertionError } from '@std/assert';
import { assertSnapshot } from '@std/testing/snapshot';

import type { MatcherImplOptions } from './_matcher_impl_options.ts';

/**
 * Asserts that the promise rejects with an error that matches the snapshot.
 *
 * @param options - The options for the matcher implementation.
 * @throws if the actual value is not a promise that rejects with a matching error.
 * @internal
 */
export async function toRejectMatchingSnapshotImpl(
  options: MatcherImplOptions<undefined>,
): Promise<void> {
  const { context, actual } = options;

  if (!context.t) {
    return context.throw({
      pass: false,
      message: {
        default: 'toRejectMatchingSnapshot must be called within a test case',
        negated: 'toRejectMatchingSnapshot must be called within a test case',
      },
    });
  }

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
      negated: 'Expected promise not to reject', // This should never happen.
    },
  });

  // Add file to path
  const prevOrigin = context.t.origin;
  context.t.origin = `file://${prevOrigin}`;

  await assertSnapshot(context.t, error?.message);

  // Reset origin
  context.t.origin = prevOrigin;
}
