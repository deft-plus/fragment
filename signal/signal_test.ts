/**
 * @license
 * Copyright Deft+ All Rights Reserved.
 *
 * Use of this source code is governed by an Apache-2.0 license that can be
 * found in the LICENSE file at https://github.com/deft-plus/fragment/blob/latest/LICENCE
 */

import { describe, test } from '@std/testing/bdd';
import { expect } from '@std/expect';

import { createSignal } from '@/signal/signal.ts';
import { type WritableSignal } from '@/signal/_api.ts';
import { effect } from '@/signal/effect.ts';

type TestingUser = {
  name: string;
  age: number;
};

describe('signal / createSignal()', () => {
  test('should create a signal with the given initial value', () => {
    const counter = createSignal(0);

    expect(counter()).toBe(0);
  });

  test('should create a signal with the given options', () => {
    const counter = createSignal(0, { id: 'counter', log: true });

    expect(counter()).toBe(0);
  });

  test('should allow to set a new value to a signal', () => {
    const counter = createSignal(0);

    counter.set(1);

    expect(counter()).toBe(1);
  });

  test('should allow to update a signal value', () => {
    const counter = createSignal(0);

    counter.update((value) => value + 1);

    expect(counter()).toBe(1);
  });

  test('should allow to mutate a signal value', () => {
    const counter = createSignal<TestingUser>({ name: 'Alice', age: 42 });

    counter.mutate((value) => {
      value.name = 'Bob';
    });

    expect(counter().name).toBe('Bob');
  });

  test('should create a readonly signal', () => {
    const counter = createSignal(0).readonly();

    expect(counter()).toBe(0);

    const signalFnKeys = Object.keys(counter);
    const writableKeys = signalFnKeys.find((key) =>
      key === 'set' || key === 'update' || key === 'mutate'
    );

    expect(writableKeys).toBeUndefined();
  });

  test('should subscribe to readonly signals', () => {
    const privateCounter = createSignal(0);

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

  test('should allow to use `onChange` hook', () => {
    const called = [] as number[];

    const counter = createSignal(0, {
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

  test('should allow to use computed values', () => {
    const counter = createSignal(0);
    const doubleCounter = () => counter() * 2;

    expect(doubleCounter()).toBe(0);

    counter.set(1);

    expect(doubleCounter()).toBe(2);
  });

  test('should allow to pass signals as params and subscribe to changes', () => {
    const firstName = createSignal('Alice');
    const lastName = createSignal('Smith');

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

  test('should not track changes in untracked blocks', () => {
    const changes: number[] = [];

    const counter = createSignal(0);
    const readonlyCounter = counter.readonly();

    effect(() => {
      changes.push(counter.untracked());
      changes.push(readonlyCounter.untracked());
    });

    counter.set(1);

    expect(changes).toStrictEqual([]);

    counter.set(2);

    expect(changes).toStrictEqual([]);
  });

  test('should have a toString implementation', () => {
    const counter = createSignal(1);
    expect(counter + '').toBe('[Signal: 1]');
  });
});
