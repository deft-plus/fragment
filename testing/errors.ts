// Copyright the Deft+ authors. All rights reserved. Apache-2.0 license
// This module is browser compatible.

/** Options for constructing an error. */
export interface AssertionErrorOptions extends ErrorOptions {
  /** The expected value. */
  expected?: unknown;
  /** The actual value. */
  actual?: unknown;
  /** Link to the test */
  link?: string;
}

/**
 * Error thrown when an assertion fails.
 *
 * @example Usage
 * ```ts
 * import { AssertionError } from "@std/assert";
 *
 * try {
 *   throw new AssertionError("foo", { cause: "bar" });
 * } catch (error) {
 *   if (error instanceof AssertionError) {
 *     error.message === "foo"; // true
 *     error.cause === "bar"; // true
 *   }
 * }
 * ```
 */
export class AssertionError extends Error {
  /** Constructs a new instance.
   *
   * @param message The error message.
   * @param options Additional options. This argument is still unstable. It may change in the future release.
   */
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'AssertionError';
  }
}
