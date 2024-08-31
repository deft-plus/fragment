/**
 * @license
 * Copyright Deft+ All Rights Reserved.
 *
 * Use of this source code is governed by an Apache-2.0 license that can be
 * found in the LICENSE file at https://github.com/deft-plus/fragment/blob/latest/LICENCE
 */

import { isSignal } from '@/signal/_api.ts';
import { createSignal } from '@/signal/signal.ts';
import { createMemoSignal } from '@/signal/memo.ts';
import { createPromiseSignal } from '@/signal/promise.ts';
import { effect } from '@/signal/effect.ts';

export {
  type ReadonlySignal,
  type Signal,
  type SignalOptions,
  type WritableSignal,
} from '@/signal/_api.ts';

/** Function to create a signal. */
export const signal: SignalFactory = Object.assign(createSignal, {
  isSignal,
  memo: createMemoSignal,
  promise: createPromiseSignal,
  effect,
});

export type SignalFactory = typeof createSignal & {
  isSignal: typeof isSignal;
  memo: typeof createMemoSignal;
  promise: typeof createPromiseSignal;
  effect: typeof effect;
};
