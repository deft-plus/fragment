// Copyright the Deft+ authors. All rights reserved. Apache-2.0 license

import { assertSnapshot } from '@std/testing/snapshot';
import { AssertionError } from '@std/assert';
import type { MatcherImplOptions } from './_matcher_impl_options.ts';

/**
 * Asserts that the function throws an error that matches the snapshot.
 *
 * @param options - The options for the matcher implementation.
 * @throws if the actual error thrown does not match the snapshot.
 * @internal
 */
export async function toThrowMatchingSnapshotImpl(
  options: MatcherImplOptions<undefined>,
): Promise<void> {
  const { context, actual } = options;

  if (!context.t) {
    return context.throw({
      pass: false,
      message: {
        default: 'toThrowMatchingSnapshot must be called within a test case',
        negated: 'toThrowMatchingSnapshot must be called within a test case',
      },
    });
  }

  let thrown = false;
  let error: Error | undefined;

  if (typeof actual !== 'function') {
    throw new AssertionError('toThrowMatchingSnapshot must be called with a function or a promise');
  }

  try {
    actual();
  } catch (e) {
    thrown = true;
    error = e;
  }

  context.throw({
    pass: thrown,
    message: {
      default: 'Expected function to throw',
      negated: 'Expected function not to throw', // This should never happen.
    },
  });

  // Add file to path
  const prevOrigin = context.t.origin;
  context.t.origin = `file://${prevOrigin}`;

  await assertSnapshot(context.t, error?.message);

  // Reset origin
  context.t.origin = prevOrigin;
}
