import type { Awaitable } from '@fragment/utils';
import { Suite, type TestDefinition } from './_api.ts';

type TestFn = () => Awaitable<void>;

interface TestOptions extends Omit<Deno.TestDefinition, 'fn'> {
  fn: TestFn;
}

type TestArgs = [name: string, fn: TestFn] | [options: TestOptions];

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
      fn: fn as TestFn,
      ...(Suite.current && { suite: Suite.current }),
    };
}

export function test(name: string, fn: TestFn): void;
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

function testOnly(name: string, fn: TestFn): void;
function testOnly(options: TestOptions): void;
function testOnly(...args: TestArgs): void {
  const options = testDefinition(...args);
  return test({
    ...options,
    only: true,
  });
}

test.only = testOnly;

function testIgnore(name: string, fn: TestFn): void;
function testIgnore(options: TestOptions): void;
function testIgnore(...args: TestArgs): void {
  const options = testDefinition(...args);
  return test({
    ...options,
    ignore: true,
  });
}

test.ignore = testIgnore;
