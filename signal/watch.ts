/**
 * @license
 * Copyright Deft+ All Rights Reserved.
 *
 * Use of this source code is governed by an Apache-2.0 license that can be
 * found in the LICENSE file at https://github.com/deft-plus/fragment/blob/latest/LICENCE
 */

import { ReactiveNode, setActiveConsumer } from '@/signal/_graph.ts';

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
  private dirty = false;
  private cleanupFn = NOOP_CLEANUP;

  constructor(
    private callback: WatchCallback,
    private schedule: (watch: Watch) => void,
  ) {
    super();
  }

  protected override onDependencyChange(): void {
    this.notify();
  }

  protected override onProducerMayChanged(): void {
    // Watches don't update producer values.
  }

  /** Notify that this watch needs to be re-scheduled. */
  public notify(): void {
    if (!this.dirty) {
      this.schedule(this);
    }

    this.dirty = true;
  }

  /**
   * Executes the reactive expression within the context of this `Watch` instance. Should be called
   * by the scheduling function when `Watch.notify()` is triggered.
   */
  public run(): void {
    this.dirty = false;

    if (this.trackingVersion !== 0 && !this.haveDependenciesChanged()) {
      return;
    }

    const previousConsumer = setActiveConsumer(this);
    this.trackingVersion++;
    try {
      this.cleanupFn();
      this.cleanupFn = this.callback() ?? NOOP_CLEANUP;
    } finally {
      setActiveConsumer(previousConsumer);
    }
  }

  /** Run the cleanup function. */
  public cleanup(): void {
    this.cleanupFn();
  }
}
