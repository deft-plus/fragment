// Copyright the Deft+ authors. All rights reserved. Apache-2.0 license

import { describe, test } from '@std/testing/bdd';
import { expect } from '@std/expect';

import { delay } from '@std/async';

import { signalFromPromise } from './promise.ts';

describe('reactive / signalFromPromise()', () => {
  test('should create a signal from a promise function', async () => {
    const promise1 = signalFromPromise(() => delay(10).then(() => 'Hello, World!'));
    const promise2 = signalFromPromise(delay(10).then(() => 'Hello, World!'));

    expect(promise1()).toStrictEqual({ status: 'pending' });
    expect(promise2()).toStrictEqual({ status: 'pending' });

    await delay(20);

    expect(promise1()).toStrictEqual({ status: 'fulfilled', value: 'Hello, World!' });
    expect(promise2()).toStrictEqual({ status: 'fulfilled', value: 'Hello, World!' });
  });

  test('should return errors rejected by the promise', async () => {
    const promise = signalFromPromise(() => delay(10).then(() => Promise.reject('Error!')));

    expect(promise()).toStrictEqual({ status: 'pending' });

    await delay(20);

    expect(promise()).toStrictEqual({ status: 'rejected', error: 'Error!' });
  });
});
