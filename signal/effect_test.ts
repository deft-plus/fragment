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
import { effect, resetEffects } from '@/signal/effect.ts';
import { createSignal } from '@/signal/signal.ts';

describe('signal / effect()', () => {
  test('should listen for signal changes and trigger effects', async () => {
    const signal = createSignal(0);
    const changes: number[] = [];

    effect(() => {
      changes.push(signal());
    });

    expect(changes).toEqual([]);

    signal.set(1);

    await delay(1);
    expect(changes).toEqual([1]);

    signal.set(2);

    await delay(1);
    expect(changes).toEqual([1, 2]);
  });

  test('should stop an effect when destroyed', async () => {
    const signal = createSignal(0);
    const changes: number[] = [];

    const effectRef = effect(() => {
      changes.push(signal());
    });

    expect(changes).toEqual([]);

    signal.set(1);

    await delay(1);
    expect(changes).toEqual([1]);

    effectRef.destroy();

    signal.set(2);

    await delay(1);
    expect(changes).toEqual([1]);
  });

  test('should reset all active effects', async () => {
    const signal = createSignal(0);
    const changes: number[] = [];

    effect(() => {
      changes.push(signal());
    });

    expect(changes).toEqual([]);

    signal.set(1);

    await delay(1);
    expect(changes).toEqual([1]);

    resetEffects();

    signal.set(2);

    await delay(1);
    expect(changes).toEqual([1]);
  });
});
