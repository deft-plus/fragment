// Copyright the Deft+ authors. All rights reserved. Apache-2.0 license

import { expect, group, test } from '@fragment/testing';

import { untrackedSignal } from './untracked.ts';
import { signal } from './signal.ts';
import { effect } from './effect.ts';

group('reactive / createUntrackedSignal()', () => {
  test('should not track changes in untracked blocks', () => {
    const changes: number[] = [];

    const counter = signal(0);

    effect(() => {
      changes.push(untrackedSignal(() => counter()));
    });

    counter.set(1);

    expect(changes).toStrictEqual([]);

    counter.set(2);

    expect(changes).toStrictEqual([]);
  });
});
