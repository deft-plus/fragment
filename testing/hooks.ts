// Copyright the Deft+ authors. All rights reserved. Apache-2.0 license
// This module is browser compatible.

/**
 * Implements all the hooks ({@link beforeAll}, {@link afterAll}, {@link beforeEach} & {@link afterEach}) for the test suite.
 *
 * @module
 */

import type { Awaitable } from '@fragment/utils';

import { type GroupDefinition, Suite, type TestHook } from './api.ts';

/**
 * Adds a hook to the current suite, otherwise creates a global suite to add the hook.
 *
 * @param hook The hook to add.

 * @internal
 */
function addHook(hook: TestHook): void {
  if (Suite.started && !Suite.current) {
    throw new Error('Cannot add global hooks after a global test is registered');
  }

  Suite.current = new Suite({ name: 'global', hooks: [] } as unknown as GroupDefinition);
  Suite.addHook(Suite.current, hook);
}

/**
 * Run some shared setup before all of the tests in the suite.
 *
 * @example Usage
 * ```ts
 * beforeAll(() => {
 *  console.log("beforeAll");
 * });
 *
 * group("example", () => {
 *   test("should pass", () => {
 *     // test case
 *     assertEquals(2 + 2, 4);
 *   });
 * });
 * ```
 *
 * @param fn - The function to implement the setup behavior.
 */
export function beforeAll(fn: () => Awaitable<void>): void {
  addHook({ type: 'beforeAll', fn });
}

/**
 * Run some shared teardown after all of the tests in the suite.
 *
 * @example Usage
 * ```ts
 * afterAll(() => {
 *  console.log("afterAll");
 * });
 *
 * group("example", () => {
 *   test("should pass", () => {
 *     // test case
 *     assertEquals(2 + 2, 4);
 *   });
 * });
 * ```
 *
 * @param fn - The function to implement the teardown behavior.
 */
export function afterAll(fn: () => Awaitable<void>): void {
  addHook({ type: 'afterAll', fn });
}

/**
 * Run some shared setup before each test in the suite.
 *
 * @example Usage
 * ```ts
 * beforeEach(() => {
 *  console.log("beforeEach");
 * });
 *
 * group("example", () => {
 *   test("should pass", () => {
 *     // test case
 *     assertEquals(2 + 2, 4);
 *   });
 * });
 * ```
 *
 * @param fn - The function to implement the shared setup behavior
 */
export function beforeEach(fn: () => Awaitable<void>): void {
  addHook({ type: 'beforeAll', fn });
}

/**
 * Run some shared teardown after each test in the suite.
 *
 * @example Usage
 * ```ts
 * afterEach(() => {
 *  console.log("afterEach");
 * });
 *
 * group("example", () => {
 *   test("should pass", () => {
 *     // test case
 *     assertEquals(2 + 2, 4);
 *   });
 * });
 * ```
 *
 * @param fn - The function to implement the shared teardown behavior
 */
export function afterEach(fn: () => Awaitable<void>): void {
  addHook({ type: 'afterEach', fn });
}
