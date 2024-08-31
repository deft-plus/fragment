/**
 * @license
 * Copyright Deft+ All Rights Reserved.
 *
 * Use of this source code is governed by an Apache-2.0 license that can be
 * found in the LICENSE file at https://github.com/deft-plus/fragment/blob/latest/LICENCE
 */

import { type ReadonlySignal } from '@/signal/_api.ts';
import { createSignal } from '@/signal/signal.ts';

/** The value of a promise. */
export type PromiseValue<T> =
  | { status: 'pending' }
  | { status: 'fulfilled'; value: T }
  | { status: 'rejected'; error: unknown };

/** Creates a signal from a promise function. */
export function createPromiseSignal<T>(
  value: (() => Promise<T>) | Promise<T>,
): ReadonlySignal<PromiseValue<T>> {
  const signal = createSignal<PromiseValue<T>>({ status: 'pending' });

  const promise = value instanceof Promise ? value : value();

  promise
    .then((response) => signal.set({ status: 'fulfilled', value: response }))
    .catch((error) => signal.set({ status: 'rejected', error }));

  return signal.readonly();
}
