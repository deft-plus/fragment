// Copyright the Deft+ authors. All rights reserved. Apache-2.0 license
// This module is browser compatible.

import { assertSnapshot } from '@std/testing/snapshot';

import type { MatcherImplOptions } from './_matcher_impl_options.ts';
import { _assertionThrow } from './_assertion_throw.ts';

/**
 * Asserts that the actual value matches the snapshot.
 *
 * @param options - The options for the matcher implementation.
 * @throws if the actual value does not match the snapshot.
 */
export async function toMatchSnapshotImpl(options: MatcherImplOptions<undefined>): Promise<void> {
  const { context, actual } = options;

  if (!context.t) {
    return _assertionThrow({
      context,
      pass: false,
      message: {
        default: 'toMatchSnapshot must be called within a test case',
        negated: 'toMatchSnapshot must be called within a test case',
      },
    });
  }

  await assertSnapshot(context.t, actual);
}
