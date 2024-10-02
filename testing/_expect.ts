// Copyright the Deft+ authors. All rights reserved. Apache-2.0 license

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
import type { ExpectContext } from './_matchers/_context.ts';
import type { MatcherImplOptions } from './_matchers/_matcher_impl_options.ts';
import { Suite } from './_suite.ts';
// Matchers implementations.
import { toBeOneOfImpl } from './_matchers/to_be_one_of.ts';
import { toEqualImpl } from './_matchers/to_equal.ts';
import { toStrictEqualImpl } from './_matchers/to_strict_equal.ts';
import { toThrowImpl } from './_matchers/to_throw.ts';
import { toRejectImpl } from './_matchers/to_reject.ts';
import { toMatchSnapshotImpl } from './_matchers/to_match_snapshot.ts';
import { toThrowMatchingSnapshotImpl } from './_matchers/to_throw_matching_snapshot.ts';
import { toRejectMatchingSnapshotImpl } from './_matchers/to_reject_matching_snapshot.ts';

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
 *   expect.toPass();
 * });
 * ```
 */
expect.toPass = function (): void {};

/**
 * Assertion that always fails.
 *
 * @example Usage
 * ```ts
 * import { expect } from '@fragment/testing';
 *
 * Deno.test("this test always fails", () => {
 *   // This will always fail
 *   expect.toFail();
 *
 *   // This will also always fail
 *   expect.toFail("This test always fails");
 * });
 * ```
 *
 * @param message - The message to display on failure.
 */
expect.toFail = function (message = 'Failed assertion'): void {
  throw new AssertionError(message);
};

/** This class contains all the common matchers that can be used for making assertions. */
abstract class Matchers {
  /** Whether the assertion is negated or not. */
  protected abstract negated: boolean;

  /** The actual value. */
  protected abstract actual: unknown;

  /**
   * Asserts that the actual value is one of the expected values.
   *
   * @example Usage
   * ```ts
   * expect(1).toBeOneOf([1, 2, 3]); // Passes
   * expect(1).toBeOneOf([2, 3, 4]); // Fails
   * ```
   *
   * @param expected - Array of expected values.
   */
  public toBeOneOf(expected: unknown[]): void {
    return toBeOneOfImpl(this._matcherImplOptions(expected));
  }

  /**
   * Asserts that the actual value is equal to the expected value.
   *
   * @example Usage
   * ```ts
   * expect(1).toBe(1); // Passes
   * expect(1).toBe(2); // Fails
   * ```
   *
   * @param expected - The expected value.
   */
  public toBe(expected: unknown): void {
    return this.toBeOneOf([expected]);
  }

  /**
   * Asserts that the actual value is equal to the expected value.
   *
   * @example Usage
   * ```ts
   * expect({ a: 1 }).toEqual({ a: 1 }); // Passes
   * expect({ a: 1 }).toEqual({ a: 2 }); // Fails
   * ```
   *
   * @param expected - The expected value.
   */
  public toEqual(expected: unknown): void {
    return toEqualImpl(this._matcherImplOptions(expected));
  }

  /**
   * Asserts that the actual value is strictly equal to the expected value.
   *
   * @example Usage
   * ```ts
   * expect({ a: 1 }).toStrictEqual({ a: 1 }); // Passes
   * expect({ a: 1 }).toStrictEqual({ a: 2 }); // Fails
   * ```
   *
   * @param expected - The expected value.
   */
  public toStrictEqual(expected: unknown): void {
    return toStrictEqualImpl(this._matcherImplOptions(expected));
  }

  /**
   * Asserts that the function throws an error.
   *
   * @example Usage
   * ```ts
   * expect(() => { throw new Error('error') }).toThrow(); // Passes
   * expect(() => {}).toThrow(); // Fails
   * ```
   *
   * @param errorMessage - The expected error message.
   */
  public toThrow(errorMessage?: string): void {
    return toThrowImpl(this._matcherImplOptions(errorMessage));
  }

  /**
   * Asserts that the promise rejects.
   *
   * @example Usage
   * ```ts
   * expect(() => Promise.reject(new Error('error'))).toReject(); // Passes
   * expect(() => Promise.resolve()).toReject(); // Fails
   *
   * expect(Promise.reject(new Error('error'))).toReject('error'); // Passes
   * expect(Promise.reject(new Error('error'))).toReject('another error'); // Fails
   * ```
   *
   * @param errorMessage - The expected error message.
   */
  public toReject(errorMessage?: string): Promise<void> {
    return toRejectImpl(this._matcherImplOptions(errorMessage));
  }

  /**
   * Asserts that the actual value is nil (undefined or null).
   *
   * @example Usage
   * ```ts
   * expect(undefined).toBeNil(); // Passes
   * expect(null).toBeNil(); // Passes
   * expect(0).toBeNil(); // Fails
   * ```
   *
   * @param expected - The expected value.
   */
  public toBeNil(): void {
    return this.toBeOneOf([undefined, null]);
  }

  /**
   * Utility method to create the options for the matcher implementations.
   *
   * @param expected - The expected value.
   * @returns The options for the matcher implementations.
   */
  protected _matcherImplOptions<T>(expected: T): MatcherImplOptions<T> {
    return {
      expected,
      actual: this.actual,
      context: this._context(),
    };
  }

  /**
   * Utility method to create the context for the matcher implementations.
   *
   * @returns The context for the matcher implementations.
   */
  protected _context(): ExpectContext {
    return {
      negated: this.negated,
      t: Suite.t,
      throw: (options) => {
        if (this.negated && options.pass) {
          throw new AssertionError(options.message.negated);
        } else if (!this.negated && !options.pass) {
          throw new AssertionError(options.message.default);
        }
      },
    };
  }
}

/** The main class for the expect function. This class contains all the matchers */
export class Expect extends Matchers {
  /** Whether the assertion is negated or not. */
  protected negated = false;

  /**
   * Creates a new ExpectNegated instance.
   *
   * @param actual - The actual value.
   */
  constructor(protected actual: unknown) {
    super();
  }

  /** This is used to negate the next assertion. */
  get not(): ExpectNegated {
    return new ExpectNegated(this.actual);
  }

  /**
   * Asserts that the actual value matches the snapshot.
   *
   * It's important to await this method to ensure the snapshot is saved.
   *
   * @example Usage
   * ```ts
   * await expect(1).toMatchSnapshot(); // Passes
   * await expect(2).toMatchSnapshot(); // Fails
   * ```
   *
   * **Note:** This method has to be called within a test case since it relies on the test context.
   */
  public toMatchSnapshot(): Promise<void> {
    return toMatchSnapshotImpl(this._matcherImplOptions(undefined));
  }

  /**
   * Asserts that the function throws an error that matches the snapshot.
   *
   * It's important to await this method to ensure the snapshot is saved.
   *
   * @example Usage
   * ```ts
   * await expect(() => { throw new Error('error') }).toThrowMatchingSnapshot(); // Passes
   * await expect(() => {}).toThrowMatchingSnapshot(); // Fails
   *
   * // Fails since the error message doesn't match the snapshot
   * await expect(() => { throw new Error('different error') }).toThrowMatchingSnapshot();
   * ```
   *
   * **Note:** This method has to be called within a test case since it relies on the test context.
   */
  public toThrowMatchingSnapshot(): Promise<void> {
    return toThrowMatchingSnapshotImpl(this._matcherImplOptions(undefined));
  }

  /**
   * Asserts that the promise rejects with an error that matches the snapshot.
   *
   * It's important to await this method to ensure the snapshot is saved.
   *
   * @example Usage
   * ```ts
   * await expect(Promise.reject(new Error('error'))).toRejectMatchingSnapshot(); // Passes
   * await expect(Promise.resolve()).toRejectMatchingSnapshot(); // Fails
   *
   * // Fails since the error message doesn't match the snapshot
   * await expect(Promise.reject(new Error('different error'))).toRejectMatchingSnapshot();
   * ```
   *
   * **Note:** This method has to be called within a test case since it relies on the test context.
   */
  public toRejectMatchingSnapshot(): Promise<void> {
    return toRejectMatchingSnapshotImpl(this._matcherImplOptions(undefined));
  }
}

/** A negated version of the Expect class. */
export class ExpectNegated extends Matchers {
  /** Whether the assertion is negated or not. */
  protected negated = true;

  /**
   * Creates a new ExpectNegated instance.
   *
   * @param actual - The actual value.
   */
  constructor(protected actual: unknown) {
    super();
  }
}
