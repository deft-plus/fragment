/**
 * @license
 * Copyright Deft+ All Rights Reserved.
 *
 * Use of this source code is governed by an Apache-2.0 license that can be
 * found in the LICENSE file at https://github.com/deft-plus/fragment/blob/latest/LICENCE
 */

import { describe, it } from '@std/testing/bdd';
import { expect } from '@std/expect';
import { delay } from '@std/async/delay';
import { signal } from '@/signal/mod.ts';
import { WritableSignal } from '@/signal/_api.ts';

type TestingUser = {
  name: string;
  age: number;
};

describe('signal()', () => {
  it('should create a signal', () => {
    const counter = signal(0);

    expect(counter()).toBe(0);
  });

  it('should set a signal', () => {
    const counter = signal(0);

    counter.set(1);

    expect(counter()).toBe(1);
  });

  it('should update a signal', () => {
    const counter = signal(0);

    counter.update((value) => value + 1);

    expect(counter()).toBe(1);
  });

  it('should mutate a signal', () => {
    const counter = signal<TestingUser>({ name: 'Alice', age: 42 });

    counter.mutate((value) => {
      value.name = 'Bob';
    });

    expect(counter().name).toBe('Bob');
  });

  it('should create a readonly signal', () => {
    const counter = signal(0).readonly();

    expect(counter()).toBe(0);

    const signalFnKeys = Object.keys(counter);
    const writableKeys = signalFnKeys.find((key) =>
      key === 'set' || key === 'update' || key === 'mutate'
    );

    expect(writableKeys).toBeUndefined();
  });

  it('should subscribe to readonly signals', () => {
    const privateCounter = signal(0);

    const counter = {
      mutable: privateCounter,
      readonly: privateCounter.readonly(),
    };

    expect(counter.readonly()).toBe(0);

    const signalFnKeys = Object.keys(counter.readonly);
    const writableKeys = signalFnKeys.find((key) =>
      key === 'set' || key === 'update' || key === 'mutate'
    );

    expect(writableKeys).toBeUndefined();

    privateCounter.set(1);

    expect(counter.readonly()).toBe(1);

    counter.mutable.set(2);

    expect(counter.readonly()).toBe(2);
  });

  it('should allow to use `onChange` hook', () => {
    const called = [] as number[];

    const counter = signal(0, {
      onChange: (value) => called.push(value),
    });

    expect(called).toStrictEqual([]);

    counter.set(1);
    expect(called).toStrictEqual([1]);

    counter.set(23);
    expect(called).toStrictEqual([1, 23]);

    counter.set(23);
    expect(called).toStrictEqual([1, 23]);
  });

  it('should allow to use computed values', () => {
    const counter = signal(0);
    const doubleCounter = () => counter() * 2;

    expect(doubleCounter()).toBe(0);

    counter.set(1);

    expect(doubleCounter()).toBe(2);
  });

  it('should allow to pass signals as params and subscribe to changes', () => {
    const firstName = signal('Alice');
    const lastName = signal('Smith');

    type Signals = {
      firstName: WritableSignal<string>;
      lastName: WritableSignal<string>;
    };

    const buildDisplayName = ({ firstName, lastName }: Signals) => `${firstName()} ${lastName()}`;

    const displayName = () => buildDisplayName({ firstName, lastName });

    expect(displayName()).toBe('Alice Smith');

    firstName.set('Bob');

    expect(displayName()).toBe('Bob Smith');
  });

  it('should allow to use memoized values', () => {
    const counter = signal(0);
    const doubleCounter = signal.memo(() => counter() * 2);

    expect(doubleCounter()).toBe(0);

    counter.set(1);

    expect(doubleCounter()).toBe(2);
  });

  it('should allow to use memoized values with different equals fn', () => {
    const counter = signal(0);

    // Can only be set to a value greater than or equal to the current value.
    const doubleCounter = signal.memo(
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

  it('should schedule on dependencies (memoized) change', async () => {
    const counter = signal(0);
    const doubleCounter = signal.memo(() => counter() * 2);

    const effectCounter = [] as number[];

    signal.effect(() => {
      effectCounter.push(doubleCounter());
    });

    await delay(1);
    expect(effectCounter).toStrictEqual([0]);

    counter.set(1);

    await delay(1);
    expect(effectCounter).toStrictEqual([0, 2]);
  });

  it('should not make surrounding effect depend on the signal', async () => {
    const counter = signal(0);

    const effectCounter = [] as number[];

    signal.effect(() => {
      effectCounter.push(counter.untracked());
    });

    await delay(1);
    expect(effectCounter).toStrictEqual([0]);

    counter.set(1);

    await delay(1);
    expect(effectCounter).toStrictEqual([0]);
  });

  it('should batch updates', async () => {
    const counter = signal(0);

    const effectCounter = [] as number[];

    signal.effect(() => {
      effectCounter.push(counter());
    });

    counter.set(1);
    counter.set(2);

    await delay(2);
    expect(effectCounter).toStrictEqual([2]);
  });

  it('should convert a promise to a signal', async () => {
    const data1 = signal.promise<number>(
      new Promise((resolve) => delay(5).then(() => resolve(42))),
    );
    const data2 = signal.promise(() => delay(5).then(() => 42));

    const data3 = signal.promise<number>(
      new Promise((_, reject) => delay(5).then(() => reject(new Error('fail')))),
    );

    expect(data1()).toStrictEqual({ status: 'pending' });
    expect(data2()).toStrictEqual({ status: 'pending' });
    expect(data3()).toStrictEqual({ status: 'pending' });

    await delay(6);

    expect(data1()).toStrictEqual({ status: 'fulfilled', value: 42 });
    expect(data2()).toStrictEqual({ status: 'fulfilled', value: 42 });
    expect(data3()).toStrictEqual({ status: 'rejected', error: new Error('fail') });
  });
});
