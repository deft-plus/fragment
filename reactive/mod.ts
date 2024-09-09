// Copyright the Deft+ authors. All rights reserved. Apache-2.0 license
// This module is browser compatible.

/**
 * Contains the implementation for the {@link signal} function and its utilities.
 *
 * This namespace function contains utilities for creating signals, memoized signals, promise
 * signals, check if values are signals and effects.
 *
 * @example Usage
 * ```ts
 * const counter = signal(0);
 *
 * console.log(counter()); // Logs: "0".
 *
 * counter.set(1);
 *
 * console.log(counter()); // Logs: "1".
 *
 * counter.update((value) => value + 1);
 *
 * console.log(counter()); // Logs: "2".
 *
 * counter.mutate((value) => value++);
 *
 * console.log(counter()); // Logs: "3".
 * ```
 *
 * @example Usage with options
 * ```ts
 * const counter = signal(0, {
 *   id: 'counter',
 *   log: true,
 *   equal: (a, b) => a === b,
 *   onChange: (value) => console.log(`Counter changed to: ${value}`),
 * });
 *
 * console.log(counter()); // Logs: "0".
 *
 * counter.set(1); // Logs: "Counter changed to: 1".
 *
 * console.log(counter()); // Logs: "1".
 *
 * counter.set(1); // No log.
 * ```
 *
 * @example Check if value is a signal
 * ```ts
 * if (isSignal(value)) {
 *   console.log('Value is a signal:', value());
 * }
 *
 * // Or use the type guard.
 * if (isSignal<string>(value)) {
 *   console.log('Value is a signal with string typings:', value());
 * }
 *
 * // Or use the type guards for specific signal types.
 * if (isSignal.writable(value)) {
 *   console.log('Value is a writable signal:', value());
 * }
 *
 * if (isSignal.readonly(value)) {
 *   console.log('Value is a read-only signal:', value());
 * }
 *
 * if (isSignal.memoized(value)) {
 *   console.log('Value is a memoized signal:', value());
 * }
 *
 * @example Create a memoized signal
 * ```ts
 * const counter = signal(1);
 * const doubleCounter = memoSignal(() => counter() * 2);
 *
 * console.log(doubleCounter()); // Logs: "2".
 *
 * // The value is cached until dependencies change.
 * counter.set(2);
 *
 * console.log(doubleCounter()); // Logs: "4".
 * ```
 *
 * @example Transform a promise into a signal
 * ```ts
 * const promiseSignal = signalFromPromise(() => fetch('https://api.example.com/data'));
 *
 * console.log(promiseSignal()); // Logs: "{ status: 'pending' }".
 *
 * // The value is updated when the promise resolves.
 * await delay(1000);
 * console.log(promiseSignal()); // Logs: "{ status: 'fulfilled', value: 'Hello, World!' }".
 *
 * // Or if the promise rejects.
 * console.log(promiseSignal()); // Logs: "{ status: 'rejected', error: 'Error!' }".
 * ```
 *
 * @example Effect Usage
 * ```ts
 * const effectRef = effect(() => {
 *   console.log('Signal changed:', signal());
 * });
 *
 * effectRef.destroy();
 *
 * // Manually destroy all effects.
 * effect.resetEffects();
 * ```
 *
 * @example Effect Usage with initial run
 * ```ts
 * // Run the effect one initial time and then re-schedule it on changes.
 * const effectRef = effect.initial(() => {
 *   console.log('Signal changed and run first time:', signal());
 * });
 *
 * effectRef.destroy();
 * ```
 *
 * @module
 */

export {
  type MemoizedSignal,
  type MemoizedSignalOptions,
  type ReadonlySignal,
  type Signal,
  type SignalOptions,
  type SignalType,
  type WritableSignal,
} from './api.ts';
export {
  effect,
  type EffectCallback,
  type EffectCleanup,
  type EffectHandler,
  type EffectRef,
} from './effect.ts';
export { memoSignal } from './memo.ts';
export { type PromiseValue, signalFromPromise } from './promise.ts';
export { signal } from './signal.ts';
export { type Store, store, type StoreValues, type ValidStore } from './store.ts';
