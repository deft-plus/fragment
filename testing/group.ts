// Copyright the Deft+ authors. All rights reserved. Apache-2.0 license
// This module is browser compatible.

/**
 * Implementation for {@link group} function.
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
 * group({
 *   name: "example",
 *   fn: () => {
 *     test("should pass", () => {
 *       // test case
 *       assertEquals(2 + 2, 4);
 *     });
 *   },
 *   // Additional options from Deno.TestDefinition...
 * });
 * ```
 *
 * @module
 */

import { type GroupDefinition, Suite } from './api.ts';

/**
 * Registers a new group suite.
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
 * @param name - The name of the group suite.
 * @param fn - The function to define the group suite.
 */
export function group(name: string, fn: () => void): void;

/**
 * Registers a new group suite.
 *
 * @example Usage
 * ```ts
 * group({
 *   name: "example",
 *   fn: () => {
 *     test("should pass", () => {
 *       // test case
 *       assertEquals(2 + 2, 4);
 *     });
 *   },
 *   // Additional options from Deno.TestDefinition...
 * });
 * ```
 *
 * @param options - The options to create the group suite.
 */
export function group(options: GroupOptions): void;
export function group(...args: GroupArgs): void {
  if (Suite.runningCount > 0) {
    throw new Error(
      'Cannot register new test suites after already registered test cases start running',
    );
  }

  const options = groupDefinition(...args);
  if (!Suite.started) {
    Suite.started = true;
  }

  new Suite(options);
}

/**
 * Registers a new group suite to run exclusively.
 *
 * @example Usage
 * ```ts
 * group.only("example", () => {
 *   test("should pass", () => {
 *     // test case
 *     assertEquals(2 + 2, 4);
 *   });
 * });
 * ```
 *
 * @param name - The name of the group suite.
 * @param fn - The function to define the group suite.
 */
function groupOnly(name: string, fn: () => void): void;

/**
 * Registers a new group suite to run exclusively.
 *
 * @example Usage
 * ```ts
 * group.only({
 *   name: "example",
 *   fn: () => {
 *     test("should pass", () => {
 *       // test case
 *       assertEquals(2 + 2, 4);
 *     });
 *   },
 *   // Additional options from Deno.TestDefinition...
 * });
 * ```
 *
 * @param options - The options to create the group suite.
 */
function groupOnly(options: GroupOptions): void;
function groupOnly(...args: GroupArgs): void {
  const options = groupDefinition(...args);
  group({
    ...options,
    only: true,
  });
}

/**
 * Registers a new group suite to run exclusively.
 *
 * @example Usage with name and function
 * ```ts
 * group.only("example", () => {
 *   test("should pass", () => {
 *     // test case
 *     assertEquals(2 + 2, 4);
 *   });
 * });
 * ```
 *
 * @example Usage with options
 * ```ts
 * group.only({
 *   name: "example",
 *   fn: () => {
 *     test("should pass", () => {
 *       // test case
 *       assertEquals(2 + 2, 4);
 *     });
 *   },
 *   // Additional options from Deno.TestDefinition...
 * });
 * ```
 *
 * @param args - The arguments to create the group suite.
 */
group.only = groupOnly;

/**
 * Registers a new group suite to ignore.
 *
 * @example Usage
 * ```ts
 * group.ignore("example", () => {
 *   test("should pass", () => {
 *     // test case
 *     assertEquals(2 + 2, 4);
 *   });
 * });
 * ```
 *
 * @param name - The name of the group suite.
 * @param fn - The function to define the group suite.
 */
function groupIgnore(name: string, fn: () => void): void;

/**
 * Registers a new group suite to ignore.
 *
 * @example Usage
 * ```ts
 * group.ignore({
 *   name: "example",
 *   fn: () => {
 *     test("should pass", () => {
 *       // test case
 *       assertEquals(2 + 2, 4);
 *     });
 *   },
 *   // Additional options from Deno.TestDefinition...
 * });
 * ```
 *
 * @param options - The options to create the group suite.
 */
function groupIgnore(options: GroupOptions): void;
function groupIgnore(...args: GroupArgs): void {
  const options = groupDefinition(...args);
  group({
    ...options,
    ignore: true,
  });
}

/**
 * Registers a new group suite to ignore.
 *
 * @example Usage with name and function
 * ```ts
 * group.ignore("example", () => {
 *   test("should pass", () => {
 *     // test case
 *     assertEquals(2 + 2, 4);
 *   });
 * });
 * ```
 *
 * @example Usage with options
 * ```ts
 * group.ignore({
 *   name: "example",
 *   fn: () => {
 *     test("should pass", () => {
 *       // test case
 *       assertEquals(2 + 2, 4);
 *     });
 *   },
 *   // Additional options from Deno.TestDefinition...
 * });
 * ```
 *
 * @param args - The arguments to create the group suite.
 */
group.ignore = groupIgnore;

/**
 * Creates a group definition from the given arguments.
 *
 * @param args - The arguments to create the group definition.
 * @returns The group definition.
 */
function groupDefinition(...args: GroupArgs): GroupDefinition {
  const [nameOrOptions, fn] = args;

  return typeof nameOrOptions === 'object'
    // Args are options.
    ? {
      ...nameOrOptions,
      hooks: [],
      ...(Suite.current && { suite: Suite.current }),
    }
    // Args are name and fn.
    : {
      name: nameOrOptions,
      fn: fn as () => void,
      hooks: [],
      ...(Suite.current && { suite: Suite.current }),
    };
}

/** Options to create a test group. */
interface GroupOptions extends Omit<Deno.TestDefinition, 'fn'> {
  /** The main function to define the group case. */
  fn: () => void;
}

/** Possible arguments for defining a test group. */
type GroupArgs = [name: string, fn: () => void] | [options: GroupOptions];
