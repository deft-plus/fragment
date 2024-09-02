/**
 * @license
 * Copyright Deft+ All Rights Reserved.
 *
 * Use of this source code is governed by an Apache-2.0 license that can be
 * found in the LICENSE file at https://github.com/deft-plus/fragment/blob/latest/LICENCE
 */

import { beforeEach, describe, test } from '@std/testing/bdd';
import { expect, fn } from '@std/expect';

import { Watch, type WatchCallback } from '@/signal/watch.ts';

describe('Watch', () => {
  let watch: Watch;
  let callback: ReturnType<typeof fn>;
  let schedule: ReturnType<typeof fn>;

  beforeEach(() => {
    callback = fn();
    schedule = fn();
    watch = new Watch(callback as WatchCallback, schedule as (watcher: Watch) => void);
  });

  test('should schedule the watch when notified', () => {
    watch.notify();
    expect(schedule).toHaveBeenCalledWith(watch);
  });

  test('should run the callback when notified', () => {
    watch.notify();
    watch.run();
    expect(callback).toHaveBeenCalled();
  });

  test('should not run the callback if dependencies have not changed', () => {
    watch.notify();
    watch.run();
    watch.run();
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
