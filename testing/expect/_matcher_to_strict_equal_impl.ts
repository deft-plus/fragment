// Copyright the Deft+ authors. All rights reserved. Apache-2.0 license
// This module is browser compatible.

import { equal } from '@std/assert';

import type { MatcherImplOptions } from './_matcher_impl_options.ts';
import { _assertionThrow } from './_assertion_throw.ts';
/**
 * Asserts that the actual value is strict equal to the expected value.
 *
 * @param options - The options for the matcher implementation.
 * @throws if the actual value is not equal to the expected value.
 */
export function toStrictEqualImpl(options: MatcherImplOptions): void {
  const { context, actual, expected } = options;

  _assertionThrow({
    context,
    pass: equal(actual, expected),
    message: {
      default: `Expected ${actual} to strict equal ${expected}`,
      negated: `Expected ${actual} not to strict equal ${expected}`,
    },
  });
}
