// Copyright the Deft+ authors. All rights reserved. Apache-2.0 license

/**
 * Implementation for the testing APIs (internal).
 *
 * @module
 */

import type { Awaitable } from '@fragment/utils';

/**
 * Represents a group of tests within a suite.
 * @internal
 */
abstract class SuiteIdentifier {
  /** Unique identifier for the suite. */
  public abstract identifier: symbol;
}

/** Defines the possible types of test hooks. */
export type SuiteHookType = 'beforeAll' | 'afterAll' | 'beforeEach' | 'afterEach';

/** Describes a hook to be executed before or after tests. */
export interface SuiteHook {
  /** The type of the hook (before/after). */
  type: SuiteHookType;
  /** The action to be performed by the hook. */
  fn: () => Awaitable<void>;
}

/**
 * Options for defining a test suite group.
 * @internal
 */
export interface GroupDefinition extends Omit<Deno.TestDefinition, 'fn'> {
  /** The main function to define the group suite. */
  fn: () => void;
  /** Optional parent suite for the group. */
  suite?: SuiteIdentifier;
  /** Hooks for setting up and tearing down tests. */
  hooks: SuiteHook[];
}

/**
 * Options for defining an individual test case.
 * @internal
 */
export interface TestDefinition extends Omit<Deno.TestDefinition, 'fn'> {
  /** The main function to define the test case. */
  fn: () => Awaitable<void>;
  /** Optional parent suite for the test. */
  suite?: SuiteIdentifier;
}

/**
 * Represents a suite of tests.
 * @internal
 */
export class Suite implements SuiteIdentifier {
  /** Keeps track of how many test suites are running. */
  public static runningCount = 0;

  /** Indicates if any test has been registered. Blocks global hooks if true. */
  public static started = false;

  /** A map of all registered suites by their unique symbols. */
  public static suites = new Map<symbol, Suite>();

  /** The currently registered suite. */
  public static current: Suite | null = null;

  /** The stack of tests currently running. */
  public static active: symbol[] = [];

  /** The Deno test context for this suite. */
  public static t: Deno.TestContext | null = null;

  /** Unique identifier for this suite. */
  public identifier: symbol;

  /** The group definition for this suite. */
  protected group: GroupDefinition;

  /** The steps (tests or nested suites) to run in this suite. */
  protected steps: (Suite | TestDefinition)[];

  /** Whether this suite contains a test marked as "only". */
  protected hasOnlyTest: boolean;

  /**
   * Constructs a new suite.
   * @param group - The group definition for this suite.
   */
  constructor(group: GroupDefinition) {
    this.group = group;
    this.steps = [];
    this.hasOnlyTest = false;

    const parentSuite = this.group.suite
      ? Suite.suites.get(this.group.suite.identifier)
      : Suite.current;

    this.identifier = Symbol();
    Suite.suites.set(this.identifier, this);

    const previousSuite = Suite.current;
    Suite.current = this;

    try {
      const value = group.fn?.() as unknown as () => Awaitable<void>;
      if (value instanceof Promise) {
        throw new Error('Returning a Promise from "group" is not supported');
      }
    } finally {
      Suite.current = previousSuite;
    }

    // If the suite has a parent, add it to the parent suite.
    if (parentSuite) {
      Suite.addStep(parentSuite, this);
      return;
    }

    // If the suite has no parent, register it as a test suite.
    Suite.registerTest({
      ...this.group,
      only: !this.group.ignore && this.hasOnlyTest ? true : this.group.only,
      name: this.group.name,
      fn: async (t) => {
        Suite.t = t;
        Suite.runningCount++;
        try {
          await Suite.runHooks('beforeAll', this.group.hooks);

          try {
            Suite.active.push(this.identifier);
            await Suite.runSteps(this, t);
          } finally {
            Suite.active.pop();
            await Suite.runHooks('afterAll', this.group.hooks);
          }
        } finally {
          Suite.runningCount--;
        }
      },
    });
  }

  /**
   * Resets the suite state, used for testing.
   */
  public static reset(): void {
    Suite.runningCount = 0;
    Suite.started = false;
    Suite.current = null;
    Suite.active = [];
  }

