/**
 * @license
 * Copyright Deft+ All Rights Reserved.
 *
 * Use of this source code is governed by an Apache-2.0 license that can be
 * found in the LICENSE file at https://github.com/deft-plus/fragment/blob/latest/LICENCE
 */

/** Symbol to identify signal functions. */
const SIGNAL = Symbol('signal');

/** Type to add the `SIGNAL_SYMBOL` to a type. */
type WithSignal<T> = T & { [SIGNAL]: true };

/** A function that returns the current value of a signal. */
export type ReadonlySignal<T = unknown> = WithSignal<(() => T)> & {
  /** Get the value without creating a dependency. */
  untracked(): T;
};

/** A signal that can be read and updated. */
export type WritableSignal<T = unknown> = ReadonlySignal<T> & {
  /** Set a new value and notify dependents. */
  set(value: T): void;
  /** Update the value based on the current value and notify dependents. */
  update(updateFn: (value: T) => T): void;
  /** Modify the current value in-place and notify dependents. */
  mutate(mutatorFn: (value: T) => void): void;
  /** Get a read-only version of this signal. */
  readonly(): ReadonlySignal<T>;
};

/** Type for signals that can be either read-only or writable. */
export type Signal<T = unknown> = ReadonlySignal<T> | WritableSignal<T>;

/** Options for creating a signal. */
export type SignalOptions<T> = {
  /** Identifier for the signal. Useful for debugging and testing. */
  id?: string;
  /** Whether to log the signal's changes. Defaults to `false`. */
  log?: boolean;
  /** Function to check if two signal values are equal. Defaults to the built-in equality check. */
  equal?: (a: T, b: T) => boolean;
  /** Function to call after the signal value changes. */
  onChange?: (newValue: T) => void;
};

/** Checks if a value is a signal. */
export function isSignal(value: unknown): value is Signal<unknown> {
  return value !== null && (value as ReadonlySignal<unknown>)[SIGNAL] === true;
}

/** Marks a function as a signal function. */
export function markAsSignal<T extends Signal>(
  fn: () => unknown,
  extraApi?: Record<string, unknown>,
): T {
  (fn as WithSignal<() => T>)[SIGNAL] = true;

  // Copy properties from `extraApi` to `fn` to complete the desired API of the `Signal`.
  return Object.assign(fn, extraApi) as T;
}

/**
 * Default equality check for signals. Compares objects and arrays as always unequal, and uses
 * strict equality for primitives.
 */
export function defaultEquals<T>(a: T, b: T): boolean {
  return (a === null || typeof a !== 'object') && Object.is(a, b);
}
