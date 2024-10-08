// Copyright the Deft+ authors. All rights reserved. Apache-2.0 license
// This module is browser compatible.

/**
 * Contains the implementation for the {@link signal} function.
 *
 * A signal is a reactive value that can be read and watched for changes. This function creates a
 * signal that can be set or updated directly.
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
 * @module
 */

import {
  defaultEquals,
  markAsSignal,
  type ReadonlySignal,
  type SignalOptions,
  type WritableSignal,
} from './api.ts';
import { ReactiveNode } from './reactive_node.ts';
import { untrackedSignal } from './untracked.ts';

/**
 * Create a signal that can be set or updated directly.
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
 * @template T - The type of the signal value.
 * @param initialValue - The initial value of the signal.
 * @param options - The options for the signal.
 * @returns A writable signal.
 */
export function signal<T>(
  initialValue: T,
  options: SignalOptions<T> = {},
): WritableSignal<T> {
  const {
    id = `signal_${Math.random().toString(36).slice(2)}`,
    log = false,
    equal = defaultEquals,
    onChange = () => {},
  } = options;

  const node = new WritableSignalImpl(initialValue, { id, log, equal, onChange });

  return markAsSignal('writable', node.signal.bind(node), {
    set: node.set.bind(node),
    update: node.update.bind(node),
    mutate: node.mutate.bind(node),
    readonly: node.readonly.bind(node),
    untracked: node.untracked.bind(node),
    toString: node.toString.bind(node),
  });
}

/**
 * A signal that can be set or updated directly.
 * @internal
 */
class WritableSignalImpl<T> extends ReactiveNode {
  constructor(
    private value: T,
    private options: Required<SignalOptions<T>>,
  ) {
    super();
  }

  /** The current value of the signal as read-only. */
  private readonlySignal?: ReadonlySignal<T>;

  /**
   * Called when a dependency may have changed.
   *
   * @returns void
   */
  protected override onDependencyChange(): void {
    // Writable signals are not consumers, so this doesn't apply.
  }

  /**
   * Called when a consumer checks if the producer's value has changed.
   *
   * @returns void
   */
  protected override onProducerMayChanged(): void {
    // Value versions are always up-to-date for writable signals.
  }

  /**
   * Set a new value for the signal and notify consumers if changed.
   *
   * @param newValue - The new value to set.
   * @returns void
   */
  public set(newValue: T): void {
    if (!this.options.equal(this.value, newValue)) {
      this.value = newValue;
      this.valueVersion++;
      this.notifyConsumers();
      this.options.onChange?.(this.value);
    }
  }

  /**
   * Update the signal's value using the provided function.
   *
   * @param updater - The function to update the value.
   * @returns void
   */
  public update(updater: (value: T) => T): void {
    this.set(updater(this.value));
  }

  /**
   * Apply a function to mutate the signal's value in-place.
   *
   * @param mutator - The function to mutate the value.
   * @returns void
   */
  public mutate(mutator: (value: T) => void): void {
    mutator(this.value);
    this.valueVersion++;
    this.notifyConsumers();
    this.options.onChange?.(this.value);
  }

  /**
   * Returns a read-only signal derived from this signal.
   *
   * @returns A read-only signal.
   */
  public readonly(): ReadonlySignal<T> {
    if (!this.readonlySignal) {
      this.readonlySignal = markAsSignal<ReadonlySignal<T>>('readonly', () => this.signal(), {
        untracked: () => this.untracked(),
      });
    }

    return this.readonlySignal;
  }

  /**
   * Returns an untracked signal derived from this signal.
   *
   * @returns An untracked signal.
   */
  public untracked(): T {
    return untrackedSignal(() => this.signal());
  }

  /**
   * Returns the current value of the signal.
   *
   * @returns The current value of the signal.
   */
  public signal(): T {
    this.recordAccess();
    return this.value;
  }

  /**
   * Used to show the signal in console logs easily.
   *
   * @returns A string representation of the signal.
   */
  public toString(): string {
    return `[Signal: ${JSON.stringify(this.signal())}]`;
  }
}
