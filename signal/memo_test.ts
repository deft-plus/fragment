/**
 * @license
 * Copyright Deft+ All Rights Reserved.
 *
 * Use of this source code is governed by an Apache-2.0 license that can be
 * found in the LICENSE file at https://github.com/deft-plus/fragment/blob/latest/LICENCE
 */

import { describe, test } from '@std/testing/bdd';
import { expect } from '@std/expect';
import { delay } from '@std/async';
import { createMemoSignal, MemoizedSignal } from '@/signal/memo.ts';
import { createSignal } from '@/signal/signal.ts';
import { effect } from '@/signal/effect.ts';

describe('signal / createMemoSignal()', () => {
  test('should allow to create a memoized signal', () => {
    const counter = createSignal(0);
    const doubleCounter = createMemoSignal(() => counter() * 2);

    expect(doubleCounter()).toBe(0);

    counter.set(1);

    expect(doubleCounter()).toBe(2);
  });

  test('should allow to use memoized values with different equals fn', () => {
    const counter = createSignal(0);

    // Can only be set to a value greater than or equal to the current value.
    const doubleCounter = createMemoSignal(
      () => counter() * 2,
      { equal: (a, b) => a >= b },
    );

    expect(doubleCounter()).toBe(0);

    counter.set(1);

    expect(doubleCounter()).toBe(2);

    counter.set(4);

    expect(doubleCounter()).toBe(8);

    counter.set(2);

    expect(doubleCounter()).toBe(8);

    counter.set(1);

    expect(doubleCounter()).toBe(8);
  });

  test('should schedule on dependencies (memoized) change', async () => {
    const counter = createSignal(0);
    const doubleCounter = createMemoSignal(() => counter() * 2);

    const effectCounter = [] as number[];

    effect(() => {
      effectCounter.push(doubleCounter());
    });

    await delay(1);
    expect(effectCounter).toStrictEqual([0]);

    counter.set(1);

    await delay(1);
    expect(effectCounter).toStrictEqual([0, 2]);
  });

  test('should allow to pass a config object', () => {
    const called = [] as number[];

    const counter = createSignal(0);

    const doubleCounter = createMemoSignal(
      () => counter() * 2,
      {
        id: 'doubleCounter',
        log: true,
        onChange: (value) => {
          called.push(value);
        },
      },
    );

    expect(doubleCounter()).toBe(0);

    expect(called).toStrictEqual([0]);

    counter.set(1);
    expect(doubleCounter()).toBe(2);
    expect(called).toStrictEqual([0, 2]);

    counter.set(23);
    expect(doubleCounter()).toBe(46);
    expect(called).toStrictEqual([0, 2, 46]);

    counter.set(23);
    expect(doubleCounter()).toBe(46);
    expect(called).toStrictEqual([0, 2, 46]);
  });

  test('should be able to keep track of multiple dependencies and batch changes', () => {
    const counter = createSignal(0);
    const counter2 = createSignal(0);

    const changes = [] as number[];

    const doubleCounter = createMemoSignal(() => {
      const value = counter() * 2 + counter2();
      changes.push(value);
      return value;
    });

    expect(doubleCounter()).toBe(0);

    counter.set(1);
    counter2.set(2);

    expect(doubleCounter()).toBe(4);
    expect(changes).toStrictEqual([0, 4]);
  });

  test('should throw if it having a circular dependency', () => {
    let circularCounter: MemoizedSignal<number> | null = null;

    const counter = createMemoSignal(() => (circularCounter?.() ?? 0) * 2);
    circularCounter = createMemoSignal(() => counter());

    expect(() => counter()).toThrow();
  });

  test('should not track changes in untracked blocks', () => {
    const changes: number[] = [];

    const counter = createSignal(0);
    const doubleCounter = createMemoSignal(() => counter() * 2);

    effect(() => {
      changes.push(doubleCounter.untracked());
    });

    counter.set(1);

    expect(changes).toStrictEqual([]);

    counter.set(2);

    expect(changes).toStrictEqual([]);
  });

  test('should allow to use a signal as a condition', () => {
    const counter = createSignal(0);
    const counter2 = createSignal(0);
    const condition = createSignal(false);

    const conditionalSignal = createMemoSignal(() => condition() ? counter() : counter2());

    expect(conditionalSignal()).toBe(0);

    counter.set(23);
    expect(conditionalSignal()).toBe(0);

    condition.set(true);
    expect(conditionalSignal()).toBe(23);

    counter2.set(2);
    expect(conditionalSignal()).toBe(23);
  });

  test('should no re-compute if the value is the same', () => {
    const counter = createSignal(10);
    const counter2 = createSignal(10);

    const doubleCounter = createMemoSignal(() => counter() + counter2());

    expect(doubleCounter()).toBe(20);

    counter.set(7);
    counter2.set(13);

    expect(doubleCounter()).toBe(20);
  });

  test('should cache exceptions thrown until computed gets dirty again', () => {
    const counter = createSignal(0);
    const errorCounter = createMemoSignal(() => {
      if (counter() === 0) {
        throw new Error('Counter is zero');
      }

      return counter();
    });

    expect(() => errorCounter()).toThrow('Counter is zero');

    counter.set(1);

    expect(errorCounter()).toBe(1);
  });

  test("should not update dependencies of computations when dependencies don't change", () => {
    const source = createSignal(0);
    const isEven = createMemoSignal(() => source() % 2 === 0);
    let updateCounter = 0;
    const updateTracker = createMemoSignal(() => {
      isEven();
      return updateCounter++;
    });

    updateTracker();
    expect(updateCounter).toEqual(1);

    source.set(1);
    updateTracker();
    expect(updateCounter).toEqual(2);

    // Setting the counter to another odd value should not trigger `updateTracker` to update.
    source.set(3);
    updateTracker();
    expect(updateCounter).toEqual(2);

    source.set(4);
    updateTracker();
    expect(updateCounter).toEqual(3);
  });

  test('should allow signal creation within computed', () => {
    const doubleCounter = createMemoSignal(() => {
      const counter = createSignal(1);
      return counter() * 2;
    });

    expect(doubleCounter()).toBe(2);
  });

  test('should have a toString implementation', () => {
    const counter = createSignal(1);
    const doubleCounter = createMemoSignal(() => counter() * 2);
    expect(doubleCounter + '').toBe('[MemoSignal: 2]');
  });
});
