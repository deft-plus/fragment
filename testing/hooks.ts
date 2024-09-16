import type { Awaitable } from '@fragment/utils';
import { type GroupDefinition, Suite, type TestHook } from './_api.ts';

function addHook(hook: TestHook): void {
  if (Suite.started && !Suite.current) {
    throw new Error('Cannot add global hooks after a global test is registered');
  }

  Suite.current = new Suite({ name: 'global', hooks: [] } as unknown as GroupDefinition);
  Suite.addHook(Suite.current, hook);
}

export function beforeEach(fn: () => Awaitable<void>): void {
  addHook({ type: 'beforeAll', fn });
}

export function beforeAll(fn: () => Awaitable<void>): void {
  addHook({ type: 'beforeAll', fn });
}

export function afterEach(fn: () => Awaitable<void>): void {
  addHook({ type: 'afterEach', fn });
}

export function afterAll(fn: () => Awaitable<void>): void {
  addHook({ type: 'afterAll', fn });
}
