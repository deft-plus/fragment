/**
 * @license
 * Copyright Deft+ All Rights Reserved.
 *
 * Use of this source code is governed by an Apache-2.0 license that can be
 * found in the LICENSE file at https://github.com/deft-plus/fragment.js/blob/latest/LICENCE
 */

/// Stores are a way to manage global state in your application. They use signals internally to
/// store values and update them. You can also derive values from other values.
///
/// The reason why stores are immutable is because they are not meant to be changed directly, but
/// rather through the actions that are defined in the store.
///
/// You would want to use a store over a signal when you need to store multiple values that are
/// related to each other. This makes it easier to manage the state of your application with a
/// single source of truth.

import { type ReadonlySignal, signal, type WritableSignal } from '@/signal/mod.ts';

/**
 * Creates a reactive atomic piece of state (store) that can be read through signals and written
 * through actions.
 */
export const store = <T extends ValidStore>(initializeStoreValues: StoreValues<T>): Store<T> => {
  const __id__ = `store_${Math.random().toString(36).slice(2)}`;

  let state = undefined as unknown as WritableState<T>;
  const initialState = initializeStoreValues({ get: () => state });

  const stateEntries = Object.entries(initialState);
  const mutableState = { __id__ } as ValidStore;
  const immutableState = { __id__ } as ValidStore;

  for (let index = 0; index < stateEntries.length; index++) {
    const [stateKey, stateValue] = stateEntries[index];

    // If the value is a function, it's an action / derived value.
    if (typeof stateValue === 'function') {
      mutableState[stateKey] = stateValue;
      immutableState[stateKey] = stateValue;
      continue;
    }

    // If the value is not a function, it's a signal.
    const valueSignal = signal(stateValue);
    mutableState[stateKey] = valueSignal;
    immutableState[stateKey] = valueSignal.readonly();
  }

  state = mutableState as WritableState<T>;

  /** Function to use the store */
  function useStore<U extends (keyof T)>(): ReadonlyState<T>[U];
  function useStore(): ReadonlyState<T>;
  function useStore<U extends (keyof T)>(selector?: U): ReadonlyState<T>[U] | ReadonlyState<T> {
    return (selector ? immutableState[selector] : Object.freeze(immutableState)) as
      | ReadonlyState<T>[U]
      | ReadonlyState<T>;
  }

  return useStore;
};

/** Utility type to check if a value is a valid store. */
type ValidStore = Record<PropertyKey, unknown>;

/** Utility type to map the values of the state. */
type State<T extends ValidStore, R extends boolean> =
  & {
    [K in keyof T]: T[K] extends (...args: infer Args) => infer R
      // Functions as actions.
      ? (...args: Args) => R
      // Values as signals.
      : (
        R extends true ? ReadonlySignal<T[K]> : WritableSignal<T[K]>
      );
  }
  & { __id__: string };

/** Maps all the values of the object as signals and actions. */
export type WritableState<T extends ValidStore> = State<T, false>;

/** Maps all the values of the object as readonly signals and actions. */
export type ReadonlyState<T extends ValidStore> = State<T, true>;

/** Function to create the store with the initial values. */
export type StoreValues<T extends ValidStore> = (values: {
  /**
   * Returns the current state of the store.
   *
   * `WritableState<T>` cannot be nullable, but it is initially undefined when the store is created.
   * This is because the state has not been created yet. Even if it could be undefined, it would be
   * inconvenient to use because you would constantly need to check whether the state has been
   * created or not. Therefore, the typings enforce that the state must be non-nullable.
   */
  get: () => WritableState<T>;
}) => T;

/**
 * A store is a function that returns an atomic and encapsulated state. It can be read through
 * signals and written through actions.
 */
export type Store<T extends ValidStore> = {
  /** Function returns the value of the selected key in the store. */
  <U extends keyof T>(selector: U): ReadonlyState<T>[U];
  /** Function returns the values of the store. */
  (): ReadonlyState<T>;
};
