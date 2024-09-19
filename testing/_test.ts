// Copyright the Deft+ authors. All rights reserved. Apache-2.0 license

/**
 * Implementation for {@link test} function.
 *
 * @example Usage with name and function
 * ```ts
 * group("example", () => {
 *   test("should pass", () => {
 *     // test case
 *     assertEquals(2 + 2, 4);
 *   });
 * });
 * ```
 *
 * @example Usage with options
 * ```ts
 *
 * group("example", () => {
 *   test({
 *     name: "should pass",
 *     fn: () => {
 *       // test case
 *       assertEquals(2 + 2, 4);
 *     },
 *     // Additional options from Deno.TestDefinition...
 *   });
 * });
 * ```
 *
 * @module
 */

import type { Awaitable } from '@fragment/utils';

import { Suite, type TestDefinition } from './_api.ts';

/**
 * Registers a new test suite.
 *
 * @example Usage
 * ```ts
 * group("example", () => {
 *   test("should pass", () => {
 *     // test case
 *     assertEquals(2 + 2, 4);
 *   });
 * });
 * ```
 *
 * @param name - The name of the test suite.
 * @param fn - The function to define the test suite.
 */
export function test(name: string, fn: () => Awaitable<void>): void;

/**
 * Registers a new test suite.
 *
 * @example Usage
 * ```ts
 * group("example", () => {
 *   test({
 *     name: "should pass",
 *     fn: () => {
 *       // test case
 *       assertEquals(2 + 2, 4);
 *     },
 *     // Additional options from Deno.TestDefinition...
 *   });
 * });
 * ```
 *
 * @param options - The options to define the test suite.
 */
export function test(options: TestOptions): void;
export function test(...args: TestArgs): void {
  if (Suite.runningCount > 0) {
    throw new Error('Cannot register new test after already registered test start running');
  }

  const options = testDefinition(...args);
  const testSuite = options.suite ? Suite.suites.get(options.suite.identifier) : Suite.current;

  if (!Suite.started) {
    Suite.started = true;
  }

  if (testSuite) {
    Suite.addStep(testSuite, options);
    return;
  }

  Suite.registerTest({
    ...options,
    fn: async () => {
      Suite.runningCount++;

      try {
        await options.fn();
      } finally {
        Suite.runningCount--;
      }
    },
  });
}

/**
 * Registers a new test suite to run exclusively.
 *
 * @example Usage
 * ```ts
 * group("example", () => {
 *   test.only("should pass", () => {
 *     // test case
 *     assertEquals(2 + 2, 4);
 *   });
 * });
 * ```
 *
 * @param name - The name of the test suite.
 * @param fn - The function to define the test suite.
 */
function testOnly(name: string, fn: () => Awaitable<void>): void;

/**
 * Registers a new test suite to run exclusively.
 *
 * @example Usage
 * ```ts
 * group("example", () => {
 *   test.only({
 *     name: "should pass",
 *     fn: () => {
 *       // test case
 *       assertEquals(2 + 2, 4);
 *     },
 *     // Additional options from Deno.TestDefinition...
 *   });
 * });
 * ```
 *
 * @param options - The options to define the test suite.
 */
function testOnly(options: TestOptions): void;
function testOnly(...args: TestArgs): void {
  const options = testDefinition(...args);
  return test({
    ...options,
    only: true,
  });
}

/**
 * Registers a new test suite to run exclusively.
 *
 * @example Usage
 * ```ts
 * group("example", () => {
 *   test.only("should pass", () => {
 *     // test case
 *     assertEquals(2 + 2, 4);
 *   });
 * });
 *
 * @example Usage with options
 * ```ts
 * group("example", () => {
 *   test.only({
 *     name: "should pass",
 *     fn: () => {
 *       // test case
 *       assertEquals(2 + 2, 4);
 *     },
 *     // Additional options from Deno.TestDefinition...
 *   });
 * });
 * ```
 *
 * @param args - The arguments to create the test suite.
 */
test.only = testOnly;

/**
 * Registers a new test suite to ignore.
 *
 * @example Usage
 * ```ts
 * group("example", () => {
 *   test.ignore("should pass", () => {
 *     // test case
 *     assertEquals(2 + 2, 4);
 *   });
 * });
 * ```
 *
 * @param name - The name of the group suite.
 * @param fn - The function to define the group suite.
 */
function testIgnore(name: string, fn: () => Awaitable<void>): void;

/**
 * Registers a new test suite to ignore.
 *
 * @example Usage
 * ```ts
 * group("example", () => {
 *   test.ignore({
 *     name: "should pass",
 *     fn: () => {
 *       // test case
 *       assertEquals(2 + 2, 4);
 *     },
 *     // Additional options from Deno.TestDefinition...
 *   });
 * });
 * ```
 *
 * @param options - The options to define the test suite.
 */
function testIgnore(options: TestOptions): void;
function testIgnore(...args: TestArgs): void {
  const options = testDefinition(...args);
  return test({
    ...options,
    ignore: true,
  });
}

/**
 * Registers a new test suite to ignore.
 *
 * @example Usage with name and function
 * ```ts
 * group("example", () => {
 *   test.ignore("should pass", () => {
 *     // test case
 *     assertEquals(2 + 2, 4);
 *   });
 * });
 * ```
 *
 * @example Usage with options
 * ```ts
 * group("example", () => {
 *   test.ignore({
 *     name: "should pass",
 *     fn: () => {
 *       // test case
 *       assertEquals(2 + 2, 4);
 *     },
 *     // Additional options from Deno.TestDefinition...
 *   });
 * });
 * ```
 *
 * @param args - The arguments to create the test suite.
 */
test.ignore = testIgnore;

/**
 * Creates a test definition from the given arguments.
 *
 * @param args - The arguments to create the test definition.
 * @returns The test definition.
 */
function testDefinition(...args: TestArgs): TestDefinition {
  const [nameOrOptions, fn] = args;

  return typeof nameOrOptions === 'object'
    // Args are options.
    ? {
      ...nameOrOptions,
      ...(Suite.current && { suite: Suite.current }),
    }
    // Args are name and fn.
    : {
      name: nameOrOptions,
      fn: fn as () => Awaitable<void>,
      ...(Suite.current && { suite: Suite.current }),
    };
}

/** Options to create a test case. */
interface TestOptions extends Omit<Deno.TestDefinition, 'fn'> {
  /** The main function to define the test case. */
  fn: () => Awaitable<void>;
}

/** Possible arguments for defining a test case. */
type TestArgs = [name: string, fn: () => Awaitable<void>] | [options: TestOptions];
