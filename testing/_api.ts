// Copyright the Deft+ authors. All rights reserved. Apache-2.0 license
// This module is browser compatible.

import type { Awaitable } from '@fragment/utils';

/** A group of tests. */
abstract class SuiteSymbol {
  /** Unique identifier for the suite. */
  public abstract symbol: symbol;
}

/** The context object that is passed to each test case. */
export interface TestContext extends Omit<Deno.TestContext, 'step' | 'parent'> {
  parent?: TestContext;
}

/** The names of all the different types of hooks. */
export type TestHookType = 'beforeAll' | 'afterAll' | 'beforeEach' | 'afterEach';

/** A hook is a function that runs before or after a test suite or test case. */
export interface TestHook {
  type: TestHookType;
  fn(): Awaitable<void>;
}

/** The options for creating a test suite with the group function. */
export interface GroupDefinition extends Omit<Deno.TestDefinition, 'fn'> {
  /** The body of the test suite */
  fn: () => void;
  /**
   * The `group` function returns a `TestSuite` representing the group of tests.
   * If `group` is called within another `group` calls `fn`, the suite will default to that parent `group` calls returned `TestSuite`.
   * If `group` is not called within another `group` calls `fn`, the suite will default to the `TestSuite` representing the global group of tests.
   */
  suite?: SuiteSymbol;
  /** Hooks to setup/teardown before/after all tests in the suite. */
  hooks: TestHook[];
}

/** The options for creating an individual test case with the it function. */
export interface TestDefinition extends Omit<Deno.TestDefinition, 'fn'> {
  /** The body of the test case */
  fn: (context: TestContext) => Awaitable<void>;
  /**
   * The `group` function returns a `TestSuite` representing the group of tests.
   * If `test` is called within a `group` calls `fn`, the suite will default to that parent `group` calls returned `TestSuite`.
   * If `test` is not called within a `group` calls `fn`, the suite will default to the `TestSuite` representing the global group of tests.
   */
  suite?: SuiteSymbol;
}

/** An internal representation of a group of tests. */
export class Suite implements SuiteSymbol {
  /** Stores how many test suites are executing. */
  static runningCount = 0;

  /** If a test has been registered yet. Block adding global hooks if a test has been registered. */
  static started = false;

  /** A map of all test suites by symbol. */
  static suites = new Map<symbol, Suite>();

  /** The current test suite being registered. */
  static current: Suite | null = null;

  /** The stack of tests that are actively running. */
  static active: symbol[] = [];

  /** Unique identifier for the suite. */
  public symbol: symbol;

  /** Reference to the group definition of the suit. */
  protected group: GroupDefinition;

  /** Steps to run in the group. */
  protected steps: (Suite | TestDefinition)[];

  /** If the group has an only step case. */
  protected hasOnlyStep: boolean;

  constructor(group: GroupDefinition) {
    this.group = group;
    this.steps = [];
    this.hasOnlyStep = false;

    const parentSuite = this.group.suite
      ? Suite.suites.get(this.group.suite.symbol)
      : Suite.current;

    this.symbol = Symbol();
    Suite.suites.set(this.symbol, this);

    const previousSuite = Suite.current;
    Suite.current = this;

    try {
      // Event if type forces fn to be a function, it can be undefined in the global group.
      const value = group.fn?.() as unknown as () => Awaitable<void>;
      if (value instanceof Promise) {
        throw new Error('Returning a Promise from "group" is not supported');
      }
    } finally {
      Suite.current = previousSuite;
    }

    if (parentSuite) {
      Suite.addStep(parentSuite, this);
      return;
    }

    Suite.registerTest({
      ...this.group,
      only: !this.group.ignore && this.hasOnlyStep ? true : this.group.only,
      name: this.group.name,
      fn: async (t) => {
        Suite.runningCount++;
        try {
          await Suite.executeHooks('beforeAll', this.group.hooks);

          try {
            Suite.active.push(this.symbol);
            await Suite.run(this, t);
          } finally {
            Suite.active.pop();
            await Suite.executeHooks('afterAll', this.group.hooks);
          }
        } finally {
          Suite.runningCount--;
        }
      },
    });
  }

