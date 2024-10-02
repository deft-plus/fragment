// Copyright the Deft+ authors. All rights reserved. Apache-2.0 license

import type { MatcherImplOptions } from './_matcher_impl_options.ts';

/**
 * Asserts that the actual value is one of the expected values.
 *
 * @param options - The options for the matcher implementation.
 * @throws if the actual value is not one of the expected values.
 * @internal
 */
export function toBeOneOfImpl(options: MatcherImplOptions<unknown[]>): void {
  const { context, actual, expected } = options;

  context.throw({
    pass: expected.includes(actual),
    message: {
      default: `Expected ${actual} to be ${expected}`,
      negated: `Expected ${actual} not to be ${expected}`,
    },
  });
}
