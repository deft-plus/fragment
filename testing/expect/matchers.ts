// Copyright the Deft+ authors. All rights reserved. Apache-2.0 license
// This module is browser compatible.

import type { ExpectContext } from './_context.ts';
import type { MatcherImplOptions } from './_matcher_impl_options.ts';
// Matchers implementations.
import { toBeOneOfImpl } from './_matcher_to_be_one_of_impl.ts';
import { toEqualImpl } from './_matcher_to_equal_impl.ts';
import { toStrictEqualImpl } from './_matcher_to_strict_equal_impl.ts';
import { toThrowImpl } from './_matcher_to_throw_impl.ts';
import { toRejectImpl } from './_matcher_to_reject_impl.ts';

/** The Matchers class contains all the matchers that can be used with the expect function. */
export abstract class Matchers {
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
   * Asserts that the actual value is undefined.
   *
   * @example Usage
   * ```ts
   * expect(undefined).toBeUndefined(); // Passes
   * expect(null).toBeUndefined(); // Fails
   * ```
   *
   * @param expected - The expected value.
   */
  public toBeUndefined(): void {
    return this.toBe(undefined);
  }

  /**
   * Asserts that the actual value is null.
   *
   * @example Usage
   * ```ts
   * expect(null).toBeNull(); // Passes
   * expect(undefined).toBeNull(); // Fails
   * ```
   *
   * @param expected - The expected value.
   */
  public toBeNull(): void {
    return this.toBe(null);
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
  private _matcherImplOptions<T>(expected: T): MatcherImplOptions<T> {
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
  private _context(): ExpectContext {
    return {
      negated: this.negated,
    };
  }
}