  /** This is used internally for testing this module. */
  static reset(): void {
    Suite.runningCount = 0;
    Suite.started = false;
    Suite.current = null;
    Suite.active = [];
  }

  /** This is used internally to register tests. */
  static registerTest(options: Deno.TestDefinition): void {
    const filteredOptions = Object.fromEntries(
      Object.entries(options).filter(([_, v]) => v !== undefined),
    );

    Deno.test(filteredOptions as Deno.TestDefinition);
  }

  /** Updates all steps within top level suite to have ignore set to true if only is not set to true on step. */
  static addingOnlyStep(suite: Suite): void {
    if (!suite.hasOnlyStep) {
      suite.steps = suite.steps.filter((step) => step instanceof Suite || step.only);
      suite.hasOnlyStep = true;
    }

    const parentSuite = suite.group.suite && Suite.suites.get(suite.group.suite.symbol);
    if (parentSuite) {
      Suite.addingOnlyStep(parentSuite);
    }
  }

  /** This is used internally to add steps to a test suite. */
  static addStep(suite: Suite, step: Suite | TestDefinition): void {
    if (step instanceof Suite ? step.hasOnlyStep || step.group.only : step.only) {
      // Nested groups.
      Suite.addingOnlyStep(suite);
    }

    if (!(suite.hasOnlyStep && !(step instanceof Suite) && !step.only)) {
      // Add the step to the suite.
      suite.steps.push(step);
    }
  }

  /** This is used internally to add hooks to a test suite. */
  static setHook(suite: Suite, hook: TestHook): void {
    suite.group.hooks ??= [];
    suite.group.hooks.push(hook);
  }

  /** This is used internally to run all steps for a test suite. */
  static async run(suite: Suite, t: Deno.TestContext): Promise<void> {
    const hasOnly = suite.hasOnlyStep || suite.group.only || false;

    for (const step of suite.steps) {
      const isSuite = step instanceof Suite;
      const options = isSuite ? step.group : step;

      if (hasOnly && isSuite && !(step.hasOnlyStep || step.group.only)) {
        continue;
      }

      await t.step({
        ...options,
        name: options.name,
        fn: async (t) => {
          if (options.permissions) {
            throw new Error('permissions option not available for nested tests');
          }

          const ctx = Suite.createContext(t);

          if (isSuite) {
            // Nested groups.
            await Suite.executeHooks('beforeAll', step.group.hooks);

            try {
              Suite.active.push(step.symbol);
              await Suite.run(step, t);
            } finally {
              Suite.active.pop();
              await Suite.executeHooks('afterAll', step.group.hooks);
            }
          } else {
            // Test cases.
            // Event if type forces fn to be a function, it can be undefined in the global group.
            if (options.fn) {
              await Suite.runTest(ctx, options.fn);
            }
          }
        },
      });
    }
  }

  static async runTest(
    t: TestContext,
    fn: (t: TestContext) => Awaitable<void>,
    activeIndex = 0,
  ): Promise<void> {
    const suiteSymbol = Suite.active[activeIndex];
    const testSuite = suiteSymbol && Suite.suites.get(suiteSymbol);

    if (!testSuite) {
      await fn(t);
      return;
    }

    await Suite.executeHooks('beforeEach', testSuite.group.hooks);

    try {
      await Suite.runTest(t, fn, activeIndex + 1);
    } finally {
      await Suite.executeHooks('afterEach', testSuite.group.hooks);
    }
  }

  private static async executeHooks(name: TestHookType, hooks: TestHook[]): Promise<void> {
    for (const hook of hooks.filter((hook) => hook.type === name)) {
      await hook.fn();
    }
  }

  public static createContext(t: Deno.TestContext): TestContext {
    const { step: _, ...otherValues } = t;
    const context: TestContext = { ...otherValues }; // Clone the context object.

    const parent = otherValues.parent;
    if (parent) {
      const { step: _, ...parentValues } = parent;
      context.parent = { ...parentValues };
    }

    return context;
  }
}
