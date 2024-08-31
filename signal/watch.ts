/**
 * @license
 * Copyright Deft+ All Rights Reserved.
 *
 * Use of this source code is governed by an Apache-2.0 license that can be
 * found in the LICENSE file at https://github.com/deft-plus/fragment/blob/latest/LICENCE
 */

import { ReactiveNode, setCurrentConsumer } from '@/signal/_graph.ts';

/** Function to clean up after a reactive expression. */
export type CleanupFn = () => void;

/** Callback executed when changes are detected. */
export type WatchCallback = () => void | CleanupFn;

/** Default no-op cleanup function. */
const NOOP_CLEANUP: CleanupFn = () => {};

/**
 * Watches a reactive expression and schedules it to re-run when dependencies change. `Watch` relies
 * on an external scheduling function to call `Watch.run()`.
 */
export class Watch extends ReactiveNode {
  protected override readonly allowSignalWrites: boolean;
  private isDirty = false;
  private cleanupFn = NOOP_CLEANUP;

  constructor(
    private callback: WatchCallback,
    private schedule: (watch: Watch) => void,
    allowSignalWrites: boolean,
  ) {
    super();
    this.allowSignalWrites = allowSignalWrites;
  }

  /** Notify that this watch needs to be re-scheduled. */
  notify(): void {
    if (!this.isDirty) {
      this.schedule(this);
    }

    this.isDirty = true;
  }

  protected override onDependencyChange(): void {
    this.notify();
  }

  protected override updateProducerValueVersion(): void {
    // Watches don't update producer values.
  }

  /**
   * Executes the reactive expression within the context of this `Watch` instance. Should be called
   * by the scheduling function when `Watch.notify()` is triggered.
   */
  run(): void {
    this.isDirty = false;

    if (this.trackingVersion !== 0 && !this.checkDependencies()) {
      return;
    }

    const previousConsumer = setCurrentConsumer(this);
    this.trackingVersion++;
    try {
      this.cleanupFn();
      this.cleanupFn = this.callback() ?? NOOP_CLEANUP;
    } finally {
      setCurrentConsumer(previousConsumer);
    }
  }

  /** Run the cleanup function. */
  cleanup(): void {
    this.cleanupFn();
  }
}
