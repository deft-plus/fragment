/**
 * @license
 * Copyright Deft+ All Rights Reserved.
 *
 * Use of this source code is governed by an Apache-2.0 license that can be
 * found in the LICENSE file at https://github.com/deft-plus/fragment/blob/latest/LICENCE
 */

import {
  defaultEquals,
  markAsSignal,
  ReadonlySignal,
  type SignalOptions,
  type WritableSignal,
} from '@/signal/_api.ts';
import { ReactiveNode } from '@/signal/_graph.ts';
import { createUntrackedSignal } from '@/signal/untracked.ts';

/** Options for creating a signal. */
export type SignalCreationOptions<T> = SignalOptions<T>;

/** Create a signal that can be set or updated directly. */
export function createSignal<T>(
  initialValue: T,
  options: SignalCreationOptions<T> = {},
): WritableSignal<T> {
  const {
    id = `signal_${Math.random().toString(36).slice(2)}`,
    log = false,
    equal = defaultEquals,
    onChange = () => {},
  } = options;

  const node = new WritableSignalImpl(initialValue, { id, log, equal, onChange });

  return markAsSignal(node.signal.bind(node), {
    set: node.set.bind(node),
    update: node.update.bind(node),
    mutate: node.mutate.bind(node),
    readonly: node.readonly.bind(node),
    untracked: node.untracked.bind(node),
    toString: node.toString.bind(node),
  });
}

/** A signal that can be set or updated directly. */
class WritableSignalImpl<T> extends ReactiveNode {
  private readonlySignal?: ReadonlySignal<T>;

  constructor(
    private value: T,
    private options: Required<SignalCreationOptions<T>>,
  ) {
    super();
  }

  protected override onDependencyChange(): void {
    // Writable signals are not consumers, so this doesn't apply.
  }

  protected override onProducerMayChanged(): void {
    // Value versions are always up-to-date for writable signals.
  }

  /** Set a new value for the signal and notify consumers if changed. */
  public set(newValue: T): void {
    if (!this.options.equal(this.value, newValue)) {
      this.value = newValue;
      this.valueVersion++;
      this.notifyConsumers();
      this.options.onChange?.(this.value);
    }
  }

  /** Update the signal's value using the provided function. */
  public update(updater: (value: T) => T): void {
    this.set(updater(this.value));
  }

  /** Apply a function to mutate the signal's value in-place. */
  public mutate(mutator: (value: T) => void): void {
    mutator(this.value);
    this.valueVersion++;
    this.notifyConsumers();
    this.options.onChange?.(this.value);
  }

  /** Returns a read-only signal derived from this signal. */
  public readonly(): ReadonlySignal<T> {
    if (!this.readonlySignal) {
      this.readonlySignal = markAsSignal<ReadonlySignal<T>>(() => this.signal(), {
        untracked: () => this.untracked(),
      });
    }

    return this.readonlySignal;
  }

  /** Returns an untracked signal derived from this signal. */
  public untracked(): T {
    return createUntrackedSignal(() => this.signal());
  }

  /** Returns the current value of the signal. */
  public signal(): T {
    this.recordAccess();
    return this.value;
  }

  /** Returns a string representation of the signal. */
  public toString(): string {
    return `[Signal: ${JSON.stringify(this.signal())}]`;
  }
}
