/**
 * @license
 * Copyright Deft+ All Rights Reserved.
 *
 * Use of this source code is governed by an Apache-2.0 license that can be
 * found in the LICENSE file at https://github.com/deft-plus/fragment/blob/latest/LICENCE
 */

import { defaultEquals, markAsSignal, ReadonlySignal, SignalOptions } from '@/signal/_api.ts';
import { ReactiveNode, setActiveConsumer } from '@/signal/_graph.ts';
import { untracked } from '@/signal/untracked.ts';

/** Options for creating a memoized signal. */
export type MemoizedSignalOptions<T> = SignalOptions<T>;

/** Creates a memoized signal from a computation function. */
export function createMemoSignal<T>(
  compute: () => T,
  options?: MemoizedSignalOptions<T>,
): ReadonlySignal<T> {
  const {
    id = `unnamed_signal_${Math.random().toString(36).slice(2)}`,
    log = false,
    equal = defaultEquals,
    onChange = () => {},
  } = options ?? {};

  const node = new MemoizedSignalImp(compute, { id, log, equal, onChange });

  return markAsSignal(node.signal.bind(node), {
    untracked: node.untracked.bind(node),
  });
}

/** Symbol for a memoized value that hasn't been computed yet. */
const UNSET = Symbol('UNSET');

/** Symbol indicating a computation is in progress. Used to detect cycles. */
const COMPUTING = Symbol('COMPUTING');

/** Symbol indicating a computation failed. The error is cached until the value is recomputed. */
const ERRORED = Symbol('ERRORED');

/** Type for a memoized value or special values (`UNSET`, `COMPUTING`, `ERRORED`). */
type MemoizedValue<T> = T | typeof UNSET | typeof COMPUTING | typeof ERRORED;

/** A read-only signal with an untracked value method. */
export type MemoizedSignal<T> = ReadonlySignal<T> & {
  /**
   * Returns the value without creating a dependency on the signal.
   */
  untracked(): T;
};

/** A computation node that derives a value from a reactive expression. */
class MemoizedSignalImp<T> extends ReactiveNode {
  constructor(
    private compute: () => T,
    private options: Required<MemoizedSignalOptions<T>>,
  ) {
    super();
  }

  /** Current value of the computation or one of the special symbols. */
  private value: MemoizedValue<T> = UNSET;

  /** Error from the last computation if it failed. */
  private error: unknown = null;

  /** Flag indicating if the value is stale. */
  private stale = true;

  /** Called when a dependency changes. Marks the value as stale and notifies consumers. */
  protected override onDependencyChange(): void {
    if (this.stale) {
      return; // If already stale, no need to reprocess.
    }

    this.stale = true; // Mark the value as stale.
    this.notifyConsumers(); // Notify consumers about potential change.
  }

  /** Updates the value version if it is stale. Computes a new value if necessary. */
  protected override updateProducerValueVersion(): void {
    if (!this.stale) {
      return; // If not stale, no update needed.
    }

    // If dependencies haven't changed, resolve stale.
    if (
      this.value !== UNSET &&
      this.value !== COMPUTING &&
      !this.checkDependencies()
    ) {
      this.stale = false;
      return;
    }

    // Recompute the value as it is stale.
    this.recomputeValue();
  }

  /** Recomputes the value if needed. */
  private recomputeValue(): void {
    if (this.value === COMPUTING) {
      throw new Error('Cycle detected in computations.'); // Detect cyclic dependencies.
    }

    const previousValue = this.value;
    this.value = COMPUTING;

    this.trackingVersion++;
    const previousConsumer = setActiveConsumer(this);
    let newValue: MemoizedValue<T>;
    try {
      newValue = this.compute();
    } catch (err) {
      newValue = ERRORED;
      this.error = err;
    } finally {
      setActiveConsumer(previousConsumer);
    }

    this.stale = false;

    // Update value if there is a change.
    if (
      previousValue !== UNSET &&
      previousValue !== ERRORED &&
      newValue !== ERRORED &&
      this.options.equal(previousValue, newValue)
    ) {
      this.value = previousValue; // Keep old value if new value is equivalent.
      return;
    }

    this.value = newValue;
    this.valueVersion++;
  }

  /** Returns the untracked value of the signal. */
  untracked(): T {
    return untracked(() => this.signal()); // Use untracked utility to access value.
  }

  /** Returns the current value of the signal, updating if necessary. */
  signal(): T {
    this.updateProducerValueVersion();
    this.recordAccess();

    if (this.value === ERRORED) {
      throw this.error;
    }

    return this.value as T;
  }
}
