/**
 * @license
 * Copyright Deft+ All Rights Reserved.
 *
 * Use of this source code is governed by an Apache-2.0 license that can be
 * found in the LICENSE file at https://github.com/deft-plus/fragment.js/blob/latest/LICENCE
 */

import {
  type MemoizedSignalOptions,
  type ReadonlySignal,
  signal,
  type SignalOptions,
  type WritableSignal,
} from '@/signal/mod.ts';

/**
 * Creates a reactive atomic piece of state (store) that can be read through signals and written
 * through actions.
 */
export const store = <T extends ValidStore>(initializeStoreValues: StoreValues<T>): Store<T> => {
  const __id__ = `store_${Math.random().toString(36).slice(2)}`;

  const mutableState = { __id__ } as ValidStore;
  const immutableState = { __id__ } as ValidStore;
  const initialState = initializeStoreValues({ get: () => mutableState as WritableState<T> });

  const stateEntries = Object.entries(initialState);

  for (let index = 0; index < stateEntries.length; index++) {
    const [stateKey, stateValue] = stateEntries[index];

    // If the value is a function, it's an action / derived value.
    if (typeof stateValue === 'function') {
      mutableState[stateKey] = stateValue;
      immutableState[stateKey] = stateValue;
      continue;
    }

    // If the value is not a function, it's a signal.
    const isConfigured = isConfiguredValue(stateValue);
    const signalValue = (isConfigured ? stateValue.value : stateValue) as T | (() => T);
    const isComputed = typeof signalValue === 'function';

    const signalConfig = {
      ...(isConfigured && stateValue.id && { id: stateValue.id }),
      ...(isConfigured && stateValue.log && { log: stateValue.log }),
      ...(isConfigured && stateValue.equal && { equal: stateValue.equal }),
      ...(isConfigured && stateValue.onChange && { onChange: stateValue.onChange }),
    } as SignalOptions<T>;

    // Value assignment to a memoized or normal signal.
    const valueSignal = isComputed
      ? signal.memo(signalValue, signalConfig)
      : signal(signalValue, signalConfig);

    // Value assignment to the mutable and immutable state.
    mutableState[stateKey] = valueSignal;
    immutableState[stateKey] =
      'readonly' in valueSignal && typeof valueSignal.readonly === 'function'
        ? valueSignal.readonly()
        : valueSignal;
  }

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

/** Utility function to check if a value is a configured value. */
function isConfiguredValue(value: unknown): value is ConfiguredValue {
  return typeof value !== 'undefined' &&
    value !== null &&
    typeof value === 'object' &&
    'value' in value;
}

/** Utility type to define a configured value. */
type ConfiguredValue<T = unknown> =
  | (SignalOptions<T> & {
    /**
     * Initial value of the signal.
     */
    value: T;
  })
  | (MemoizedSignalOptions<T> & {
    /**
     * Initial value of the signal.
     */
    value: () => T;
  });

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
   * `WritableState<T>` cannot be nullable, However, it's initially undefined when the store is
   * created because the state isn't yet initialized. This ensures that the state is always
   * accessible without needing constant null checks.
   */
  get: () => WritableState<T>;
}) => {
  [K in keyof T]: T[K] extends (...args: infer Args) => infer R
    // Functions as actions.
    ? (...args: Args) => R
    // Values as signals or computed values.
    : T[K] | ConfiguredValue<T[K]>;
};

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
