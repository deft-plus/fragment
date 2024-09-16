import { type GroupDefinition, Suite } from './_api.ts';

interface GroupOptions extends Omit<Deno.TestDefinition, 'fn'> {
  fn: () => void;
}

type GroupArgs = [name: string, fn: () => void] | [options: GroupOptions];

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

export function group(name: string, fn: () => void): void;
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

function groupOnly(name: string, fn: () => void): void;
function groupOnly(options: GroupOptions): void;
function groupOnly(...args: GroupArgs): void {
  const options = groupDefinition(...args);
  group({
    ...options,
    only: true,
  });
}

group.only = groupOnly;

function groupIgnore(name: string, fn: () => void): void;
function groupIgnore(options: GroupOptions): void;
function groupIgnore(...args: GroupArgs): void {
  const options = groupDefinition(...args);
  group({
    ...options,
    ignore: true,
  });
}

group.ignore = groupIgnore;
