/**
 * @license
 * Copyright Deft+ All Rights Reserved.
 *
 * Use of this source code is governed by an Apache-2.0 license that can be
 * found in the LICENSE file at https://github.com/deft-plus/fragment/blob/latest/LICENCE
 */

import { Watch, WatchCallback } from '@/signal/watch.ts';

/** Callback for the `effect()` function, called when changes are detected. */
export type EffectCallback = WatchCallback;

/** Reference to a global reactive effect, which can be manually stopped. */
export type EffectRef = {
  /** Stop the effect and remove it from execution. */
  destroy(): void;
};

/** Options for creating an effect. */
export type CreateEffectOptions = {
  /** Whether the effect can write to signals. */
  allowSignalWrites?: boolean;
};

/** Set of all active effects. */
const activeEffects = new Set<Watch>();
/** Set of effects scheduled for execution. */
const executionQueue = new Set<Watch>();

/** Promise that resolves when the execution queue is empty. */
let pendingQueue: PromiseWithResolvers<void> | null = null;

/** Create a global effect for the given callback function. */
export function effect(
  callback: EffectCallback,
  options: CreateEffectOptions = {},
): EffectRef {
  const { allowSignalWrites = false } = options;

  const watch = new Watch(callback, queueEffect, allowSignalWrites);
  activeEffects.add(watch);

  // Schedule the effect to run.
  watch.notify();

  const destroy = () => {
    watch.cleanup();
    activeEffects.delete(watch);
    executionQueue.delete(watch);
  };

  return { destroy };
}

/** Stop all active effects. */
export function resetEffects(): void {
  executionQueue.clear();
  activeEffects.clear();
}

/** Queue an effect for execution. */
function queueEffect(watch: Watch): void {
  if (executionQueue.has(watch) || !activeEffects.has(watch)) {
    return;
  }

  executionQueue.add(watch);

  if (pendingQueue === null) {
    Promise.resolve().then(executeQueue);
    pendingQueue = Promise.withResolvers();
  }
}

/** Execute all queued effects. */
function executeQueue(): void {
  for (const watch of executionQueue) {
    executionQueue.delete(watch);
    watch.run();
  }

  pendingQueue?.resolve();
  pendingQueue = null;
}
