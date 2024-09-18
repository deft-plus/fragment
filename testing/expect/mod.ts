// Copyright the Deft+ authors. All rights reserved. Apache-2.0 license
// This module is browser compatible.

/**
 * This module provides Jest compatible expect assertion functionality.
 *
 * @example Usage
 * ```ts
 * import { expect } from '@fragment/testing';
 *
 * expect(1 + 1).toBe(2);
 * ```
 *
 * @module
 */

import { AssertionError } from '@std/assert';
import { Expect } from './expect.ts';

/**
 * The `expect` function is used to test a value. You will use `expect` along with a "matcher"
 * function to assert something about a value.
 *
 * @example Usage
 * ```ts
 * import { expect } from '@fragment/testing';
 *
 * function bestFruit(): string {
 *   return "grapefruit";
 * }
 *
 * Deno.test("the best flavor is grapefruit", () => {
 *   expect(bestFruit()).toBe("grapefruit");
 * });
 * ```
 *
 * In this case, `toBe` is the matcher function. There are a lot of different matcher functions,
 * documented in the main module description.
 *
 * The argument to `expect` should be the value that your code produces, and any argument to the
 * matcher should be the correct value. If you mix them up, your tests will still work, but the
 * error messages on failing tests will look strange.
 *
 * @param actual - The value to perform assertions on.
 * @returns An instance of `Expect` that can be used to perform assertions.
 */
export function expect(actual: unknown): Expect {
  return new Expect(actual);
}

/**
 * Assertion that always passes.
 *
 * @example Usage
 * ```ts
 * import { expect } from '@fragment/testing';
 *
 * Deno.test("this test always passes", () => {
 *   // This will always pass
 *   expect.pass();
 * });
 * ```
 */
expect.pass = function (): void {};

/**
 * Assertion that always fails.
 *
 * @example Usage
 * ```ts
 * import { expect } from '@fragment/testing';
 *
 * Deno.test("this test always fails", () => {
 *   // This will always fail
 *   expect.fail();
 *
 *   // This will also always fail
 *   expect.fail("This test always fails");
 * });
 * ```
 *
 * @param message - The message to display on failure.
 */
expect.fail = function (message = 'Failed assertion'): void {
  throw new AssertionError(message);
};
