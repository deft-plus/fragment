/**
 * @license
 * Copyright Deft+ All Rights Reserved.
 *
 * Use of this source code is governed by an Apache-2.0 license that can be
 * found in the LICENSE file at https://github.com/deft-plus/fragment/blob/latest/LICENCE
 */

import { describe, test } from '@std/testing/bdd';
import { expect } from '@std/expect';
import { defaultEquals, isSignal, markAsSignal } from '@/signal/_api.ts';
import { signal } from '@/signal/mod.ts';

describe('signal / api', () => {
  test('defaultEquals() - should compare two values', () => {
    expect(defaultEquals(1, 1)).toBe(true);
    expect(defaultEquals(1, 2)).toBe(false);
  });

  test('defaultEquals() - should compare two objects', () => {
    const obj1 = { name: 'Alice', age: 42 };
    const obj2 = { name: 'Alice', age: 42 };

    expect(defaultEquals(obj1, obj2)).toBe(false);
  });

  test('isSignal() - should check if a value is a signal', () => {
    const notSignal = 42;
    const validSignal = signal(42);

    expect(isSignal(notSignal)).toBe(false);
    expect(isSignal(validSignal)).toBe(true);
  });

  test('markAsSignal() - should mark a functions as a signal', () => {
    const value = () => 42;
    const signalValue = markAsSignal(value);

    expect(isSignal(signalValue)).toBe(true);
  });
});
