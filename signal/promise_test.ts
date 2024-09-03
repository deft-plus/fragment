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
import { createPromiseSignal } from '@/signal/promise.ts';

describe('signal / createPromiseSignal()', () => {
  test('should create a signal from a promise function', async () => {
    const promise1 = createPromiseSignal(() => delay(10).then(() => 'Hello, World!'));
    const promise2 = createPromiseSignal(delay(10).then(() => 'Hello, World!'));

    expect(promise1()).toStrictEqual({ status: 'pending' });
    expect(promise2()).toStrictEqual({ status: 'pending' });

    await delay(20);

    expect(promise1()).toStrictEqual({ status: 'fulfilled', value: 'Hello, World!' });
    expect(promise2()).toStrictEqual({ status: 'fulfilled', value: 'Hello, World!' });
  });

  test('should return errors rejected by the promise', async () => {
    const promise = createPromiseSignal(() => delay(10).then(() => Promise.reject('Error!')));

    expect(promise()).toStrictEqual({ status: 'pending' });

    await delay(20);

    expect(promise()).toStrictEqual({ status: 'rejected', error: 'Error!' });
  });
});
