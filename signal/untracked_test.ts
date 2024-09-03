/**
 * @license
 * Copyright Deft+ All Rights Reserved.
 *
 * Use of this source code is governed by an Apache-2.0 license that can be
 * found in the LICENSE file at https://github.com/deft-plus/fragment/blob/latest/LICENCE
 */

import { describe, test } from '@std/testing/bdd';
import { expect } from '@std/expect';

import { createUntrackedSignal } from '@/signal/untracked.ts';
import { createSignal } from '@/signal/signal.ts';
import { effect } from '@/signal/effect.ts';

describe('signal / createUntrackedSignal()', () => {
  test('should not track changes in untracked blocks', () => {
    const changes: number[] = [];

    const counter = createSignal(0);

    effect(() => {
      changes.push(createUntrackedSignal(() => counter()));
    });

    counter.set(1);

    expect(changes).toStrictEqual([]);

    counter.set(2);

    expect(changes).toStrictEqual([]);
  });
});