  /**
   * Registers a test with Deno.
   *
   * @param options - The test options to register.
   */
  public static registerTest(options: Deno.TestDefinition): void {
    // Removes undefined values from the options object.
    const filteredOptions = Object.fromEntries(
      Object.entries(options).filter(([_, v]) => v !== undefined),
    );

    Deno.test(filteredOptions as Deno.TestDefinition);
  }

  /**
   * Marks a suite as containing an "only" test, disabling all other tests.
   *
   * @param suite - The suite to mark as "only".
   */
  public static markOnly(suite: Suite): void {
    if (!suite.hasOnlyTest) {
      suite.steps = suite.steps.filter((step) => step instanceof Suite || step.only);
      suite.hasOnlyTest = true;
    }

    const parentSuite = suite.group.suite && Suite.suites.get(suite.group.suite.identifier);
    if (parentSuite) {
      Suite.markOnly(parentSuite);
    }
  }

  /**
   * Adds a step (test or suite) to a test suite.
   *
   * @param suite - The suite to add the step to.
   * @param step - The step to add to the suite.
   */
  public static addStep(suite: Suite, step: Suite | TestDefinition): void {
    if (step instanceof Suite ? step.hasOnlyTest || step.group.only : step.only) {
      Suite.markOnly(suite);
    }

    if (!(suite.hasOnlyTest && !(step instanceof Suite) && !step.only)) {
      suite.steps.push(step);
    }
  }

  /**
   * Adds a hook to the test suite.
   *
   * @param suite - The suite to add the hook to.
   * @param hook - The hook to add to the suite.
   */
  public static addHook(suite: Suite, hook: SuiteHook): void {
    suite.group.hooks ??= [];
    suite.group.hooks.push(hook);
  }

  /**
   * Executes all steps (tests and nested suites) in a test suite.
   *
   * @param suite - The suite to run the steps for.
   * @param t - The test context to run the steps in.
   */
  public static async runSteps(suite: Suite, t: Deno.TestContext): Promise<void> {
    const hasOnly = suite.hasOnlyTest || suite.group.only || false;

    for (const step of suite.steps) {
      const isSuite = step instanceof Suite;
      const options = isSuite ? step.group : step;

      if (hasOnly && isSuite && !(step.hasOnlyTest || step.group.only)) {
        continue;
      }

      await t.step({
        ...options,
        name: options.name,
        fn: async (t) => {
          if (options.permissions) {
            throw new Error('permissions option not available for nested tests');
          }

          if (isSuite) {
            await Suite.runHooks('beforeAll', step.group.hooks);

            try {
              Suite.active.push(step.identifier);
              await Suite.runSteps(step, t);
            } finally {
              Suite.active.pop();
              await Suite.runHooks('afterAll', step.group.hooks);
            }
          } else {
            if (options.fn) {
              await Suite.executeTest(options.fn);
            }
          }
        },
      });
    }
  }

  /**
   * Executes a test case.
   *
   * @param execute - The test case to execute.
   * @param activeIndex - The index of the active suite in the stack (internal use).
   * @returns Promise<void>
   */
  public static async executeTest(
    execute: () => Awaitable<void>,
    activeIndex = 0,
  ): Promise<void> {
    const suiteSymbol = Suite.active[activeIndex];
    const testSuite = suiteSymbol && Suite.suites.get(suiteSymbol);

    if (!testSuite) {
      await execute();
      return;
    }

    await Suite.runHooks('beforeEach', testSuite.group.hooks);

    try {
      await Suite.executeTest(execute, activeIndex + 1);
    } finally {
      await Suite.runHooks('afterEach', testSuite.group.hooks);
    }
  }

  /**
   * Executes all hooks of a given type.
   *
   * @param name - The type of hook to run.
   * @param hooks - The hooks to run.
   * @returns Promise<void>
   */
  private static async runHooks(name: SuiteHookType, hooks: SuiteHook[]): Promise<void> {
    for (const { fn } of hooks.filter((hook) => hook.type === name)) {
      await fn();
    }
  }
}
