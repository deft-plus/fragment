// Copyright the Deft+ authors. All rights reserved. Apache-2.0 license

/**
 * Context passed to the matcher implementation functions.
 * @internal
 */
export interface ExpectContext {
  /** Whether the matcher is negated. */
  negated: boolean;
  /** Context from the deno test runner. */
  t: Deno.TestContext | null;
  /** Utility function to throw an assertion error. */
  throw: (options: {
    /** Whether the assertion passes or not. */
    pass: boolean;
    /** The message to use. */
    message: {
      /** The default message. */
      default: string;
      /** The negated message. */
      negated: string;
    };
  }) => void;
}
