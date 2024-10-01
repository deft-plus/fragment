// Copyright the Deft+ authors. All rights reserved. Apache-2.0 license

import { assertSnapshot } from '@std/testing/snapshot';
import type { MatcherImplOptions } from './_matcher_impl_options.ts';

/**
 * Asserts that the actual value matches the snapshot.
 *
 * @param options - The options for the matcher implementation.
 * @throws if the actual value does not match the snapshot.
 * @internal
 */
export async function toMatchSnapshotImpl(options: MatcherImplOptions<undefined>): Promise<void> {
  const { context, actual } = options;

  if (!context.t) {
    return context.throw({
      pass: false,
      message: {
        default: 'toMatchSnapshot must be called within a test case',
        negated: 'toMatchSnapshot must be called within a test case',
      },
    });
  }

  // Add file to path
  const prevOrigin = context.t.origin;
  context.t.origin = `file://${prevOrigin}`;

  await assertSnapshot(context.t, actual);

  // Reset origin
  context.t.origin = prevOrigin;
}
